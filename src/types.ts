export type EditEvent = {
	timestamp: number; // Date.now()
	fileKey: string;

	deletedFrom: number;
	deletedTo: number;
	deletedText: string;
	insertedFrom: number;
	insertedTo: number;
	insertedText: string;

	selectionBefore: { anchor: number; head: number };
	selectionAfter: { anchor: number; head: number };
};

export type DailyStats = {
	date: string;
	totalActiveMs: number; // sum of burst durations
	totalNetChars: number;
	totalGrossChars: number; // added + deleted
	totalDeletedChars: number;
	burstCount: number;
	avgWPM: number; // weighted by duration
	errorEvents: number;
};
