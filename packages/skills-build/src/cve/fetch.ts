import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { CVERecord } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CACHE_DIR = join(__dirname, "..", "..", ".cache");
const CACHE_FILE = join(CACHE_DIR, "cve-data.json");

const NVD_API_BASE = "https://services.nvd.nist.gov/rest/json/cves/2.0";
const POC_GITHUB_BASE =
	"https://raw.githubusercontent.com/nomi-sec/PoC-in-GitHub/master";

/** Rate limit: 5 requests per 30 seconds without API key */
const RATE_LIMIT_MS = 6500;
const RATE_LIMIT_WITH_KEY_MS = 800;

function ensureCacheDir(): void {
	if (!existsSync(CACHE_DIR)) {
		mkdirSync(CACHE_DIR, { recursive: true });
	}
}

function isCacheFresh(): boolean {
	if (!existsSync(CACHE_FILE)) return false;
	const stat = JSON.parse(readFileSync(CACHE_FILE, "utf-8")) as {
		fetchDate: string;
	};
	const age = Date.now() - new Date(stat.fetchDate).getTime();
	return age < 24 * 60 * 60 * 1000; // 24 hours
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract CWE IDs from NVD CVE item weaknesses.
 */
function extractCWEs(
	weaknesses: Array<{
		description: Array<{ lang: string; value: string }>;
	}>,
): string[] {
	const cwes: string[] = [];
	for (const weakness of weaknesses) {
		for (const desc of weakness.description) {
			if (desc.value.startsWith("CWE-") && desc.value !== "CWE-noinfo") {
				cwes.push(desc.value);
			}
		}
	}
	return [...new Set(cwes)];
}

/**
 * Extract CVSS v3 score and attack vector from NVD metrics.
 */
function extractCVSS(metrics: Record<string, unknown>): {
	score: number;
	attackVector: string;
} {
	// Try cvssMetricV31 first, then v30
	for (const key of ["cvssMetricV31", "cvssMetricV30"]) {
		const metricList = metrics[key] as
			| Array<{ cvssData: { baseScore: number; attackVector: string } }>
			| undefined;
		if (metricList?.[0]) {
			return {
				score: metricList[0].cvssData.baseScore,
				attackVector: metricList[0].cvssData.attackVector,
			};
		}
	}
	return { score: 0, attackVector: "UNKNOWN" };
}

/**
 * Fetch CVEs from NVD API for the last 6 months with HIGH/CRITICAL severity.
 */
async function fetchFromNVD(minCvss: number): Promise<CVERecord[]> {
	const apiKey = process.env.NVD_API_KEY;
	const rateLimitMs = apiKey ? RATE_LIMIT_WITH_KEY_MS : RATE_LIMIT_MS;

	const now = new Date();

	// NVD API allows max 120-day windows, so we chunk 6 months into windows
	const sixMonthsAgo = new Date(now);
	sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

	// Format dates with milliseconds as required by NVD API 2.0
	function formatNVDDate(d: Date): string {
		return `${d.toISOString().replace("Z", "").split(".")[0]}.000`;
	}

	// Build 120-day windows covering the full 6-month range
	const windows: Array<{ start: string; end: string }> = [];
	const windowMs = 119 * 24 * 60 * 60 * 1000; // 119 days to stay under 120
	let windowStart = new Date(sixMonthsAgo);
	while (windowStart < now) {
		const windowEnd = new Date(
			Math.min(windowStart.getTime() + windowMs, now.getTime()),
		);
		windows.push({
			start: formatNVDDate(windowStart),
			end: formatNVDDate(windowEnd),
		});
		windowStart = new Date(windowEnd.getTime() + 1000); // +1s to avoid overlap
	}

	const records: CVERecord[] = [];
	const seenIds = new Set<string>();

	console.log(
		`Fetching CVEs from NVD API (${windows.length} time window(s))...`,
	);

	const resultsPerPage = 100;
	const severities = ["HIGH", "CRITICAL"];

	for (const window of windows) {
		for (const severity of severities) {
			let startIndex = 0;
			let totalResults = 0;

			console.log(
				`  Window ${window.start.slice(0, 10)} to ${window.end.slice(0, 10)}, severity=${severity}`,
			);

			do {
				const params = new URLSearchParams({
					pubStartDate: window.start,
					pubEndDate: window.end,
					cvssV3Severity: severity,
					resultsPerPage: String(resultsPerPage),
					startIndex: String(startIndex),
				});

				const url = `${NVD_API_BASE}?${params}`;
				const headers: Record<string, string> = {
					"User-Agent": "skills-build-cve-analyzer/1.0",
				};
				if (apiKey) {
					headers.apiKey = apiKey;
				}

				const response = await fetch(url, { headers });
				if (!response.ok) {
					if (response.status === 403 || response.status === 429) {
						console.log("    Rate limited, waiting 30s...");
						await sleep(30_000);
						continue;
					}
					throw new Error(
						`NVD API error: ${response.status} ${response.statusText}`,
					);
				}

				const data = (await response.json()) as {
					totalResults: number;
					vulnerabilities: Array<{
						cve: {
							id: string;
							descriptions: Array<{ lang: string; value: string }>;
							weaknesses?: Array<{
								description: Array<{ lang: string; value: string }>;
							}>;
							metrics?: Record<string, unknown>;
							references?: Array<{ url: string }>;
							published: string;
						};
					}>;
				};

				totalResults = data.totalResults;

				for (const vuln of data.vulnerabilities) {
					const cve = vuln.cve;
					if (seenIds.has(cve.id)) continue;

					const cwes = extractCWEs(cve.weaknesses ?? []);
					const { score, attackVector } = extractCVSS(
						(cve.metrics as Record<string, unknown>) ?? {},
					);

					if (score < minCvss) continue;
					if (cwes.length === 0) continue;

					seenIds.add(cve.id);
					const description =
						cve.descriptions.find((d) => d.lang === "en")?.value ?? "";

					records.push({
						id: cve.id,
						description,
						cvssScore: score,
						cwes,
						attackVector,
						references: (cve.references ?? []).map((r) => r.url),
						pocRepos: [],
						publishedDate: cve.published,
					});
				}

				startIndex += resultsPerPage;
				console.log(
					`    ${Math.min(startIndex, totalResults)}/${totalResults} (${records.length} total matching)`,
				);

				if (startIndex < totalResults) {
					await sleep(rateLimitMs);
				}
			} while (startIndex < totalResults);
		}
	}

	return records;
}

/**
 * List CVE IDs with PoCs from nomi-sec/PoC-in-GitHub using GitHub API.
 * The repo stores one JSON file per CVE in year directories (e.g., 2025/CVE-2025-0108.json).
 * We list filenames via the GitHub tree API to find which CVEs have PoCs,
 * then fetch details only for matching records.
 */
async function enrichWithPoCs(records: CVERecord[]): Promise<void> {
	const years = new Set<string>();
	for (const record of records) {
		const year = record.id.split("-")[1];
		if (year) years.add(year);
	}

	const recordIndex = new Map<string, CVERecord>();
	for (const record of records) {
		recordIndex.set(record.id, record);
	}

	console.log("Enriching with PoC data from nomi-sec/PoC-in-GitHub...");

	// Use GitHub git trees API to list all files efficiently
	const pocCVEIds = new Set<string>();
	try {
		const treeUrl =
			"https://api.github.com/repos/nomi-sec/PoC-in-GitHub/git/trees/master?recursive=1";
		const headers: Record<string, string> = {
			"User-Agent": "skills-build-cve-analyzer/1.0",
		};
		const ghToken = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
		if (ghToken) {
			headers.Authorization = `Bearer ${ghToken}`;
		}

		const response = await fetch(treeUrl, { headers });
		if (response.ok) {
			const data = (await response.json()) as {
				tree: Array<{ path: string; type: string }>;
			};
			for (const item of data.tree) {
				if (item.type !== "blob" || !item.path.endsWith(".json")) continue;
				// Path format: "2025/CVE-2025-0108.json"
				const fileName = item.path.split("/").pop();
				if (fileName?.startsWith("CVE-")) {
					pocCVEIds.add(fileName.replace(".json", ""));
				}
			}
			console.log(`  Found ${pocCVEIds.size} CVEs with PoCs in repository`);
		} else {
			console.log(
				`  Warning: GitHub tree API returned ${response.status}, skipping PoC enrichment`,
			);
			return;
		}
	} catch (error) {
		console.log(`  Warning: Could not fetch PoC index: ${error}`);
		return;
	}

	// Find matching records and fetch their PoC details
	const matchingIds = records
		.filter((r) => pocCVEIds.has(r.id))
		.map((r) => r.id);
	console.log(
		`  ${matchingIds.length} of ${records.length} fetched CVEs have PoCs`,
	);

	let enriched = 0;
	for (const cveId of matchingIds) {
		const year = cveId.split("-")[1];
		try {
			const url = `${POC_GITHUB_BASE}/${year}/${cveId}.json`;
			const response = await fetch(url);
			if (!response.ok) continue;

			const pocs = (await response.json()) as Array<{ html_url: string }>;
			const record = recordIndex.get(cveId);
			if (record) {
				record.pocRepos = pocs.map((p) => p.html_url);
				enriched++;
			}
		} catch {
			// Skip individual failures silently
		}

		// Brief pause to avoid rate limiting
		if (enriched % 50 === 0 && enriched > 0) {
			await sleep(1000);
		}
	}

	console.log(`  Enriched ${enriched}/${records.length} CVEs with PoC links`);
}

/**
 * Fetch CVE data with caching support.
 */
export async function fetchCVEData(
	minCvss: number,
	force: boolean,
): Promise<CVERecord[]> {
	ensureCacheDir();

	if (!force && isCacheFresh()) {
		console.log("Using cached CVE data (< 24h old). Use --force to refetch.");
		const cached = JSON.parse(readFileSync(CACHE_FILE, "utf-8")) as {
			records: CVERecord[];
		};
		return cached.records;
	}

	const records = await fetchFromNVD(minCvss);
	await enrichWithPoCs(records);

	// Save to cache
	const cacheData = {
		fetchDate: new Date().toISOString(),
		minCvss,
		totalRecords: records.length,
		records,
	};

	writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
	console.log(`Cached ${records.length} CVE records to ${CACHE_FILE}`);

	return records;
}

export { CACHE_DIR };
