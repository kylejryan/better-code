---
title: Python Error Signatures and Diagnostic Patterns
impact: CRITICAL
impactDescription: Maps Python's import system, None propagation, async pitfalls, and environment issues to root causes — the patterns that cause 80% of Python debugging frustration
tags: python, import, none, async, asyncio, pip, venv, traceback, typing
---

## Python Diagnostic Reference

Python's dynamic typing and import system create a specific category of bugs where the error appears far from the cause. A `TypeError` at line 50 might be caused by an incorrect return type at line 12 in a different module. An `ImportError` might be caused by a virtual environment issue, not missing code. This reference maps Python error signatures to their actual root causes.

### Import and Module Errors

Python's import system is the #1 source of "it works on my machine" bugs. The root cause is almost always about sys.path, not about code.

**Incorrect (reinstalling the package without checking the environment):**

```python
# Error: ModuleNotFoundError: No module named 'requests'
# Wrong reaction: pip install requests
# You might be installing into the WRONG Python/environment

# This is especially common when:
# - Multiple Python versions exist (python3.11 vs python3.12)
# - IDE uses a different interpreter than the terminal
# - pip and python point to different installations
```

**Correct (verifying the environment before installing):**

```python
# Step 1: Which Python is actually running?
import sys
print(sys.executable)    # /usr/bin/python3 vs /home/user/.venv/bin/python
print(sys.version)       # 3.11.5 vs 3.12.0
print(sys.path)          # WHERE Python looks for modules (order matters!)

# Step 2: Is the package installed in THIS Python's environment?
# Terminal:
# python -m pip list | grep requests   (use python -m pip, not just pip!)
# python -m pip show requests          (shows install location)

# Step 3: Common root causes:
# - Not in a virtual env:   which python && which pip (should be same prefix)
# - venv not activated:     source .venv/bin/activate
# - Editable install stale: pip install -e . (re-run after moving files)
# - Circular import:        A imports B imports A (see below)
```

**Circular imports — the silent killer:**

```python
# models.py
from services import UserService  # Imports services at module load time

class User:
    pass

# services.py
from models import User  # Imports models at module load time ← CIRCULAR

class UserService:
    def get_user(self) -> User:
        pass

# Fix: move import inside the function, or restructure to break the cycle
# services.py
class UserService:
    def get_user(self) -> "User":  # Forward reference as string
        from models import User    # Import at call time, not module load time
        return User()
```

### None Propagation

`AttributeError: 'NoneType' object has no attribute 'X'` — Python's equivalent of null pointer exceptions. The None is always assigned somewhere upstream.

**Incorrect (adding "if x is not None" checks without tracing the source):**

```python
# "Just check for None before using it"
result = db.query(user_id)
if result is not None:  # This hides the real question: WHY is result None?
    process(result)
# Now the None case is silently skipped. Data is missing and nobody knows.
```

**Correct (tracing None to its origin):**

```python
# Common sources of unexpected None in Python:

# 1. Function with no return statement returns None implicitly
def find_user(user_id):
    for user in users:
        if user.id == user_id:
            return user
    # Falls through with no return → returns None!

# 2. list.sort() and similar mutating methods return None
sorted_list = my_list.sort()  # BUG: sort() returns None, mutates in place
sorted_list = sorted(my_list)  # CORRECT: sorted() returns a new list

# 3. dict.get() returns None for missing keys (not KeyError)
value = config.get("missing_key")  # Returns None, no error
value = config["missing_key"]       # Raises KeyError — often more useful

# 4. re.match() / re.search() returns None on no match
match = re.match(r"\d+", "abc")
match.group()  # AttributeError: 'NoneType' has no attribute 'group'

# Diagnostic: add an assertion at the assignment point, not at the usage point
result = db.query(user_id)
assert result is not None, f"db.query returned None for user_id={user_id!r}"
```

### Async / Asyncio Errors

**Symptoms:** `RuntimeWarning: coroutine was never awaited`, `TypeError: 'coroutine' object is not subscriptable`, event loop already running.

**Incorrect (wrapping everything in asyncio.run without understanding the event loop):**

```python
# "Just make it async" — but you don't understand which layer owns the event loop

# This fails in Jupyter/IPython (event loop already running):
asyncio.run(main())  # RuntimeError: This event loop is already running

# This silently does nothing:
async def process():
    fetch_data()  # Missing await! This creates a coroutine object and discards it
    # Python warns: "RuntimeWarning: coroutine 'fetch_data' was never awaited"
```

**Correct (understanding the async execution model):**

```python
# Rule 1: Every async function call MUST be awaited (or explicitly scheduled)
async def process():
    data = await fetch_data()  # Correct: awaits the coroutine

# Rule 2: You can't call async functions from sync code without a runner
# From sync code:
result = asyncio.run(async_function())       # Creates event loop, runs, closes

# From code where an event loop may already exist (Jupyter, web frameworks):
import asyncio
loop = asyncio.get_event_loop()
if loop.is_running():
    # Use nest_asyncio or restructure to be fully async
    import nest_asyncio
    nest_asyncio.apply()

# Rule 3: asyncio.gather() vs sequential await
# Sequential (slow):
a = await fetch_a()
b = await fetch_b()

# Concurrent (fast):
a, b = await asyncio.gather(fetch_a(), fetch_b())

# Rule 4: Detect missing awaits — enable warnings
import warnings
warnings.filterwarnings("error", category=RuntimeWarning)  # Turn warnings into errors
```

### Type Errors at Runtime

Python's type hints don't enforce at runtime (unless you use a runtime checker). The type system can lie.

**Diagnostic approach:**

```python
# When you get a TypeError, check the ACTUAL types, not the annotations
def process(data: dict[str, int]) -> list[int]:
    return list(data.values())

# If this raises TypeError: 'str' object cannot be interpreted as an integer
# the dict values are strings, not ints — the type annotation lied
# Check: type(data), {k: type(v) for k, v in data.items()}

# Common sources of type lies:
# - JSON parsed data (everything is str, int, float, bool, None, list, dict)
# - Database results (driver may return Decimal, not float)
# - Environment variables (always str, never int/bool)
# - yaml.safe_load vs yaml.load (different type handling)
```

**Incorrect (trusting type annotations as runtime truth):**

```python
# "The type says it's a list[User] so it must be"
def get_users() -> list[User]:
    return json.loads(response.text)  # Returns list[dict], not list[User]!
```

**Correct (validating at the boundary, trusting internally):**

```python
# Validate at system boundaries (API responses, file reads, user input)
def get_users() -> list[User]:
    raw = json.loads(response.text)
    return [User(**item) for item in raw]  # Fails fast if shape is wrong

# Or use pydantic/dataclass for structured validation:
from pydantic import TypeAdapter
adapter = TypeAdapter(list[User])
return adapter.validate_python(json.loads(response.text))
```

### Key Diagnostic Commands

```bash
# Environment
python -c "import sys; print(sys.executable, sys.version)"
python -m pip show <package>     # Install location and version
python -m pip check              # Verify all dependencies are compatible
python -m site                   # Show all site-packages directories

# Debugging
python -m pdb script.py          # Built-in debugger
python -m traceback              # Better traceback formatting
python -Werror script.py         # Turn all warnings into errors
PYTHONFAULTHANDLER=1 python script.py  # Print traceback on segfault/crash

# Import debugging
python -v -c "import problematic_module"  # Verbose import tracing
python -c "import sys; print('\n'.join(sys.path))"  # Module search path

# Profiling
python -m cProfile -s cumulative script.py  # CPU profiling
python -m tracemalloc              # Memory allocation tracing
```
