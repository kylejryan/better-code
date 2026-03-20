---
name: root-cause-analysis
description: "Use this skill when debugging software issues, performing root cause analysis, triaging errors from logs or alerts, or investigating why code isn't working as expected. Triggers when the user shares an error message, stack trace, log output, failing test, unexpected behavior, crash report, performance degradation, or says things like 'this isn't working,' 'I'm getting an error,' 'help me debug,' 'why is this failing,' 'something broke,' or 'I can't figure out what's wrong.' Also use when the user has been going back and forth trying fixes that aren't working — this is the signal to stop guessing and start systematically diagnosing. Do NOT use for writing new code from scratch, general code review, or feature development unless a bug is involved."
license: MIT
metadata:
  author: kylejryan
  version: "1.0.0"
  organization: kylejryan
  date: March 2026
  abstract: Systematic root cause analysis methodology that eliminates shotgun debugging. Enforces a disciplined diagnostic process — gather evidence, read the full error, form a single testable hypothesis, verify before fixing, and address the root cause rather than symptoms. Includes bug class playbooks for null references, type errors, dependency issues, network failures, race conditions, performance problems, environment mismatches, and build failures.
---

# Root Cause Analysis

*Stop guessing, start diagnosing.*

## Why This Exists

The default debugging behavior is shotgun debugging: see an error, pattern-match to the most common cause from training data, suggest a fix, and if it doesn't work, suggest another fix. This creates a frustrating loop where the user tries fix after fix while the actual root cause remains undiagnosed.

This skill enforces systematic diagnosis. The goal is to identify the ACTUAL root cause on the first pass, not to iterate through possible causes hoping one sticks. Every debugging session should narrow the problem space with each step, not randomly sample it.

The fundamental discipline: **understand before you fix.** A fix applied without understanding why it works is not a fix — it's a coincidence that will break again.

## The Anti-Patterns to Avoid

Before the methodology, internalize what NOT to do — these are the specific failure modes that make LLM debugging frustrating:

<anti_patterns>
**Premature diagnosis.**
Reading an error message and immediately jumping to "the problem is X, try Y." The error message is a symptom, not a diagnosis. Multiple different root causes can produce identical error messages. Never diagnose from the error message alone — diagnose from the error message + the code path + the execution context + what changed.

**Shotgun suggestions.**
"Try A. If that doesn't work, try B. If that doesn't work, try C." This is not debugging — it's guessing with extra steps. Each suggestion should be a deliberate hypothesis with a clear reason for testing it NEXT, based on what you've already eliminated.

**Training data pattern matching.**
"This error usually means X" is the most dangerous sentence in LLM debugging. That error means X in the most common Stack Overflow scenario — but the user's codebase, configuration, and context are not the most common scenario. Read THIS code, not the average of all code you've ever seen.

**Fixing symptoms instead of causes.**
Adding a try/catch around a NullPointerException instead of figuring out why the value is null. Adding a retry loop around a connection failure instead of figuring out why the connection is failing. Wrapping a race condition in a mutex instead of understanding why the race exists. Symptom fixes create tech debt and hide the real problem.

**Assuming the user's diagnosis.**
When the user says "I think the problem is in the database connection," don't immediately investigate the database connection. The user is telling you their hypothesis, which may be wrong. Acknowledge it as a hypothesis and verify it before committing to that investigation path.

**Not reading the FULL error.**
Stack traces have multiple frames. Log output has context before and after the error. Error messages have details after the main message. Read ALL of it. The root cause is often in frame 5 of the stack trace, not frame 1. The relevant log line is often 10 lines BEFORE the error, not the error line itself.

**Changing multiple things at once.**
Every debugging step should change ONE thing and observe the result. If you suggest changing three things and the bug disappears, nobody knows which change fixed it — or if the "fix" just masked the symptom. Scientific method: one variable at a time.
</anti_patterns>

## The Diagnostic Method

### Phase 1: Gather Before You Reason

Before forming ANY hypothesis, collect information. The quality of the diagnosis is bounded by the quality of the information gathered.

<gathering>
**What you need before you can diagnose:**

