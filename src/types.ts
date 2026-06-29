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
