import { Plugin } from 'obsidian';
import {
	KeyStatsSettings,
	DEFAULT_SETTINGS,
	KeyStatsSettingTab,
} from './settings';

import { EditorView } from '@codemirror/view';
import { ChangeEvent, getBursts, burstWPM, weightedSessionWPM } from './stats';

export default class KeyStats extends Plugin {
	settings!: KeyStatsSettings;
	statusBarItemEl!: HTMLElement;
	events: ChangeEvent[] = [];
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

				let added = 0,
					deleted = 0;

				for (const tr of update.transactions) {
					if (!tr.docChanged) continue;

					tr.changes.iterChanges(
						(fromA, toA, fromB, toB, inserted) => {
							const deletedStr = tr.startState.doc.sliceString(
								fromA,
								toA,
							);
							const addedStr = inserted.toString();

							added += addedStr.length;
							deleted += deletedStr.length;
						},
					);
				}

				this.events.push({ timestamp: Date.now(), added, deleted });

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
		// If not, the user is paused — show the last completed burst's speed
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