1. **The exact error.** Not "it's not working" — the full error message, complete stack trace, exit code, HTTP status, or observable symptom. Copy-paste, not paraphrase. If the user paraphrases, ask for the exact output.

2. **The reproduction context.** What did the user do immediately before the error? What command, what input, what sequence of actions? Can they reproduce it consistently, or is it intermittent? Intermittent bugs have different root causes than deterministic ones (concurrency, timing, resource exhaustion, external dependencies).

3. **What changed.** The single most powerful debugging question: "What changed since it last worked?" New code deployed? Dependency updated? Configuration changed? Environment changed? OS updated? If nothing the user explicitly changed is the cause, then something IMPLICITLY changed — an expired certificate, a rotated secret, a dependency's transitive dependency updating, disk space filling up, a DNS record changing.

4. **The relevant code.** Not all the code — the specific code path that the error is occurring in. Trace from the stack trace to the source. If there's no stack trace, identify the entry point and the expected flow.

5. **The environment.** Language version, OS, framework version, relevant dependency versions, local vs CI vs production, container vs bare metal. Version mismatches between environments are a massive source of "works on my machine" bugs.

6. **What they've already tried.** This is critical — it tells you which hypotheses have already been eliminated AND whether any of the "fixes" they've tried have inadvertently changed the problem. Ask explicitly: "What have you already tried?"

**If the user hasn't provided all of this, ask for what's missing BEFORE diagnosing.** It is vastly more efficient to gather information upfront than to iterate through hypotheses blind. Frame requests specifically: not "can you share more details?" but "can you paste the full stack trace?" or "what changed since this last worked?"
</gathering>

### Phase 2: Read the Error — All of It

Now parse every piece of information the error gives you, systematically.

<reading_errors>
**Stack traces — read bottom to top for cause, top to bottom for location.**

The top of the stack trace is where the error manifested — the symptom location. The bottom of the stack trace (or the "Caused by" chain) is closer to the root cause. The frame where the code transitions from library/framework code to user code is usually the most informative — that's where the user's code made the call that eventually failed.

```
Example: java.lang.NullPointerException
    at com.app.service.UserService.getProfile(UserService.java:47)     ← symptom
    at com.app.controller.UserController.profile(UserController.java:23) ← user's call
    at org.spring.framework.web.servlet.FrameworkServlet.service(...)    ← framework
    at javax.servlet.http.HttpServlet.service(...)                       ← framework
```

The interesting frame is UserController.java:23 — that's where the user's code called getProfile() with a null argument or on a null reference. UserService.java:47 tells you WHERE the null was dereferenced, but not WHY it was null.

**Log context — read backwards from the error.**

The lines BEFORE the error are usually more informative than the error itself. They show the sequence of events leading to the failure:
- Did a previous operation return an unexpected result?
- Did a connection drop before the failing operation?
- Did authentication succeed or was the session invalid?
- Did a timeout occur on a dependency call?
- Was there a warning that was ignored?

Read at least 20-50 lines before the error. If the user only shared the error line, ask for surrounding context.

**Error message parsing — extract every structured detail.**

Error messages often contain embedded information:
- File paths (which file was being accessed when it failed?)
- URLs (which endpoint was being called?)
- Variable values (what was the actual value vs expected?)
- Error codes (what specific condition triggered the error? Look up the code.)
- Timestamps (when did this happen relative to other events?)
- Request/trace IDs (can you correlate to other log entries?)

Don't skim the error message — parse it like structured data. Every token is a clue.

**Compiler/build errors — the first error matters most.**

When there are multiple compilation errors, fix the FIRST one first. Cascading failures mean errors 2-N are often caused by error 1. A missing import causes dozens of "symbol not found" errors; fixing the import fixes them all. Never try to fix error 15 of 30 independently.
</reading_errors>

### Phase 3: Form a Hypothesis — ONE Hypothesis

Based on what you've gathered and read, form a single, specific hypothesis about the root cause.

