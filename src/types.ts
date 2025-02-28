export interface Md2JiraPluginSettings {
	omitHeadings: string[];
	ignoreSections: string[];
	headingShift: number;
	convertHeadingsToBold: boolean;
    keepImageDescriptions: boolean;
    useImageThumbnails: boolean;
	exportFormat: string;
	exportPath: string;
}
