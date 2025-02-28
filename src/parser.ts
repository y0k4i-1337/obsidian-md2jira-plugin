import { Tokens, marked } from 'marked'
import { LANG_MAP, MAX_CODE_LINE } from './constants'

// Override functions
export const renderer = {
    paragraph({ tokens }: Tokens.Paragraph): string {
        return `${this.parser.parseInline(tokens)}\n\n`;
    },
    html({ text }: Tokens.HTML): string {
        return text
    },
    heading({ tokens, depth }: Tokens.Heading): string {
        const text = this.parser.parseInline(tokens);
        return `h${depth}. ${text}\n\n`
    },
    strong({ text }: Tokens.Strong): string {
        return `*${text}*`
    },
    em({ text }: Tokens.Em): string {
        return `_${text}_`
    },
    del({ text }: Tokens.Del): string {
        return `-${text}-`
    },
    codespan({ text }: Tokens.Codespan): string {
        return `{{${text}}}`
    },
    blockquote({ tokens }: Tokens.Blockquote): string {
        const text = this.parser.parseInline(tokens);
        return `{quote}${text}{quote}`
    },
    br(): string {
        return '\n'
    },
    hr(): string {
        return '----\n\n'
    },
    link({ href, title, tokens }: Tokens.Link): string {
        const text = this.parser.parseInline(tokens);
        if (text != null) {
            return `[${text}|${href}]`;
        } else {
            return `[${href}]`;
        }
    },
    list(token: Tokens.List): string {
        const type = token.ordered ? '#' : '*'

        let body = '';
        for (const item of token.items) {
            body += type + ' ' + this.listitem(item) + "\n";
        }

        return body + '\n';
    },
    listitem(item: Tokens.ListItem): string {
        let itemBody = '';
        itemBody += this.parser.parse(item.tokens, !!item.loose);

        return `${itemBody}`;
    },
    image({href, title, text}: Tokens.Image): string {
        return `!${href}!`
    },
    table(token: Tokens.Table): string {
        let header = '';

        // header
        let cell = '';
        for (let j = 0; j < token.header.length; j++) {
            cell += this.tablecell(token.header[j]);
        }
        header += this.tablerow({ text: cell });

        let body = '';
        for (let j = 0; j < token.rows.length; j++) {
            const row = token.rows[j];

            cell = '';
            for (let k = 0; k < row.length - 1; k++) {
                cell += this.tablecell(row[k]) + '|';
            }
            cell += this.tablecell(row[row.length - 1]);

            body += this.tablerow({ text: cell });
        }

        return header + body;
    },
    tablerow({text}: Tokens.TableRow): string {
        return '|' + text + '|\n';
    },
    tablecell(token: Tokens.TableCell): string {
        const content = this.parser.parseInline(token.tokens);
        if (token.header) {
            return `|${content}|`;
        } else {
            return `${content}`;
        }
    },
    code({ text, lang, escaped }: Tokens.Code): string {
        let langString = /^\S*/.exec(lang ?? '')?.[0] ?? 'none';

        return `{code:language=${langString ?? ''}|borderStyle=solid|theme=RDark|linenumbers=false|collapse=${text.split('\n').length > MAX_CODE_LINE}}\n${text}\n{code}\n\n`
    },
    text(token: Tokens.Text | Tokens.Escape): string {
        return 'tokens' in token && token.tokens
            ? this.parser.parseInline(token.tokens)
            : token.text;
    },

    checkbox({ checked }: Tokens.Checkbox): string {
        return checked ? '[x]' : '[-]'
    }
}

// marked.use({ renderer });


export function convert(markdown: string): string {
    let content = marked.parse(markdown, { async: false});
    return content;
}

export function fixCommentedCodeBlocks(markdown: string): string {
    let inCodeBlock = false; // keep track if we are inside a code block
    // split by lines and map through them to apply transformation
    return markdown.split('\n').map(line => {
        // check if this line is the start or end of a code block
        if (line.includes('{code')) {
            inCodeBlock = true;
            return line.split('# ').join('');
        } else if (line.includes('{code}')) {
            inCodeBlock = false;
            return line.split('# ').join('');
        }
        // if inside a code block and the line starts with a '#', remove the '#'
        if (inCodeBlock && line.startsWith('#')) {
            return line.slice(1);
        } else {
            return line;
        }
    }).join('\n'); // join back to get the transformed string
}
