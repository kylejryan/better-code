---
title: Tool Interface Design Principles
impact: CRITICAL
impactDescription: Clear tool interfaces reduce hallucinated arguments and wrong tool selection
tags: tool, interface, naming, description, parameters, structured-output
---

## Tool Interface Design Principles

**Name tools for what they DO, not what they ARE.**

```
Bad:  database_tool, api_tool, file_tool
Good: query_findings_by_severity, read_file_section, create_github_issue
```

The model selects tools by name and description. Vague names force the model to read the full description every time. Specific names enable instant selection.

**Descriptions must answer: when should I use this tool and what will I get back?**

```
Bad:  "Interacts with the database."
Good: "Queries vulnerability findings. Accepts filters: severity, service,
       status, date_range. Returns: list of findings with id, title, severity,
       service, and status. Max 100 results per call."
```

**Parameters should be typed, constrained, and defaulted.**
- Use enums for parameters with known valid values (`severity: "critical" | "high" | "medium" | "low"`)
- Provide defaults for optional parameters (the model shouldn't decide on pagination defaults)
- Mark required parameters as required, optional as optional
- Use descriptive parameter names — `file_path` not `p`, `max_results` not `n`

**Return structured data, not prose.**

Tools that return natural language ("I found 3 vulnerabilities...") force the model to parse text. Tools that return structured data (`{ findings: [...], total: 3, has_more: false }`) give the model clean, unambiguous input for its next decision.

**Return only what's needed.** A tool that returns a 500-field database row when the agent only needs 3 fields is injecting 497 fields of noise. Design tool outputs to include only the fields the agent will actually use. If different call sites need different fields, use a `fields` parameter to select output shape.

**Incorrect (vague tool returning everything):**

```typescript
const tools = [{
  name: "database",
  description: "Access the database",
  parameters: { query: { type: "string" } },
}];
// Model must guess what queries are valid, what comes back
```

**Correct (specific tool with typed, constrained interface):**

```typescript
const tools = [{
  name: "query_findings_by_severity",
  description: "Query vulnerability findings. Returns: {id, title, severity, service, status}. Max 50 results.",
  parameters: {
    severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
    service: { type: "string", description: "Service name to filter by" },
    limit: { type: "number", default: 20, maximum: 50 },
  },
}];
```