<hypothesis>
**A good hypothesis is:**
- Specific: "The `user` variable is null at line 47 because the database query at line 38 returns null when the user ID doesn't exist, and there's no null check before calling getProfile()" — not "something is null."
- Testable: There is a concrete way to confirm or refute it. "If I add a log statement at line 38, I should see the query returning null for this user ID."
- Derived from evidence: Every element of the hypothesis traces back to something in the error output, logs, or code. If you can't point to the evidence, you're guessing.

**Forming the hypothesis:**

1. Start from the symptom: what exactly went wrong?
2. Trace backward: what code path led to this symptom?
3. Identify the deviation: at what point did the code's actual behavior diverge from its expected behavior?
4. Propose the cause: why did it deviate at that point?

The deviation point is the root cause location. The cause of the deviation is the root cause.

**Present the hypothesis explicitly:**
"Based on the stack trace, the NullPointerException occurs at UserService.java:47 when accessing user.getEmail(). The user object comes from the database query at line 38. My hypothesis is that the query returns null for user IDs that don't exist in the database, and the code path from the controller doesn't check for null before calling getProfile(). This would mean the bug was introduced when the delete-user feature was added, because now user IDs can reference deleted users."

This is verifiable, specific, and traceable. The user understands the reasoning and can confirm or refute parts of it.
</hypothesis>

### Phase 4: Verify, Don't Fix

Before suggesting a fix, verify the hypothesis. This is the step most debugging skips — and it's the step that prevents the "I applied the fix but it didn't work" loop.

<verification>
**Verification strategies, ranked by speed:**

1. **Code reading.** Can you confirm the hypothesis by reading the code path? Trace the variable from its origin to the failure point. Does the code actually behave the way the hypothesis claims? This is the fastest verification — no execution required.

2. **Log inspection.** Do existing logs confirm or refute the hypothesis? If the hypothesis is "the database query returns null," is there a log line showing the query result? Is there a log line showing the input that led to the failing path?

3. **Targeted diagnostic.** If existing information isn't sufficient, suggest ONE specific diagnostic action:
   - Add a single log statement or print at the suspected deviation point
   - Run the failing case with a debugger breakpoint at the suspected location
   - Run the specific test case in isolation with verbose output
   - Check the database/cache/external service state directly
   - Run with increased log verbosity for the relevant module

   The diagnostic must be targeted: "Add a log at line 38 showing the return value of findById()" — not "add logging everywhere and see what happens."

4. **Minimal reproduction.** Can the bug be reproduced in a smaller context? Strip away everything unrelated and reproduce the failure with the minimum code/input/configuration. Minimal reproductions isolate the cause by eliminating confounders.

**After verification, one of two outcomes:**

- **Hypothesis confirmed:** You now understand the root cause. Proceed to Phase 5 (fix).
- **Hypothesis refuted:** The evidence doesn't support the hypothesis. This is VALUABLE — you've eliminated a possibility and narrowed the problem space. Return to Phase 3 with the new information and form the next hypothesis.

Never propose a fix for an unverified hypothesis. "I think the problem might be X, so try Y" is a gamble. "I've confirmed the problem is X, so the fix is Y" is engineering.
</verification>

### Phase 5: Fix the Root Cause

Now — and only now — propose a fix. The fix must address the ROOT CAUSE, not the symptom.

<fixing>
**Root cause fix vs symptom fix:**

| Symptom Fix (avoid) | Root Cause Fix (do this) |
|---|---|
| Add try/catch around the NPE | Add null check at the query result and handle the "user not found" case explicitly |
| Increase timeout to 60s | Fix the N+1 query causing the slow response |
| Add retry loop on connection failure | Fix the connection pool exhaustion from leaked connections |
| Add sleep(100ms) before the failing call | Fix the race condition with proper synchronization |
| Downgrade the library version | Fix the API usage that's incompatible with the new version |
| Catch and swallow the exception | Fix the condition that causes the exception |

**The fix proposal must include:**

1. **What to change.** Specific code change with file, function, and what the new code should look like.
2. **Why this fixes the root cause.** Trace the logic: "This null check at line 38 prevents the null user object from reaching getProfile(), and instead returns a 404 to the caller, which is the correct behavior for a deleted user."
3. **What edge cases to consider.** Does the fix handle all the paths that lead to this failure, or just the one the user hit? Are there other callers of the same code path that might also need updating?
4. **How to verify the fix.** Specific test case or validation step: "After applying this fix, calling GET /users/deleted-user-id should return 404 instead of 500."

