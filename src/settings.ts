import { App, PluginSettingTab, Setting } from 'obsidian';
import KeyStats from './main';

export interface KeyStatsSettings {
	enabled: boolean;
}

export const DEFAULT_SETTINGS: KeyStatsSettings = {
	enabled: true,
};

export class KeyStatsSettingTab extends PluginSettingTab {
	plugin: KeyStats;

	constructor(app: App, plugin: KeyStats) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Enable tracking')
			.setDesc('Whether keystroke tracking is on')
			.addToggle((toggle) =>
				toggle.onChange(async (value) => {
					this.plugin.settings.enabled = value;
					await this.plugin.saveSettings();
				}),
			);
	}
}
