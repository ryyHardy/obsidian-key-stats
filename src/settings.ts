import { App, PluginSettingTab, Setting } from 'obsidian';
import TypingStats from './main';

export interface TypingStatsSettings {
	enabled: boolean;
}

export const DEFAULT_SETTINGS: TypingStatsSettings = {
	enabled: true,
};

export class TypingStatsSettingTab extends PluginSettingTab {
	plugin: TypingStats;

	constructor(app: App, plugin: TypingStats) {
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
