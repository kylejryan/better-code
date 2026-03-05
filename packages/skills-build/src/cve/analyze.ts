import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { getCWEName, getSectionForCWE } from "./cwe-map.js";
import { CACHE_DIR } from "./fetch.js";
import type { CVERecord, GapAnalysis, PatternCluster } from "./types.js";

const VULN_REFERENCES_DIR = join(
	CACHE_DIR,
	"..",
	"..",
	"..",
	"skills",
	"vulnerability-analysis",
	"references",
);

/**
 * Get existing reference file prefixes and names for coverage matching.
 */
function getExistingReferences(): Map<string, string[]> {
	const sectionFiles = new Map<string, string[]>();

	if (!existsSync(VULN_REFERENCES_DIR)) return sectionFiles;

	const files = readdirSync(VULN_REFERENCES_DIR).filter(
		(f) => f.endsWith(".md") && !f.startsWith("_"),
	);

	for (const file of files) {
		const base = basename(file, ".md");
		const prefix = base.split("-")[0];
		const existing = sectionFiles.get(prefix) ?? [];
		existing.push(base);
		sectionFiles.set(prefix, existing);
	}

	return sectionFiles;
}

/**
 * Explicit CWE-to-reference-file mappings.
 * Checked first, before heuristic matching. Maps CWE IDs to reference file
 * basenames (without .md extension). Multiple CWEs can map to the same file.
 */
const KNOWN_COVERAGE: Record<string, string> = {
	// Injection
	"CWE-22": "injection-path-traversal",
	"CWE-23": "injection-path-traversal",
	"CWE-36": "injection-path-traversal",
	"CWE-59": "injection-path-traversal",
	"CWE-61": "injection-path-traversal",
	"CWE-73": "injection-path-traversal",
	"CWE-77": "injection-command",
	"CWE-78": "injection-command",
	"CWE-79": "injection-xss",
	"CWE-88": "injection-command",
	"CWE-89": "injection-sql",
	"CWE-94": "injection-command",
	"CWE-95": "injection-command",
	"CWE-502": "injection-deserialization",
	"CWE-610": "injection-ssrf",
	"CWE-917": "injection-ssti",
	"CWE-918": "injection-ssrf",
	"CWE-1336": "injection-ssti",

	// Memory
	"CWE-119": "memory-buffer-overflow",
	"CWE-120": "memory-buffer-overflow",
	"CWE-121": "memory-buffer-overflow",
	"CWE-122": "memory-buffer-overflow",
	"CWE-126": "memory-buffer-overflow",
	"CWE-131": "memory-buffer-overflow",
	"CWE-787": "memory-buffer-overflow",
	"CWE-415": "memory-use-after-free",
	"CWE-416": "memory-use-after-free",
	"CWE-190": "memory-integer-overflow",
	"CWE-191": "memory-integer-overflow",

	// Auth
	"CWE-269": "auth-privileged-setup",
	"CWE-266": "auth-privileged-setup",
	"CWE-284": "auth-authorization-flaws",
	"CWE-285": "auth-authorization-flaws",
	"CWE-287": "auth-bypass",
	"CWE-288": "auth-bypass",
	"CWE-290": "auth-bypass",
	"CWE-306": "auth-bypass",
	"CWE-384": "auth-session-management",
	"CWE-613": "auth-session-management",
	"CWE-639": "auth-authorization-flaws",
	"CWE-862": "auth-authorization-flaws",
	"CWE-863": "auth-authorization-flaws",

	// Crypto
	"CWE-320": "crypto-key-management",
	"CWE-321": "crypto-key-management",
	"CWE-326": "crypto-weak-algorithms",
	"CWE-327": "crypto-weak-algorithms",
	"CWE-328": "crypto-weak-algorithms",
	"CWE-338": "crypto-weak-algorithms",

	// Concurrency
	"CWE-362": "concurrency-race-conditions",
	"CWE-363": "concurrency-race-conditions",
	"CWE-366": "concurrency-race-conditions",
	"CWE-367": "concurrency-toctou",

	// Web
	"CWE-346": "web-cors",
	"CWE-352": "web-csrf",
	"CWE-942": "web-cors",

	// Supply chain
	"CWE-426": "supply-dependency-confusion",
	"CWE-427": "supply-dependency-confusion",

	// Taint
	"CWE-20": "taint-source-sink-analysis",
	"CWE-707": "taint-filter-evaluation",
};

/**
 * Get all reference file basenames across all sections.
 */
function getAllRefFiles(existingRefs: Map<string, string[]>): string[] {
	const all: string[] = [];
	for (const files of existingRefs.values()) {
		all.push(...files);
	}
	return all;
}

/**
 * Check if a CWE cluster has existing coverage in reference files.
 * Uses explicit mappings first, then heuristic keyword matching.
 */
function findExistingCoverage(
	cweId: string,
	cweName: string,
	existingRefs: Map<string, string[]>,
): string | null {
	const allFiles = getAllRefFiles(existingRefs);

	// 1. Check explicit known mappings first
	const known = KNOWN_COVERAGE[cweId];
	if (known && allFiles.includes(known)) {
		return `${known}.md`;
	}

	// 2. Heuristic: keyword matching across ALL sections
	// Require either 2+ keyword matches, or 1 match on a word >= 6 chars
	// to avoid false positives from short generic words like "file", "weak", "race"
	const nameWords = cweName
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, "")
		.split(/\s+/)
		.filter((w) => w.length > 3);

	for (const file of allFiles) {
		const fileLower = file.toLowerCase();
		const matches = nameWords.filter((w) => fileLower.includes(w));
		const hasStrongMatch = matches.some((w) => w.length >= 6);
		if (matches.length >= 2 || (matches.length === 1 && hasStrongMatch)) {
			return `${file}.md`;
		}
	}

	return null;
}

