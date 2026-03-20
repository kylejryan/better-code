---
title: Docker and Podman Error Signatures and Diagnostic Patterns
impact: HIGH
impactDescription: Maps container exit codes, networking failures, and build errors to root causes — eliminates the rebuild-and-pray debugging loop
tags: docker, podman, container, dockerfile, build, network, volume, oom, exit-code
---

## Docker / Podman Diagnostic Reference

Container errors are deceptive because they add a layer of indirection between you and the actual failure. A process crash inside a container looks like a container exit. A DNS failure looks like a connection timeout. A permission error on a volume mount looks like a missing file. This reference teaches you to see through the container layer to the real cause.

### Exit Codes — What They Actually Mean

The exit code is the first thing to check. It's not random.

**Incorrect (restarting the container and hoping it works):**

```dockerfile
# Container keeps dying with exit code 137
# Wrong reaction: "just add restart: always"
# restart: always in docker-compose.yml
# This creates a crash loop — the container OOMs, restarts, OOMs again
```

**Correct (decoding the exit code to identify root cause):**

```bash
# Check the exit code:
docker inspect <container> --format='{{.State.ExitCode}}'
# Or: docker ps -a (shows exit code in STATUS column)

# Exit code reference:
# 0   — Clean exit (success)
# 1   — Application error (check app logs: docker logs <container>)
# 126 — Command not executable (permission issue on entrypoint/cmd)
# 127 — Command not found (binary missing — wrong base image? typo in CMD?)
# 128+N — Killed by signal N:
#   137 (128+9)  — SIGKILL: OOM killed or docker stop timeout exceeded
#   143 (128+15) — SIGTERM: graceful shutdown requested (docker stop)
#   139 (128+11) — SIGSEGV: segfault in the application
# 255 — Exit status out of range (usually means the app exited with -1)

# For exit code 137 (OOM):
docker inspect <container> --format='{{.State.OOMKilled}}'
# If true: increase memory limit or fix the memory leak
# If false: something else sent SIGKILL (docker stop with short timeout)

# For exit code 1 (app error): the answer is ALWAYS in the logs
docker logs <container> --tail 100
docker logs <container> --since 5m  # Last 5 minutes of logs
```

### Build Failures

**Incorrect (disabling cache and rebuilding from scratch every time):**

```dockerfile
# "It worked yesterday, let me just --no-cache"
# docker build --no-cache .
# This is slow and doesn't explain WHY it broke

# Common mistake: COPY before dependency install (cache-busting)
FROM node:20
COPY . .                  # ANY file change invalidates this layer
RUN npm install           # Reinstalls ALL deps on every code change
```

**Correct (understanding the layer cache and fixing the actual issue):**

```dockerfile
# Layer cache rule: if a layer changes, ALL subsequent layers rebuild
# Fix: copy dependency files first, install, then copy code

FROM node:20
WORKDIR /app
COPY package.json package-lock.json ./   # Only changes when deps change
RUN npm ci                               # Cached unless package*.json changed
COPY . .                                 # Code changes only rebuild from here
RUN npm run build

# Diagnostic: build with progress output to see which layer fails
# docker build --progress=plain .
# DOCKER_BUILDKIT=1 docker build --progress=plain . 2>&1 | tee build.log

# Multi-stage build failures: check which stage fails
# docker build --target=builder .   # Build only up to a specific stage
```

### Networking Issues

**Symptoms:** connection refused, DNS resolution failure, can't reach other containers, host.docker.internal not resolving.

**Incorrect (switching to host networking without understanding the issue):**

```yaml
# "Just use network_mode: host" — this breaks container isolation
# and doesn't fix DNS issues between containers
services:
  app:
    network_mode: host  # DON'T — this is a sledgehammer
```

**Correct (diagnosing the actual networking layer):**

```bash
# Step 1: Can the container resolve DNS?
docker exec <container> nslookup <target-hostname>
# If this fails: DNS is the issue, not connectivity

# Step 2: Can the container reach the target?
docker exec <container> curl -v http://<target>:<port>/health
# -v shows connection details including DNS resolution and TCP connection

# Step 3: Are the containers on the same network?
docker network inspect <network-name>
# Both containers must be on the same Docker network to communicate by name

# Common root causes:
# - Containers on different networks (docker-compose creates a default network
#   per project — containers in different projects can't see each other)
# - Using 'localhost' instead of container name (localhost inside a container
#   is the container itself, not the host)
# - Port not exposed vs not published:
#   EXPOSE 8080        → other containers can reach it (within same network)
#   -p 8080:8080       → host machine can reach it
# - Host access from container:
#   Docker Desktop: host.docker.internal
#   Linux Docker: --add-host=host.docker.internal:host-gateway (Docker 20.10+)
```

### Volume and Permission Errors

**Symptoms:** permission denied on mounted files, empty volume mounts, files created as root.

**Incorrect (running everything as root):**

```dockerfile
# "Just remove the USER directive" — security risk
# Or: chmod 777 — never do this
RUN chmod -R 777 /app  # NEVER — this is a security vulnerability
```

**Correct (understanding the UID/GID mapping):**

```dockerfile
# The container process UID must match the volume file ownership

# Diagnostic: check who owns the files on both sides
# Host:       ls -la /path/to/mounted/dir
# Container:  docker exec <container> ls -la /mounted/path
# Container:  docker exec <container> id   (shows UID/GID of running process)

# Fix: match the container user to the host user's UID
FROM node:20
ARG UID=1000
ARG GID=1000
RUN groupmod -g $GID node && usermod -u $UID -g $GID node
USER node

# Build with your host UID:
# docker build --build-arg UID=$(id -u) --build-arg GID=$(id -g) .

# Podman-specific: rootless Podman uses UID mapping
# podman unshare cat /proc/self/uid_map  — shows the mapping
# Podman volumes may need :Z or :z for SELinux labels:
# podman run -v /host/path:/container/path:Z myimage
```

### Podman-Specific Differences

```bash
# Podman is mostly Docker-compatible but key differences:

# 1. Socket location
# Docker: /var/run/docker.sock
# Podman: /run/user/$(id -u)/podman/podman.sock (rootless)

# 2. Rootless networking
# Podman rootless can't bind to ports < 1024 without configuration
# Fix: sysctl net.ipv4.ip_unprivileged_port_start=80

# 3. SELinux volume labels (Podman on Fedora/RHEL)
# Permission denied on volume mount? Add :Z (private) or :z (shared)
# podman run -v ./data:/data:Z myimage

# 4. Docker Compose compatibility
# Use podman-compose or: podman compose (with compose plugin)
# Set DOCKER_HOST=unix:///run/user/$(id -u)/podman/podman.sock
```

### Key Diagnostic Commands

```bash
# Container state
docker logs <container> --tail 200      # Recent logs (ALWAYS check first)
docker inspect <container>               # Full container config and state
docker stats <container>                 # Live resource usage (CPU, memory, I/O)
docker top <container>                   # Running processes inside container
docker exec -it <container> sh           # Shell into running container

# Build
docker build --progress=plain .          # Verbose build output
docker history <image>                   # Show layers and sizes
docker image inspect <image>             # Full image metadata

# Networking
docker network ls                        # List networks
docker network inspect <network>         # Show connected containers
docker port <container>                  # Show port mappings

# Cleanup (when disk is full)
docker system df                         # Show disk usage
docker system prune                      # Remove unused data (careful!)
docker volume ls -f dangling=true        # Find orphaned volumes
```
