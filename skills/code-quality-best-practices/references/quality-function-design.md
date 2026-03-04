---
title: Design Functions With Single Level of Abstraction and Minimal Parameters
impact: CRITICAL
impactDescription: Reduces cyclomatic complexity by 60-80%, makes every function independently testable
tags: function-design, single-responsibility, parameters, guard-clauses, code-quality
---

## Design Functions With Single Level of Abstraction and Minimal Parameters

Each function should read like a paragraph: every line at the same level of detail. No more than 3 parameters. Booleans as parameters are a code smell — they create two functions in one. Command-Query Separation: functions either change state or return information, not both.

**Incorrect (mixed abstraction levels, too many parameters, boolean flag):**

```typescript
// 5 parameters, boolean flag, mixes orchestration with byte manipulation
function processFile(
  path: string,
  encoding: string,
  compress: boolean,
  maxSize: number,
  outputDir: string
): void {
  const raw = fs.readFileSync(path);
  const decoded = Buffer.from(raw).toString(encoding);
  const lines = decoded.split("\n").filter((l) => l.trim() !== "");
  let result = lines.join("\n");
  if (compress) {
    result = zlib.gzipSync(Buffer.from(result)).toString("base64");
  }
  if (Buffer.byteLength(result) > maxSize) {
    throw new Error("Too large");
  }
  fs.writeFileSync(path.join(outputDir, path.basename(path)), result);
}
```

**Correct (single level of abstraction, minimal parameters, guard clauses):**

```typescript
interface FileProcessingOptions {
  sourcePath: string;
  outputDir: string;
  maxSizeBytes: number;
}

function processFile(options: FileProcessingOptions): Result<string, ProcessingError> {
  const content = readAndCleanFile(options.sourcePath);
  if (content.isErr()) return content;

  const outputPath = resolveOutputPath(options.sourcePath, options.outputDir);
  return writeWithSizeCheck(outputPath, content.value, options.maxSizeBytes);
}

// Separate function for the compression concern
function processAndCompressFile(options: FileProcessingOptions): Result<string, ProcessingError> {
  const content = readAndCleanFile(options.sourcePath);
  if (content.isErr()) return content;

  const compressed = compressContent(content.value);
  const outputPath = resolveOutputPath(options.sourcePath, options.outputDir);
  return writeWithSizeCheck(outputPath, compressed, options.maxSizeBytes);
}
```

Fail fast and loudly. Validate preconditions at the top with guard clauses. The happy path should be the least-indented path. Target 7 plus or minus 2 lines of logic per function body.
