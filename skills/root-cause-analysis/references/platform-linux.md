---
title: Linux System Error Signatures and Diagnostic Patterns
impact: HIGH
impactDescription: Maps kernel messages, permission errors, networking failures, and process issues to root causes — the system-level diagnostics that application-level debugging can't see
tags: linux, strace, permissions, networking, systemd, filesystem, process, oom, kernel, selinux
---

## Linux System Diagnostic Reference

When application-level debugging hits a wall, the answer is often at the system level. A "connection refused" in your app might be iptables. A "file not found" might be a mount that didn't complete. A random process death might be the OOM killer. This reference covers the system-level diagnostics that reveal root causes invisible to application logs.

### strace — The Universal Debugger

When you have no idea what's going wrong, strace shows you EXACTLY what system calls a process makes. This is the most powerful Linux diagnostic tool.

**Incorrect (guessing what system calls the application makes):**

```bash
# "The app says file not found but the file is right there"
# Wrong: staring at the code trying to figure out which path it's using
ls -la /etc/myapp/config.yaml  # "The file exists! Why can't the app find it?"
```

**Correct (using strace to see exactly what the process does):**

```bash
# strace shows every system call — you see EXACTLY which path it tried
strace -f -e trace=openat,stat ./myapp 2>&1 | grep config
# Output: openat(AT_FDCWD, "/etc/myapp/config.yml", O_RDONLY) = -1 ENOENT
#          ↑ It's looking for .yml not .yaml!

# Common strace patterns:
strace -f -p <pid>                          # Attach to running process (-f follows forks)
strace -f -e trace=network ./myapp          # Network calls only
strace -f -e trace=file ./myapp             # File access only
strace -f -e trace=openat ./myapp 2>&1 | grep EACCES  # Permission denied calls
strace -c ./myapp                           # Summary: which syscalls take the most time

# Key error codes in strace output:
# ENOENT     — file/directory doesn't exist (check the EXACT path it tried)
# EACCES     — permission denied (check file permissions, SELinux, capabilities)
# ECONNREFUSED — nothing listening on that port
# ETIMEDOUT  — connection timed out (firewall? network? slow service?)
# EMFILE     — too many open files (file descriptor limit reached)
# ENOMEM     — out of memory
```

### Permission Errors (Beyond Basic File Permissions)

`Permission denied` has multiple possible sources. Basic file permissions are just the first layer.

**Incorrect (chmod 777 to "fix" permissions):**

```bash
# "Permission denied? chmod 777!"
chmod -R 777 /var/myapp  # NEVER — this is a security vulnerability
# AND it might not fix the problem if the cause is SELinux, capabilities, or namespaces
```

**Correct (systematic permission debugging):**

```bash
# Layer 1: Traditional Unix permissions
ls -la /path/to/file
# Check: owner, group, permissions, and whether the process runs as the right user
# Check: directory permissions too! You need +x on every directory in the path
namei -l /path/to/file  # Shows permissions for EVERY component of the path

# Layer 2: SELinux (RHEL/Fedora/CentOS)
getenforce                        # Is SELinux enforcing?
ausearch -m AVC --start recent    # Recent SELinux denials
# SELinux denial looks like normal EACCES but ls -la shows correct permissions
# Fix: set the correct context, don't disable SELinux
chcon -R -t httpd_sys_content_t /var/www  # Set correct SELinux type
# Or create a policy from the audit log:
ausearch -m AVC --start recent | audit2allow -M mypolicy
semodule -i mypolicy.pp

# Layer 3: AppArmor (Ubuntu/Debian)
aa-status                         # Show AppArmor profiles
journalctl | grep apparmor        # Recent AppArmor denials

# Layer 4: Linux capabilities
# Process needs CAP_NET_BIND_SERVICE to bind port < 1024
# Process needs CAP_SYS_ADMIN for certain mount operations
getpcaps <pid>                    # Show capabilities of a process
# Grant specific capability instead of running as root:
setcap cap_net_bind_service+ep /usr/bin/myapp

# Layer 5: Mount options
mount | grep /path                # Check if mounted with noexec, nosuid, or ro
# A noexec mount prevents running binaries even with +x permission
```

### Process and OOM Issues

**Symptoms:** process disappears, exit code 137, system becomes unresponsive then recovers.

**Incorrect (just restarting the process):**

```bash
# Process keeps dying. "Must be a bug — just restart it."
# Wrong: systemctl restart myapp  (without investigating WHY it died)
```

**Correct (checking if the OOM killer is responsible):**

```bash
# Step 1: Was it OOM killed?
dmesg | grep -i "oom\|killed process"
# Output: "Out of memory: Killed process 12345 (myapp) total-vm:2048000kB"
# This tells you EXACTLY which process was killed and its memory usage

journalctl -k | grep -i oom      # Same info from journald

# Step 2: Current memory state
free -h                           # Overall memory (look at "available", not "free")
cat /proc/<pid>/status | grep -i vm  # Memory of specific process
# VmRSS: actual physical memory used (resident set size)
# VmSize: virtual memory allocated (can be much larger — not all mapped to RAM)

# Step 3: Which process is using the most memory?
ps aux --sort=-%mem | head -20    # Top memory consumers

# Step 4: Is it a leak or legitimate usage?
# Watch memory over time:
while true; do
    ps -o pid,rss,vsz,comm -p <pid>
    sleep 10
done
# If RSS grows continuously without plateau, it's a leak

# Fix: set memory limits to contain the blast radius
# systemd: MemoryMax=2G in the service unit
# Docker: --memory=2g
# Kubernetes: resources.limits.memory: "2Gi"
# cgroup: echo 2G > /sys/fs/cgroup/memory/myapp/memory.limit_in_bytes
```