/**
 * Group CVEs by CWE ID into PatternCluster objects.
 */
function clusterByCWE(records: CVERecord[]): PatternCluster[] {
	const clusters = new Map<string, CVERecord[]>();

	for (const record of records) {
		for (const cwe of record.cwes) {
			const existing = clusters.get(cwe) ?? [];
			existing.push(record);
			clusters.set(cwe, existing);
		}
	}

	const existingRefs = getExistingReferences();

	const result: PatternCluster[] = [];
	for (const [cweId, cves] of clusters) {
		const cweName = getCWEName(cweId);
		const avgCvss = cves.reduce((sum, c) => sum + c.cvssScore, 0) / cves.length;
		const section = getSectionForCWE(cweId) ?? "taint";

		// Pick representative CVEs: prefer those with PoCs, then highest CVSS
		const sorted = [...cves].sort((a, b) => {
			if (a.pocRepos.length > 0 && b.pocRepos.length === 0) return -1;
			if (b.pocRepos.length > 0 && a.pocRepos.length === 0) return 1;
			return b.cvssScore - a.cvssScore;
		});

		result.push({
			cweId,
			cweName,
			count: cves.length,
			avgCvss: Math.round(avgCvss * 10) / 10,
			representativeCVEs: sorted.slice(0, 5),
			existingCoverage: findExistingCoverage(cweId, cweName, existingRefs),
			suggestedSection: section,
		});
	}

	// Sort by frequency descending
	result.sort((a, b) => b.count - a.count);

	return result;
}

/** Minimum CVEs in a cluster to include in gap analysis */
const MIN_CLUSTER_SIZE = 2;

/**
 * Analyze CVE records and produce a gap analysis.
 */
export function analyzeCVEData(records: CVERecord[]): GapAnalysis {
	const allClusters = clusterByCWE(records);

	// Filter out long-tail noise (clusters with < MIN_CLUSTER_SIZE CVEs)
	const clusters = allClusters.filter((c) => c.count >= MIN_CLUSTER_SIZE);

	const coveredClusters = clusters.filter((c) => c.existingCoverage !== null);
	const uncoveredClusters = clusters.filter((c) => c.existingCoverage === null);

	const analysis: GapAnalysis = {
		totalCVEs: records.length,
		fetchDate: new Date().toISOString(),
		clusters,
		coveredClusters,
		uncoveredClusters,
	};

	// Write gap analysis report
	writeGapReport(analysis);

	return analysis;
}

/**
 * Write a human-readable gap analysis report.
 */
function writeGapReport(analysis: GapAnalysis): void {
	const lines: string[] = [
		"# CVE Pattern Gap Analysis",
		"",
		`Generated: ${analysis.fetchDate}`,
		`Total CVEs analyzed: ${analysis.totalCVEs}`,
		`Total CWE clusters: ${analysis.clusters.length}`,
		`Covered by existing references: ${analysis.coveredClusters.length}`,
		`Gaps (uncovered clusters): ${analysis.uncoveredClusters.length}`,
		"",
		"## Coverage Summary",
		"",
		"### Covered Patterns",
		"",
		"| CWE | Name | CVE Count | Avg CVSS | Reference File |",
		"|-----|------|-----------|----------|----------------|",
	];

	for (const cluster of analysis.coveredClusters) {
		lines.push(
			`| ${cluster.cweId} | ${cluster.cweName} | ${cluster.count} | ${cluster.avgCvss} | ${cluster.existingCoverage} |`,
		);
	}

	lines.push("", "### Uncovered Patterns (Gaps)", "");
	lines.push(
		"| CWE | Name | CVE Count | Avg CVSS | Suggested Section | Has PoCs |",
	);
	lines.push(
		"|-----|------|-----------|----------|-------------------|----------|",
	);

	for (const cluster of analysis.uncoveredClusters) {
		const hasPoCs = cluster.representativeCVEs.some(
			(c) => c.pocRepos.length > 0,
		);
		lines.push(
			`| ${cluster.cweId} | ${cluster.cweName} | ${cluster.count} | ${cluster.avgCvss} | ${cluster.suggestedSection} | ${hasPoCs ? "Yes" : "No"} |`,
		);
	}

	lines.push("", "## Top Uncovered Patterns (Detail)", "");

	for (const cluster of analysis.uncoveredClusters.slice(0, 15)) {
		lines.push(`### ${cluster.cweId}: ${cluster.cweName}`);
		lines.push("");
		lines.push(
			`- **Count:** ${cluster.count} CVEs | **Avg CVSS:** ${cluster.avgCvss}`,
		);
		lines.push(`- **Suggested section:** ${cluster.suggestedSection}`);
		lines.push("- **Representative CVEs:**");

		for (const cve of cluster.representativeCVEs.slice(0, 3)) {
			const pocNote =
				cve.pocRepos.length > 0 ? ` (${cve.pocRepos.length} PoCs)` : "";
			lines.push(`  - ${cve.id} (CVSS ${cve.cvssScore})${pocNote}`);
			lines.push(
				`    ${cve.description.length > 150 ? `${cve.description.slice(0, 150)}...` : cve.description}`,
			);
		}
		lines.push("");
	}

	const reportPath = join(CACHE_DIR, "gap-analysis.md");
	writeFileSync(reportPath, lines.join("\n"));
	console.log(`Gap analysis written to ${reportPath}`);
}
