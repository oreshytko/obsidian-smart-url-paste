import { App, PluginSettingTab, TextComponent } from "obsidian";

import InsertLinksPlugin from './main';

export const DEFAULT_SETTINGS = {
  urlPrefixes: {
    'https://www.youtube.com': '🎥',
    'https://medium.com': '📄',
    'https://arxiv.org': '📄',
    'https://towardsdatascience.com': '📄'
  }
};

export class InsertLinksPluginSettings {
  urlPrefixes: { [key: string]: string } = {...DEFAULT_SETTINGS.urlPrefixes};
}
  
  
export class InsertLinksPluginSettingTab extends PluginSettingTab {
  plugin: InsertLinksPlugin;

  constructor(app: App, plugin: InsertLinksPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Custom prefixes for URLs' });

    // Create a table to display existing url prefix mappings
    const mappingsTable = containerEl.createEl('table');
    const headerRow = mappingsTable.createEl('tr');
    headerRow.createEl('th', { text: 'URL' });
    headerRow.createEl('th', { text: 'Custom Prefix' });
    headerRow.createEl('th', { text: 'Actions' });

    for (const [url, mappedString] of Object.entries(this.plugin.settings.urlPrefixes)) {
      const row = mappingsTable.createEl('tr');
      row.createEl('td', { text: url });
      row.createEl('td', { text: mappedString });

      // Add action buttons for deleting mappings
      const actionsCell = row.createEl('td');

      const deleteButton = actionsCell.createEl('button', { text: 'Delete' });
      deleteButton.addEventListener('click', async () => {
          delete this.plugin.settings.urlPrefixes[url];
          await this.plugin.saveData(this.plugin.settings);
          this.display(); // Refresh the display to show the updated list of mappings
      });
    }

    // Create a row with input fields for adding new mappings
    const newRow = mappingsTable.createEl('tr');

    const urlInputCell = newRow.createEl('td');
    const urlInput = new TextComponent(urlInputCell);
    urlInput.inputEl.placeholder = 'https://example.com';

    const stringInputCell = newRow.createEl('td');
    const stringInput = new TextComponent(stringInputCell);
    stringInput.inputEl.placeholder = 'My custom prefix';

    const addButtonCell = newRow.createEl('td');
    const addButton = addButtonCell.createEl('button', { text: 'Add Prefix' });

    // Create a button for adding new mappings
    addButton.addEventListener('click', async () => {
      const url = urlInput.getValue().trim();
      const customString = stringInput.getValue().trim();

      if (url && customString) {
          this.plugin.settings.urlPrefixes[url] = customString;
          await this.plugin.saveData(this.plugin.settings);
          this.display(); // Refresh the display to show the updated list of mappings
      }
    });
  }
}