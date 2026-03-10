import { analyzeCVEData } from "./analyze.js";
import { fetchCVEData } from "./fetch.js";
import { generateDrafts } from "./generate.js";
import type { PipelineOptions } from "./types.js";

function parseArgs(): PipelineOptions {
	const args = process.argv.slice(2);
	const options: PipelineOptions = {
		force: false,
		limit: 10,
		minCvss: 7.0,
	};

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "--force":
				options.force = true;
				break;
			case "--limit": {
				const val = Number(args[++i]);
				if (Number.isNaN(val) || val < 1) {
					console.error("--limit must be a positive number");
					process.exit(1);
				}
				options.limit = val;
				break;
			}
			case "--min-cvss": {
				const val = Number(args[++i]);
				if (Number.isNaN(val) || val < 0 || val > 10) {
					console.error("--min-cvss must be between 0 and 10");
					process.exit(1);
				}
				options.minCvss = val;
				break;
			}
			default:
				console.error(`Unknown option: ${args[i]}`);
				console.error(
					"Usage: cve:analyze [--force] [--limit N] [--min-cvss N]",
				);
				process.exit(1);
		}
	}

	return options;
}

async function main(): Promise<void> {
	const options = parseArgs();

	console.log("=== CVE Pattern Analysis Pipeline ===");
	console.log(
		`Options: force=${options.force}, limit=${options.limit}, minCvss=${options.minCvss}`,
	);
	console.log("");

	// Step 1: Fetch CVE data
	console.log("--- Step 1: Fetch CVE Data ---");
	const records = await fetchCVEData(options.minCvss, options.force);
	console.log(`Total CVE records: ${records.length}`);
	console.log("");

	// Step 2: Analyze patterns and identify gaps
	console.log("--- Step 2: Analyze Patterns ---");
	const analysis = analyzeCVEData(records);
	console.log(`CWE clusters: ${analysis.clusters.length}`);
	console.log(`Covered: ${analysis.coveredClusters.length}`);
	console.log(`Gaps: ${analysis.uncoveredClusters.length}`);
	console.log("");

	// Step 3: Generate draft reference files
	console.log("--- Step 3: Generate Drafts ---");
	generateDrafts(analysis, options.limit);
	console.log("");

	console.log("=== Pipeline Complete ===");
}

main().catch((error) => {
	console.error("Pipeline failed:", error);
	process.exit(1);
});
