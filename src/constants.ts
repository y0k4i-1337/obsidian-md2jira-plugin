import { Md2JiraPluginSettings } from "./types";

export const DEFAULT_SETTINGS: Partial<Md2JiraPluginSettings> = {
	omitHeadings: [],
	ignoreSections: [],
	headingShift: 0,
	convertHeadingsToBold: false,
	keepImageDescriptions: true,
	exportFormat: 'jira',
	exportPath: '/exports'
};
