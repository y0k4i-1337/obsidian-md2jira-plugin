import { Editor, Notice, Plugin, TFile } from 'obsidian';
import { marked, Token } from 'marked';
import { DEFAULT_SETTINGS } from './constants';
import { Md2JiraPluginSettings } from './types';
import { Md2JiraPluginSettingsTab } from './settings-tab';
import { renderer } from './parser';

export default class Md2JiraPlugin extends Plugin {
    settings: Md2JiraPluginSettings;

    async onload() {
        console.log("Loading Markdown to Jira plugin");
        await this.loadSettings();

        marked.use({ renderer });

        this.addSettingTab(new Md2JiraPluginSettingsTab(this.app, this));

        this.addCommand({
            id: 'convert-to-jira-format',
            name: 'Convert to Jira format and copy to clipboard',
            editorCallback: (editor: Editor) => {
                const content = editor.getValue();
                const jiraContent = this.convertToJiraFormat(content);
                navigator.clipboard.writeText(jiraContent);
                new Notice('Converted to Jira format and copied to clipboard');
            }
        });

        this.addCommand({
            id: 'export-to-jira-format',
            name: 'Export to Jira format as file',
            callback: async () => {
                const activeFile = this.app.workspace.getActiveFile();
                if (activeFile) {
                    await this.exportFileToJira(activeFile);
                } else {
                    new Notice('No active file');
                }
            }
        })

        // Ribbon to export the current file to Jira format
        this.addRibbonIcon('ticket', 'Export to Jira format as file', async () => {
            const activeFile = this.app.workspace.getActiveFile();
            if (activeFile) {
                await this.exportFileToJira(activeFile);
            } else {
                new Notice('No active file');
            }
        });
    }

    onunload() {
        console.log("Unloading Markdown to Jira plugin");
    }

    convertToJiraFormat(content: string): string {
        let omitHeadings = this.settings.omitHeadings;
        let ignoreSections = this.settings.ignoreSections;
        let headingShift = this.settings.headingShift;

        // Ignore frontmatter
        content = content.replace(/---\n([\s\S]*?)\n---\n/, "");

        let converted = marked.parse(content, { async: false });

        // Remove entire sections (including all nested content)
        if (ignoreSections.length > 0) {
            let lines = converted.split("\n");
            let newLines: string[] = [];
            let skip = false;
            let skipLevel = 0;

            for (let line of lines) {
                let headingMatch = line.match(/^h([1-6])\. (.*)/);

                if (headingMatch) {
                    let level = parseInt(headingMatch[1]);
                    let headingText = headingMatch[2];

                    // Calculate the new level after shifting
                    let newLevel = Math.min(6, Math.max(1, level + headingShift));

                    // Update the heading level
                    line = `h${newLevel}. ${headingText}`;

                    // Check if we are in an ignored section
                    if (ignoreSections.includes(headingText)) {
                        skip = true;
                        skipLevel = level;
                        continue; // Do not add this heading
                    }

                    // If we reach a heading of equal or higher level, stop skipping
                    if (skip && level <= skipLevel) {
                        skip = false;
                    }
                }

                if (!skip) {
                    newLines.push(line);
                }
            }

            converted = newLines.join("\n");
        }

        // Remove specific headings but keep content
        if (omitHeadings.length > 0) {
            let omitRegex = new RegExp(`^h[1-6]\\. (${omitHeadings.map(h => escapeRegex(h)).join("|")})\\n?\\n*`, "gm");
            converted = converted.replace(omitRegex, "");
        }

        return converted;
    }

    async exportFileToJira(file: TFile) {
        const content = await this.app.vault.read(file);
        const jiraContent = this.convertToJiraFormat(content);
        const outputPath = this.settings.exportPath;
        const outputName = file.basename + '-jira.txt';
        // Create the export directory if it doesn't exist
        await this.app.vault.adapter.mkdir(outputPath);
        await this.app.vault.adapter.write(`${outputPath}/${outputName}`, jiraContent);
        new Notice(`Exported to Jira format! Check ${outputPath}/${outputName}`);
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

// Helper function to escape regex special characters
function escapeRegex(text: string): string {
    return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}