**One change at a time.** If the root cause analysis reveals multiple issues, fix them in separate steps. Each fix should be independently verifiable. If you bundle three fixes and the bug persists, you don't know which fixes were correct and which were irrelevant.
</fixing>

## Bug Class Playbooks

Different categories of bugs have different diagnostic patterns. Recognize the category early and apply the right playbook.

<bug_playbooks>
### Null / Undefined / None Reference

**Symptoms:** NullPointerException, TypeError: Cannot read property of undefined, AttributeError: 'NoneType', segfault at address 0x0

**Diagnostic path:**
1. Identify the exact variable that's null (from stack trace / error)
2. Trace backward to where that variable was assigned — what expression produced null?
3. Common origins: database query with no result, map/dict lookup with missing key, optional parameter with no default, deserialized data missing a field, async operation that hasn't completed yet, function returning null on error instead of throwing
4. Check: is this variable SUPPOSED to be nullable here? If yes, add proper null handling. If no, fix the upstream code that allows the null to reach this point.

### Type Errors / Type Mismatches

**Symptoms:** TypeError, ClassCastException, "expected X got Y", schema validation failures, JSON parse errors

**Diagnostic path:**
1. What type was expected? What type was received? The error message usually says both.
2. Where did the wrong type come from? Trace the value to its origin.
3. Common origins: API response shape changed, database schema doesn't match model, serialization/deserialization mismatch, string vs number confusion (JS especially: "5" + 3 = "53"), Python 2→3 string/bytes confusion, JSON null vs missing key
4. Check version: did an API, schema, or dependency change that altered the data shape?

### Import / Module / Dependency Errors

**Symptoms:** ModuleNotFoundError, ImportError, "Cannot find module", unresolved dependency, version conflict

**Diagnostic path:**
1. Is the package installed? Check package manager (pip list, npm ls, cargo tree)
2. Is it installed in the RIGHT environment? Virtual env, container, CI, correct Node version
3. Version conflict? Two dependencies requiring incompatible versions of a shared dependency. Check the full dependency tree.
4. Circular import? Module A imports B which imports A. Check import chains.
5. Path issue? Module exists but isn't on the search path. Check PYTHONPATH, NODE_PATH, module resolution config.
6. Name collision? A local file/folder with the same name as a package, shadowing the import.

### Connection / Network Errors

**Symptoms:** ConnectionRefused, ConnectionTimeout, ECONNRESET, DNS resolution failure, SSL/TLS errors, HTTP 502/503/504

**Diagnostic path:**
1. Is the target service actually running? Check process, container status, health endpoint.
2. Is it reachable? Can you ping/curl from the same network context where the error occurs?
3. DNS resolving correctly? Is the hostname resolving to the expected IP?
4. Port open? Firewall rules, security groups, network policies blocking the connection?
5. SSL/TLS: certificate expired? Hostname mismatch? CA not trusted? TLS version mismatch?
6. Connection pool: is the pool exhausted from leaked connections? Check active connection count.
7. Timeout: is the target service responding slowly? Is the timeout configured too low? Is the request hitting a slow query or external dependency?

### Race Conditions / Concurrency Bugs

**Symptoms:** intermittent failures, "works sometimes," data corruption, deadlocks, results that depend on timing, test flakiness

**Diagnostic path:**
1. Is the failure intermittent? If it fails consistently, it's probably not a race condition.
2. Does it fail more under load? Concurrency bugs often surface only when parallel execution increases.
3. Identify the shared mutable state. What data is being read and written by multiple threads/goroutines/async tasks?
4. Identify the unprotected critical section. Where is the code that modifies shared state without synchronization?
5. Classic pattern: check-then-act without atomicity. "If the row doesn't exist, insert it" — but between the check and the insert, another thread inserts it first.
6. For async/await bugs: are you awaiting everything that needs to be awaited? Missing `await` is the async equivalent of a data race.