### Networking Diagnostics

**Incorrect (restarting the networking service):**

```bash
# "Network isn't working" → systemctl restart networking
# This might fix the symptom temporarily but doesn't explain the cause
# AND it disrupts all other connections on the machine
```

**Correct (layered network diagnosis):**

```bash
# Layer 1: Is the interface up?
ip addr show                      # Network interfaces and IPs
ip link show                      # Interface state (UP/DOWN)

# Layer 2: Can you reach the gateway?
ip route show                     # Routing table
ping -c 3 <gateway-ip>           # Basic connectivity

# Layer 3: DNS resolution
cat /etc/resolv.conf              # DNS servers configured
dig <hostname>                    # DNS lookup (more detail than nslookup)
dig @8.8.8.8 <hostname>          # Try a known-good DNS server

# Layer 4: Port connectivity
ss -tlnp                          # What's LISTENING (replaces netstat)
# -t: TCP, -l: listening, -n: numeric (fast), -p: show process
ss -tnp                           # Established connections
curl -v telnet://<host>:<port>    # Test TCP connectivity with timing

# Layer 5: Firewall
iptables -L -n -v                 # List iptables rules (legacy)
nft list ruleset                  # List nftables rules (modern)
# Check: is there a DROP or REJECT rule matching your traffic?

# Layer 6: SELinux network restrictions
# SELinux can block network connections even if iptables allows them
sesearch -A -s httpd_t -t port_type -c tcp_socket -p name_connect
# Shows which ports the httpd process is allowed to connect to

# Quick connectivity test matrix:
# Can ping?     → L3 (IP) works
# Can't ping?   → Routing, firewall, or interface issue
# Can TCP?      → L4 (TCP) works, service is listening
# Can't TCP?    → Service not running, wrong port, or firewall
# Can HTTP?     → L7 (application) works
# Can't HTTP?   → Application error, TLS issue, or proxy config
```

### systemd Service Debugging

**Incorrect (reading only the last line of journalctl):**

```bash
# "Service failed to start" — just reads the last log line
systemctl status myapp  # Shows "Active: failed" — not enough info
```

**Correct (full systemd diagnostic):**

```bash
# Step 1: Full logs for the service (not just status)
journalctl -u myapp --since "10 minutes ago" --no-pager
# Shows ALL log output including startup errors

# Step 2: Check the unit file for configuration issues
systemctl cat myapp                 # Show the actual unit file
systemd-analyze verify myapp.service  # Check for unit file errors

# Step 3: Common systemd failure modes:
# - ExecStart path wrong: "myapp.service: Failed to execute command"
#   Check: which myapp, is the path absolute in the unit file?
# - Working directory missing: "Failed to change to directory"
#   Check: does WorkingDirectory exist?
# - User doesn't exist: "Failed to determine user/group"
#   Check: User= and Group= in unit file
# - Start rate limit: "Start request repeated too quickly"
#   The service crashed and restarted too many times
#   journalctl -u myapp (read the FIRST failure, not the rate limit message)

# Step 4: Dependency ordering issues
systemd-analyze critical-chain myapp.service  # Show startup dependency chain
# Is the service starting before its dependencies are ready?
# (e.g., starting before the database is listening)
```

### Filesystem Issues

```bash
# Disk full (ENOSPC):
df -h                             # Filesystem usage (by space)
df -i                             # Inode usage (can be full even with free space!)
du -sh /var/log/* | sort -rh | head  # Largest directories

# File descriptor exhaustion (EMFILE "too many open files"):
ulimit -n                         # Current limit
cat /proc/<pid>/fd | wc -l        # Open FDs for a process
ls -la /proc/<pid>/fd             # What files are open
lsof -p <pid> | wc -l             # Same, with more detail
# Fix: ulimit -n 65536 (temporary) or edit /etc/security/limits.conf (permanent)

# Mount issues:
mount | grep <path>               # Is it mounted? With what options?
findmnt                           # Tree view of all mounts
lsblk                             # Block devices and their mount points
```

### Key Diagnostic Commands Summary

```bash
# Universal process debugging
strace -f -p <pid>               # System calls (the ultimate debugger)
lsof -p <pid>                    # Open files, sockets, pipes
/proc/<pid>/status               # Process memory, state, capabilities
/proc/<pid>/environ              # Environment variables (null-separated)

# System state
dmesg --follow                   # Kernel messages (OOM, hardware, drivers)
journalctl -f                    # All systemd journal (live follow)
uptime                           # Load average (1/5/15 min)
vmstat 1                         # CPU, memory, I/O, swap (every 1 second)

# Performance
perf top                         # Live CPU profiling
perf record -g -p <pid>          # Record profile with call graphs
iostat -x 1                      # Disk I/O per device
iotop                            # I/O by process (like top for disk)
```
