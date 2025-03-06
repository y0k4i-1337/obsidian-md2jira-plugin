# Obsidian Markdown to Jira Plugin

This plugin allows you to export your Obsidian notes to Jira.

## Features

- Export notes to Jira text formatting notation;
- Allows you to omit headings in the exported text;
- Allows you to omit entire sections in the exported text;
- Converted text can be copied to the clipboard or saved to a file.

## How to use

### Converting a note and copying to the clipboard

1. Open the note you want to convert;
2. Open the command palette (`Ctrl+P` or `Cmd+P`);
3. Type `Convert to Jira format and copy to clipboard` and select the command;
4. The converted text will be copied to the clipboard.

### Converting a note and saving to a file

1. Open the note you want to convert;
2. Open the command palette (`Ctrl+P` or `Cmd+P`);
3. Type `Export to Jira format as file` and select the command;
4. The converted text will be saved to a file in the folder configured in the
   plugin settings;
5. Alternatively, you can select the note to be converted and use the `Export to Jira format as file` button in the
   ribbon.

## Limitations

- The plugin was not tested with all possible markdown syntax.

## Syntax compatibility

The plugin supports the following syntax conversion:

| Obsidian | Jira |
|----------|------|
| `# Heading level 1`      | `h1. Heading level 1`|
| `## Heading level 2`     | `h2. Heading level 2`|
| `### Heading level 3`    | `h3. Heading level 3`|
| `#### Heading level 4`   | `h4. Heading level 4`|
| `##### Heading level 5`  | `h5. Heading level 5`|
| `###### Heading level 6` | `h6. Heading level 6`|
| `**Bold text**`, `__Bold text__`          | `*Bold text*`|
| `*Italic text*`, `_Italic text_`          | `_Italic text_`|
| `[Link to Duck Duck Go](https://duckduckgo.com)` | `[Link to Duck Duck Go\|https://duckduckgo.com]` |
| `![Tux, the Linux mascot](/assets/images/tux.png)` | `!tux.png\|alt="Tux, the Linux mascot",title="Tux, the Linux mascot"!` |
| `` `code` `` | `{{nano}}` |
| `` ```\n...multiline code...\n``` `` | `{code:none}\n...multiline code...\n{code}` |

## Installation

### Manual installation

1. Download the latest release from the
   [Releases](https://github.com/y0k4i-1337/obsidian-md2jira-plugin/releases)
   page;
2. Download `main.js` and `manifest.json` to a proper folder inside your vault's plugins folder;
3. Reload Obsidian.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
