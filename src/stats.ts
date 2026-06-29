export interface ChangeEvent {
	timestamp: number; // Date.now()
	added: number; // characters added
	deleted: number; // characters deleted
	// TODO: Add cursor position maybe
}

export function getBursts(
	changes: ChangeEvent[],
	gapThreshold = 2000,
): ChangeEvent[][] {
	const bursts: ChangeEvent[][] = [];
	let current: ChangeEvent[] = [];

	for (const event of changes) {
		if (
			current.length > 0 &&
			event.timestamp - current[current.length - 1]!.timestamp >
				gapThreshold
		) {
			bursts.push(current);
			current = [];
		}
		current.push(event);
	}
	if (current.length > 0) bursts.push(current);
	return bursts;
}

export function burstWPM(burst: ChangeEvent[], minWindowMs = 3000): number {
	if (burst.length === 0) return 0;

	const first = burst[0]!;
	const last = burst[burst.length - 1]!;

	const elapsed = last.timestamp - first.timestamp;

	const durationMinutes = Math.max(elapsed, minWindowMs) / 60000;
	const netChars = burst.reduce((sum, e) => sum + e.added - e.deleted, 0);
	return Math.max(0, netChars) / 5 / durationMinutes;
}

export function weightedSessionWPM(bursts: ChangeEvent[][]): number {
	let totalWeightedWPM = 0;
	let totalDuration = 0;

	for (const burst of bursts) {
		const duration =
			burst[burst.length - 1]!.timestamp - burst[0]!.timestamp;
		if (duration < 500) continue; // skip single-event or near-instant bursts
		const wpm = burstWPM(burst);
		totalWeightedWPM += wpm * duration;
		totalDuration += duration;
	}

	return totalDuration === 0 ? 0 : totalWeightedWPM / totalDuration;
}
