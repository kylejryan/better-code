import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ImpactLevel } from "../types.js";
import { CACHE_DIR } from "./fetch.js";
import type { GapAnalysis, PatternCluster } from "./types.js";

const DRAFTS_DIR = join(CACHE_DIR, "drafts");

/**
 * Derive impact level from average CVSS score.
 */
function cvssToImpact(avgCvss: number): ImpactLevel {
	if (avgCvss >= 9.0) return "CRITICAL";
	if (avgCvss >= 7.5) return "HIGH";
	if (avgCvss >= 6.0) return "MEDIUM-HIGH";
	if (avgCvss >= 4.0) return "MEDIUM";
	if (avgCvss >= 2.0) return "LOW-MEDIUM";
	return "LOW";
}

/**
 * Generate a kebab-case descriptive name from CWE name.
 */
function cweNameToKebab(cweName: string): string {
	return cweName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

/**
 * Generate a draft reference file for an uncovered pattern cluster.
 */
function generateDraftFile(cluster: PatternCluster): string {
	const impact = cvssToImpact(cluster.avgCvss);
	const pocCVEs = cluster.representativeCVEs.filter(
		(c) => c.pocRepos.length > 0,
	);
	const topCVEs = cluster.representativeCVEs.slice(0, 3);

	const impactDesc = `${cluster.count} CVEs in last 6 months with avg CVSS ${cluster.avgCvss}, ${pocCVEs.length} with public PoCs`;

	const tags = [
		cluster.cweId.toLowerCase().replace("cwe-", "cwe"),
		cluster.suggestedSection,
		...cluster.cweName
			.toLowerCase()
			.split(/\s+/)
			.filter((w) => w.length > 3)
			.slice(0, 3),
	].join(", ");

	const title = `Detect ${cluster.cweName} (${cluster.cweId})`;

	// Build description from representative CVE descriptions
	const cveContext = topCVEs
		.map(
			(c) =>
				`- **${c.id}** (CVSS ${c.cvssScore}): ${c.description.length > 200 ? `${c.description.slice(0, 200)}...` : c.description}`,
		)
		.join("\n");

	const pocLinks = pocCVEs
		.flatMap((c) => c.pocRepos.slice(0, 2))
		.slice(0, 5)
		.map((url) => `- ${url}`)
		.join("\n");

	const lines = [
		"---",
		`title: "${title}"`,
		`impact: ${impact}`,
		`impactDescription: "${impactDesc}"`,
		`tags: ${tags}`,
		"---",
		"",
		`## ${title}`,
		"",
		`${cluster.cweName} (${cluster.cweId}) allows attackers to exploit ${cluster.suggestedSection}-related weaknesses. This pattern appeared in ${cluster.count} high-severity CVEs in the last 6 months.`,
		"",
		"### Recent CVE Examples",
		"",
		cveContext,
		"",
		"**Incorrect:**",
		"",
		"```python",
		`# <!-- TODO: Add vulnerable code example for ${cluster.cweName} -->`,
		`# See PoC references below for real-world exploitation patterns`,
		"```",
		"",
		"**Correct:**",
		"",
		"```python",
		`# <!-- TODO: Add secure code example for ${cluster.cweName} -->`,
		`# Mitigate by addressing the root cause of ${cluster.cweId}`,
		"```",
		"",
	];

	if (pocLinks) {
		lines.push(
			"### PoC References",
			"",
			"The following public PoCs demonstrate real-world exploitation:",
			"",
			pocLinks,
			"",
		);
	}

	return lines.join("\n");
}

/**
 * Generate draft reference files for uncovered pattern clusters.
 */
export function generateDrafts(analysis: GapAnalysis, limit: number): void {
	if (!existsSync(DRAFTS_DIR)) {
		mkdirSync(DRAFTS_DIR, { recursive: true });
	}

	const toGenerate = analysis.uncoveredClusters.slice(0, limit);

	if (toGenerate.length === 0) {
		console.log("No uncovered patterns found. Coverage is complete!");
		return;
	}

	console.log(`Generating ${toGenerate.length} draft reference files...`);

	for (const cluster of toGenerate) {
		const kebabName = cweNameToKebab(cluster.cweName);
		const fileName = `${cluster.suggestedSection}-${kebabName}.md`;
		const filePath = join(DRAFTS_DIR, fileName);

		const content = generateDraftFile(cluster);
		writeFileSync(filePath, content);

		console.log(
			`  Created: ${fileName} (${cluster.cweId}, ${cluster.count} CVEs)`,
		);
	}

	console.log(`\nDrafts written to ${DRAFTS_DIR}`);
	console.log(
		"Review drafts, fill in code examples (replace <!-- TODO --> markers),",
	);
	console.log(
		"then copy to skills/vulnerability-analysis/references/ and run: mise run validate",
	);
}

export { DRAFTS_DIR };
