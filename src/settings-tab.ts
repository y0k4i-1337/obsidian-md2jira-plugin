import { PluginSettingTab, App, Setting, Notice, TextComponent, ButtonComponent, Modal } from 'obsidian';
import Md2JiraPlugin from './main';


export class Md2JiraPluginSettingsTab extends PluginSettingTab {
    plugin: Md2JiraPlugin;

    constructor(app: App, plugin: Md2JiraPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        let omitHeadingInput: TextComponent; // Declare text input outside
        let omitHeadingAddButton: ButtonComponent; // Declare button outside
        let ignoreSectionInput: TextComponent; // Declare text input outside
        let ignoreSectionAddButton: ButtonComponent; // Declare button outside

        containerEl.empty();
        containerEl.createEl('h1', { text: 'General' });

        // Heading Shift
        new Setting(containerEl)
            .setName('Heading Shift')
            .setDesc('Number of heading levels to shift (e.g., 1 turns # into h2.).')
            .addDropdown(dropdown => dropdown
                .addOptions({
                    '0': 'None',
                    '1': '1',
                    '2': '2',
                    '3': '3',
                    '4': '4',
                    '5': '5'
                })
                .setValue(this.plugin.settings.headingShift.toString())
                .onChange(async (value) => {
                    this.plugin.settings.headingShift = parseInt(value);
                    await this.plugin.saveSettings();
                }));

        // Convert Headings to Bold
        new Setting(containerEl)
            .setName('Convert Headings to Bold')
            .setDesc('Convert all headings to bold text instead of Jira headings.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.convertHeadingsToBold)
                .onChange(async (value) => {
                    this.plugin.settings.convertHeadingsToBold = value;
                    await this.plugin.saveSettings();
                }));

        // Keep Image Descriptions
        new Setting(containerEl)
            .setName('Keep Image Descriptions')
            .setDesc('Include image descriptions in the output.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.keepImageDescriptions)
                .onChange(async (value) => {
                    this.plugin.settings.keepImageDescriptions = value;
                    await this.plugin.saveSettings();
                }));

        // Save export path
        new Setting(containerEl)
            .setName('Export Path')
            .setDesc('Default path to save converted Jira files.')
            .addText(text => text
                .setPlaceholder('Enter path...')
                .setValue(this.plugin.settings.exportPath)
                .onChange(async (value) => {
                    this.plugin.settings.exportPath = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h1', { text: 'Filters' });

        // Omit Headings by Name (List with Add/Remove options)
        containerEl.createEl('h2', { text: 'Omit Headings' });
        new Setting(containerEl)
            .setName('Add heading to omit')
            .setDesc('Will not show this heading in the output (section content will still be converted).')
            .setClass('heading-add')
            .addText(text => {
                omitHeadingInput = text;
                text.setPlaceholder('Heading to omit');
                let inputEl = text.inputEl;
                inputEl.addEventListener('keypress', async (e) => {
                    if (e.key === 'Enter' && text.getValue()) { // Check if Enter key is pressed
                        this.plugin.settings.omitHeadings.push(text.getValue());
                        await this.plugin.saveSettings();
                        this.display(); // Refresh the display
                        text.setValue(''); // Clear the input field
                    }
                });
                text.onChange(async (value) => {
                    omitHeadingAddButton.setDisabled(!value); // Enable button if input is not empty
                    omitHeadingAddButton.buttonEl.toggleClass('disabled-button', !value);
                });
                inputEl.classList.add('heading-input');
            })
            .addButton(button => {
                omitHeadingAddButton = button;
                button.setIcon('plus');
                button.setDisabled(true);
                button.onClick(async () => {
                    if (omitHeadingInput.getValue()) { // Only push if there's a valid input
                        this.plugin.settings.omitHeadings.push(omitHeadingInput.getValue());
                        await this.plugin.saveSettings();
                        this.display(); // Refresh the display
                        omitHeadingInput.setValue(''); // Clear the input field
                    }
                });
                button.buttonEl.toggleClass('disabled-button', true);
            });

        // List of headings to omit
        this.plugin.settings.omitHeadings.forEach(heading => {
            // Keep track of the old value
            const oldHeading = heading;
            new Setting(containerEl)
                .setName(heading)
                .addButton(button => {
                    button.setIcon('pencil');
                    button.setTooltip('Edit heading');
                    button.onClick(() => {
                        const modal = new Modal(this.plugin.app);
                        modal.modalEl.classList.add('edit-modal');
                        modal.titleEl.setText('Edit heading to omit');

                        // Create the save button.
                        const button = new ButtonComponent(modal.contentEl);
                        button.setButtonText('Save Changes');
                        button.onClick(async () => {
                            this.plugin.settings.omitHeadings = this.plugin.settings.omitHeadings.map(item => item === oldHeading ? input.inputEl.value : item);
                            await this.plugin.saveSettings();
                            this.display(); // Refresh
                            new Notice('Heading updated.');
                            modal.close();
                        });
                        // Create the input for the rule.
                        const input = new TextComponent(modal.contentEl);
                        input.inputEl.value = heading;
                        input.inputEl.addEventListener('keypress', async (e) => {
                            if (e.key === 'Enter' && input.inputEl.value) {
                                this.plugin.settings.omitHeadings = this.plugin.settings.omitHeadings.map(item => item === oldHeading ? input.inputEl.value : item);
                                await this.plugin.saveSettings();
                                this.display(); // Refresh
                                new Notice('Heading updated.');
                                modal.close();
                            }
                        });


                        modal.open();
                    })
                })
                .addButton(button => button
                    .setIcon('trash')
                    .setClass('btn-delete')
                    .onClick(async () => {
                        this.plugin.settings.omitHeadings = this.plugin.settings.omitHeadings.filter(item => item !== oldHeading);
                        await this.plugin.saveSettings();
                        this.display(); // Refresh
                    }));

        });

        // Ignore Sections (List with Add/Remove options)
        containerEl.createEl('h2', { text: 'Ignore Sections by Heading' });
        new Setting(containerEl)
            .setName('Add section to ignore')
            .setDesc('Will not show this section in the output.')
            .setClass('heading-add')
            .addText(text => {
                ignoreSectionInput = text;
                text.setPlaceholder('Section to ignore');
                let inputEl = text.inputEl;
                inputEl.addEventListener('keypress', async (e) => {
                    if (e.key === 'Enter' && text.getValue()) { // Check if Enter key is pressed
                        this.plugin.settings.ignoreSections.push(text.getValue());
                        await this.plugin.saveSettings();
                        this.display(); // Refresh the display
                        text.setValue(''); // Clear the input field
                    }
                });
                text.onChange(async (value) => {
                    ignoreSectionAddButton.setDisabled(!value); // Enable button if input is not empty
                    ignoreSectionAddButton.buttonEl.toggleClass('disabled-button', !value);
                });
                inputEl.classList.add('heading-input');
            })
            .addButton(button => {
                ignoreSectionAddButton = button;
                button.setIcon('plus');
                button.setDisabled(true);
                button.onClick(async () => {
                    if (ignoreSectionInput.getValue()) { // Only push if there's a valid input
                        this.plugin.settings.ignoreSections.push(ignoreSectionInput.getValue());
                        await this.plugin.saveSettings();
                        this.display(); // Refresh the display
                        ignoreSectionInput.setValue(''); // Clear the input field
                    }
                });
                button.buttonEl.toggleClass('disabled-button', true);
            });

        // List of sections to ignore
        this.plugin.settings.ignoreSections.forEach(section => {
            // Keep track of the old value
            const oldSection = section;
            new Setting(containerEl)
                .setName(section)
                .addButton(button => {
                    button.setIcon('pencil');
                    button.setTooltip('Edit section');
                    button.onClick(() => {
                        const modal = new Modal(this.plugin.app);
                        modal.modalEl.classList.add('edit-modal');
                        modal.titleEl.setText('Edit section to ignore');

                        // Create the save button.
                        const button = new ButtonComponent(modal.contentEl);
                        button.setButtonText('Save Changes');
                        button.onClick(async () => {
                            this.plugin.settings.ignoreSections = this.plugin.settings.ignoreSections.map(item => item === oldSection ? input.inputEl.value : item);
                            await this.plugin.saveSettings();
                            this.display(); // Refresh
                            new Notice('Section updated.');
                            modal.close();
                        });
                        // Create the input for the rule.
                        const input = new TextComponent(modal.contentEl);
                        input.inputEl.value = section;
                        input.inputEl.addEventListener('keypress', async (e) => {
                            if (e.key === 'Enter' && input.inputEl.value) {
                                this.plugin.settings.ignoreSections = this.plugin.settings.ignoreSections.map(item => item === oldSection ? input.inputEl.value : item);
                                await this.plugin.saveSettings();
                                this.display(); // Refresh
                                new Notice('Section updated.');
                                modal.close();
                            }
                        });

                        modal.open();
                    })
                })
                .addButton(button => button
                    .setIcon('trash')
                    .setClass('btn-delete')
                    .onClick(async () => {
                        this.plugin.settings.ignoreSections = this.plugin.settings.ignoreSections.filter(item => item !== oldSection);
                        await this.plugin.saveSettings();
                        this.display(); // Refresh
                    }));
        });
    }
}
