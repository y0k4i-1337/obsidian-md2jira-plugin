import { Md2JiraPluginSettings } from "./types";

export const DEFAULT_SETTINGS: Partial<Md2JiraPluginSettings> = {
    omitHeadings: [],
    ignoreSections: [],
    headingShift: 0,
    convertHeadingsToBold: false,
    exportFormat: 'jira',
    exportPath: '/exports'
};

export const MAX_CODE_LINE = 50;
export const LANG_MAP = {
    shell: 'bash',
    bash: 'bash',
    zsh: 'bash',
    actionscript3: 'actionscript3',
    csharp: 'csharp',
    coldfusion: 'coldfusion',
    cpp: 'cpp',
    css: 'css',
    delphi: 'delphi',
    diff: 'diff',
    erlang: 'erlang',
    groovy: 'groovy',
    java: 'java',
    javafx: 'javafx',
    js: 'javascript',
    javascript: 'javascript',
    ts: 'typescript',
    typescript: 'typescript',
    perl: 'perl',
    php: 'php',
    none: 'none',
    powershell: 'powershell',
    python: 'python',
    ruby: 'ruby',
    scala: 'scala',
    rust: 'rust',
    sql: 'sql',
    vb: 'vb',
    'html/xml': 'html/xml'
};