### Performance / Timeout / OOM

**Symptoms:** slow response, timeout errors, OOM killed, high CPU/memory usage, request queue buildup

**Diagnostic path:**
1. Is it sudden or gradual? Sudden = probably a code change or traffic spike. Gradual = probably a leak or growing dataset hitting a bad algorithm.
2. Identify the bottleneck: CPU-bound (computation), memory-bound (allocation), I/O-bound (disk/network), or lock contention?
3. For slow queries: check the query plan (EXPLAIN). Missing index? Full table scan? N+1 query pattern (one query per item in a list instead of one batch query)?
4. For memory: is memory growing over time (leak)? Check for unclosed resources, growing caches without eviction, accumulating event listeners, large objects held by closures.
5. For CPU: profile. Is one function consuming disproportionate time? Is it an O(n²) algorithm hitting a large n?
6. For I/O: is the service making more external calls than expected? Are connections being reused or created fresh each time?

### "Works on My Machine"

**Symptoms:** code works locally but fails in CI, staging, or production

**Diagnostic path:**
1. Environment differences: language/runtime version, OS, architecture (x86 vs ARM), filesystem (case-sensitive vs insensitive)
2. Configuration differences: env vars, config files, secrets, feature flags
3. Data differences: different database content, different test data, different file system state
4. Dependency differences: different installed versions (lock file not committed? local dev deps not in prod?)
5. Network differences: different DNS, different firewall rules, different access to external services
6. Timing differences: local is fast (same machine), prod has network latency. Local has one user, prod has concurrent users.
7. Permission differences: local runs as admin/root, CI/prod runs as restricted user

### Build / Compilation Failures

**Symptoms:** compile errors, link errors, build script failures, type check failures

**Diagnostic path:**
1. Fix the FIRST error only. Cascading failures mean most errors are consequences of the first one.
2. Did the build work before? What changed? (git diff, dependency update, config change)
3. Clean build: stale cached artifacts from a previous build causing conflicts? Try a clean build (rm -rf node_modules && npm install, cargo clean && cargo build, etc.)
4. Dependency resolution: lock file out of sync with manifest? Run the package manager's install/update and check the diff.
5. Toolchain version: did the compiler, linter, or type checker update? Check CI config vs local versions.
</bug_playbooks>

## Multi-Step Debugging for Stubborn Bugs

When the initial diagnosis doesn't solve it, or the user has been going back and forth on a bug, escalate to a systematic narrowing approach.

<systematic_narrowing>
**The Binary Search Method**

When you can't identify the root cause from reading code and logs alone, systematically halve the problem space:

1. **Isolate the layer.** Is the bug in the frontend, the API, the business logic, the data layer, or the infrastructure? Add a diagnostic at each layer boundary and identify which layer is producing incorrect output from correct input.

2. **Isolate the change.** If the code used to work, use git bisect (or manual binary search through commits) to find the exact commit that introduced the failure. This immediately narrows from "somewhere in the codebase" to "in this specific diff."

3. **Isolate the input.** Does the bug happen with all inputs or specific ones? Systematically simplify the input until you find the minimal input that triggers the failure. If it only fails for user ID "abc-123" but works for "def-456," the difference between those inputs contains the cause.

4. **Isolate the environment.** Does it fail in all environments or just one? Compare the failing environment's configuration, versions, and state to a working one. The difference is the cause.

**The Rubber Duck Escalation**

When stuck, explain the bug out loud (or in writing) from scratch:
1. "The system is supposed to do X."
2. "Instead, it does Y."
3. "The data enters at point A with value V."
4. "At point B, the data is still correct / becomes incorrect."
5. "Therefore, the deviation occurs between A and B."

This forced articulation often reveals assumptions that haven't been examined. If you can't clearly state what the system is SUPPOSED to do, that's the first problem to fix — you can't debug behavior you can't define.

**When to Start Over**

