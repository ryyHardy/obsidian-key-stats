import {
	Editor,
	MarkdownView,
	MarkdownFileInfo,
	Modal,
	Notice,
	Plugin,
} from 'obsidian';
import {
	KeyStatsSettings,
	DEFAULT_SETTINGS,
	KeyStatsSettingTab,
} from './settings';

export default class KeyStats extends Plugin {
	settings!: KeyStatsSettings;

	async onload() {
		await this.loadSettings();

		// Set up commands here if needed

		this.addSettingTab(new KeyStatsSettingTab(this.app, this));
	}

	onunload() {}

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
