export interface Md2JiraPluginSettings {
	omitHeadings: string[];
	ignoreSections: string[];
	headingShift: number;
	convertHeadingsToBold: boolean;
	keepImageDescriptions: boolean;
	exportFormat: string;
	exportPath: string;
}
