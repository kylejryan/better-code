export interface CVERecord {
	id: string;
	description: string;
	cvssScore: number;
	cwes: string[];
	attackVector: string;
	references: string[];
	pocRepos: string[];
	publishedDate: string;
}

export interface PatternCluster {
	cweId: string;
	cweName: string;
	count: number;
	avgCvss: number;
	representativeCVEs: CVERecord[];
	existingCoverage: string | null;
	suggestedSection: string;
}

export interface GapAnalysis {
	totalCVEs: number;
	fetchDate: string;
	clusters: PatternCluster[];
	coveredClusters: PatternCluster[];
	uncoveredClusters: PatternCluster[];
}

export interface PipelineOptions {
	force: boolean;
	limit: number;
	minCvss: number;
}
