---
title: Map Concrete Data Flow Paths Through Actual Code
impact: CRITICAL
impactDescription: Without concrete path traces, findings are pattern matches — not proven vulnerabilities
tags: data-flow, tracing, source-sink, code-path, methodology
---

## Map Concrete Data Flow Paths Through Actual Code

Read the actual code. Not "code like this usually works this way" — the ACTUAL code in this project. Trace the specific data flow from entry point to potential sink with file and line references at every step.

**Incorrect (pattern-matching, not tracing):**

```markdown
The application accepts user input and passes it to a database query.
This could lead to SQL injection (CWE-89).
```

This describes a generic vulnerability class, not a traced path through this codebase. It could apply to any web application. It proves nothing about this specific code.

**Correct (traced through actual code):**

```markdown
1. ENTRY: request.form['username'] in auth/views.py:34
   Data arrives as: string from POST body, no length limit
   Validation here: NONE — raw form value used directly

2. PASSES THROUGH: authenticate_user(username, password) at auth/views.py:36
   Relevant modifications: NONE — username passed as-is to db layer

3. REACHES SINK: f"SELECT * FROM users WHERE name = '{username}'" at auth/db.py:89
   Used as: string interpolation into SQL query
   Protection at sink: NONE — no parameterization, no escaping
```

**Data flow documentation format:**

For each step in the path, record:
- **Where**: exact function, file, and line number
- **What arrives**: the data type, format, and content at this point
- **What changes**: any transformations, validations, or sanitizations applied
- **What leaves**: the data as it exits this step toward the next

If you cannot fill in all four fields for a step, you have not read the code at that point. Go read it before continuing.

**Tracing through function calls:**

Follow every function call on the path. Do not assume what a called function does — read it. A function named `sanitize_input()` might sanitize nothing. A function named `format_query()` might parameterize correctly. The name is not the implementation.

```python
# Do not assume validate_email() prevents injection
# Read the function to see what it actually checks
def validate_email(email):
    # This only checks format — does NOT prevent SQL injection
    if '@' not in email:
        raise ValueError("Invalid email")
    return email  # Returns the original value unchanged
```

**Tracing through middleware/interceptors:**

In frameworks with middleware chains, trace through every middleware that touches the request before it reaches the handler. A WAF middleware might strip dangerous characters. An auth middleware might reject unauthenticated requests (limiting the attacker profile). A logging middleware might log the full payload (creating a secondary sink). Read each one.

**When you hit an external dependency you cannot read:**

Document what you know and what you cannot verify. "The `sanitize-html` library (v2.7.3) is called at `views.py:45` with default options. I cannot verify its behavior from source — the finding's confidence depends on whether this library correctly strips script tags with its default configuration." This is honest analysis.