If you've made 3+ fix attempts that didn't resolve the issue:
1. STOP suggesting fixes.
2. Re-gather information. The problem may have changed due to previous fix attempts.
3. Re-read the error from scratch — don't carry forward assumptions from the previous investigation.
4. Consider that the user's description of the problem may not match the actual problem. Ask them to demonstrate the failure step by step.
5. Consider that multiple bugs may be interacting. Fix attempts for bug A may have revealed bug B.
</systematic_narrowing>

## Working With the User

<user_interaction>
**Ask specific questions, not open-ended ones.**
Bad: "Can you share more details?"
Good: "Can you paste the full stack trace?"
Good: "What's the output of `pip list | grep requests`?"
Good: "Does this fail every time, or only sometimes?"

**Explain your reasoning as you go.**
Don't just say "try X." Say "I suspect the issue is A because of B in the error output. To verify, let's check C. If C confirms A, the fix is X." The user should understand the diagnostic logic so they can debug similar issues independently in the future.

**Don't ignore what they've already tried.**
If the user says "I already tried reinstalling the dependency," don't suggest reinstalling the dependency. Acknowledge what they've tried, incorporate it as eliminated hypotheses, and investigate the NEXT most likely cause.

**If you need code or logs you don't have, ask before guessing.**
"I'd need to see the code at UserService.java around line 38-50 to verify this hypothesis. Can you share that?" is infinitely better than guessing what the code looks like based on the function name.

**Distinguish between "I know the cause" and "I'm investigating."**
If you're confident in the diagnosis: "The root cause is X. Here's the fix."
If you're narrowing the problem: "I have a hypothesis: X. Let's verify it with Y before applying a fix."
Never present an unverified hypothesis with the confidence of a diagnosis.

**When the user is frustrated and wants a quick fix:**
Acknowledge the frustration, but don't let it shortcut the process. "I understand this is blocking you — let me focus on the most likely cause first so we fix it in one shot instead of going back and forth." A correct fix on the second message beats five incorrect fix attempts over twenty messages.
</user_interaction>

## Diagnostic Checklist

Before proposing any fix, verify:

<diagnostic_checklist>
**Information gathered:**
- [ ] Exact error message / stack trace / observable symptom (copy-paste, not paraphrase)
- [ ] Reproduction steps or trigger conditions
- [ ] What changed since it last worked
- [ ] Relevant code path (read, not assumed)
- [ ] Environment details (versions, OS, local vs CI vs prod)
- [ ] What the user has already tried

**Diagnosis quality:**
- [ ] Hypothesis is specific and traceable to evidence in the error/code/logs
- [ ] Root cause identified, not just the symptom location
- [ ] Hypothesis verified through code reading, log inspection, or targeted diagnostic
- [ ] Alternative causes considered and eliminated with reasoning

**Fix quality:**
- [ ] Fix addresses root cause, not symptom
- [ ] Fix is a single, specific change (not "try these three things")
- [ ] Edge cases considered (other callers of the same code path, other inputs)
- [ ] Verification step provided (how to confirm the fix worked)
- [ ] No prior working behavior broken by the fix
</diagnostic_checklist>

## Language and Platform References

When the error is in a specific language or platform, consult the relevant reference for error signature mappings, diagnostic commands, and common misdiagnoses:

```
references/lang-go.md             # Go: nil interfaces, goroutine leaks, race detector, context errors
references/lang-typescript.md     # TypeScript/Node: type errors, async/Promise, module resolution (ESM/CJS)
references/lang-python.md         # Python: import system, None propagation, async pitfalls, venv issues
references/lang-rust.md           # Rust: borrow checker, trait bounds, async Pin/Send, lifetime errors
references/platform-docker.md     # Docker/Podman: exit codes, networking, volume permissions, build cache
references/platform-aws.md        # AWS: IAM debugging, Lambda, S3 403s, cross-service error tracing
references/platform-linux.md      # Linux: strace, permissions (SELinux/AppArmor), OOM killer, systemd, networking
```

Each reference contains error signature → root cause mappings, the specific diagnostic commands to run, and "incorrect diagnosis vs correct diagnosis" patterns for that ecosystem.

Stop guessing. Start diagnosing. The fastest path to a working fix goes through understanding the root cause — every single time.
