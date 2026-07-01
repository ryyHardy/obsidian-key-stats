import { IconName, ItemView, WorkspaceLeaf } from 'obsidian';

export const VIEW_TYPE_KEY_STATS = 'typing-stats-view';

export class TypingStatsView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_KEY_STATS;
	}

	getDisplayText() {
		return 'Typing stats';
	}

	getIcon(): IconName {
		return 'keyboard';
	}

	async onOpen() {
		const container = this.contentEl;
		container.empty();
		container.createEl('h4', { text: 'Typing stats' });
	}

	async onClose() {
		// Add cleanup here if needed
	}
}
