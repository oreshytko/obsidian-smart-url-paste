import { DEFAULT_SETTINGS, InsertLinksPluginSettingTab, InsertLinksPluginSettings } from './settings';
import { Editor, MarkdownFileInfo, MarkdownView, Plugin } from "obsidian";

import fetch from 'node-fetch';

export default class InsertLinksPlugin extends Plugin {
  private pasteHandler!: (event: ClipboardEvent, editor: Editor, info: MarkdownView | MarkdownFileInfo) => void;
  private shiftKeyPressed = false;
  settings!: InsertLinksPluginSettings;

  async onload() {

    const loadedData = await this.loadData();
    this.settings = loadedData ? loadedData : DEFAULT_SETTINGS;

    this.addSettingTab(new InsertLinksPluginSettingTab(this.app, this));

    this.registerDomEvent(document, "keydown", (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        this.shiftKeyPressed = true;
      }
    });

    this.registerDomEvent(document, "keyup", (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        this.shiftKeyPressed = false;
      }
    });

    this.pasteHandler = (event: ClipboardEvent, editor: Editor, info: MarkdownView | MarkdownFileInfo) => {

      try {
        if (event.clipboardData) {
          const text = event.clipboardData.getData("text/plain");

          const url = new URL(text); // this is to check and continue only if it's a URL
          
          event.stopPropagation();
          event.preventDefault();

          if (this.shiftKeyPressed) {
            editor.replaceSelection(text);
          }
          else {
            getPageTitle(text).then((title) => {
              if (title) {
                const prefix = this.getPrefixForUrl(url);
                let result = `[${title}](${text})`;
                if (prefix) {
                  result = `${prefix} ${result}`;
                }
                editor.replaceSelection(result);
              } else {
                editor.replaceSelection(text);
              }
            }).catch((error) => {
              console.error('Error fetching URL:', error);
              editor.replaceSelection(text);
            });
          }
        }
      }
      catch (e) {
        // do nothing
      }
    };

    this.app.workspace.on("editor-paste", this.pasteHandler);
  }

  async onunload() {
    await this.saveData(this.settings);
    this.app.workspace.off("editor-paste", this.pasteHandler);
  }

  getPrefixForUrl(url: URL): string | null {
    try {
      const inputDomain = url.hostname;

      for (const [mappingUrl, customPrefix] of Object.entries(this.settings.urlPrefixes)) {
        const mappingDomain = new URL(mappingUrl).hostname;
        if (inputDomain === mappingDomain) {
          return customPrefix;
        }
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
    }
    return null;
  }
}


async function isPdfUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('Content-Type');

    if (contentType && contentType.toLowerCase().includes('application/pdf')) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error fetching URL:', error);
    return false;
  }
}


async function getPageTitle(url: string): Promise<string | null> {

  if (await isPdfUrl(url)) {
    return null;
  }

  const response = await fetch(url);
  const htmlText = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');
  const titleElement = doc.querySelector('head title');

  if (titleElement) {
    return titleElement.textContent;
  } else {
    return null;
  }
}
