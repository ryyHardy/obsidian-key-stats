import { Plugin } from 'obsidian';
import {
	KeyStatsSettings,
	DEFAULT_SETTINGS,
	KeyStatsSettingTab,
} from './settings';

import { EditorView } from '@codemirror/view';
import { EditEvent } from './types';
import { getBursts, burstWPM, weightedSessionWPM } from './stats';

// TODO: Add a mechanism that clears the events array occassionally, because that thing is just growing and growing

export default class KeyStats extends Plugin {
	settings!: KeyStatsSettings;
	statusBarItemEl!: HTMLElement;
	events: EditEvent[] = [];
	statusUpdateTimer: number | null = null;

	async onload() {
		await this.loadSettings();

		// Set up commands here if needed

		this.addSettingTab(new KeyStatsSettingTab(this.app, this));

		this.statusBarItemEl = this.addStatusBarItem().createEl('span', {
			text: 'Stats: Ready',
		});

		this.registerEditorExtension(
			EditorView.updateListener.of((update) => {
				if (!update.docChanged) return;

				const now = Date.now();
				const fileKey = this.app.workspace.getActiveFile()?.path ?? '';

				for (const tr of update.transactions) {
					if (!tr.docChanged) continue;

					const selectionBefore = {
						anchor: tr.startState.selection.main.anchor,
						head: tr.startState.selection.main.head,
					};
					const selectionAfter = {
						anchor: tr.newSelection.main.anchor,
						head: tr.newSelection.main.head,
					};

					tr.changes.iterChanges(
						(fromA, toA, fromB, toB, inserted) => {
							const deletedText = tr.startState.doc.sliceString(
								fromA,
								toA,
							);
							const insertedText = inserted.toString();

							this.events.push({
								timestamp: now,
								fileKey,
								deletedFrom: fromA,
								deletedTo: toA,
								deletedText,
								insertedFrom: fromB,
								insertedTo: toB,
								insertedText,
								selectionBefore,
								selectionAfter,
							});
						},
					);
				}
				if (this.statusUpdateTimer !== null)
					window.clearTimeout(this.statusUpdateTimer);
				this.statusUpdateTimer = window.setTimeout(
					() => this.updateStatusBar(),
					500,
				);
			}),
		);
	}

	onunload() {}

	updateStatusBar() {
		const now = Date.now();
		const GAP_THRESHOLD = 2000;

		const bursts = getBursts(this.events, GAP_THRESHOLD);
		if (bursts.length === 0) return;

		const lastBurst = bursts[bursts.length - 1]!;
		const lastEventAge = now - lastBurst[lastBurst.length - 1]!.timestamp;
		const isActive = lastEventAge < GAP_THRESHOLD;

		// If the last burst is still active, it's the "live" burst
		// If not, the user is paused - show the last completed burst's speed
		const currentWPM = burstWPM(lastBurst);

		// Session WPM: duration-weighted average across all bursts
		const sessionWPM = weightedSessionWPM(bursts);

		const indicator = isActive ? '⌨' : '·';
		this.statusBarItemEl.setText(
			`${indicator} ${Math.round(currentWPM)} WPM  |  session: ${Math.round(sessionWPM)} WPM`,
		);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<KeyStatsSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
