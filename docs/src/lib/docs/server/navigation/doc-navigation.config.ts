import { defineDocNavigation } from './define-doc-navigation';

// The Navigation Config defines how the documentation is loaded and presented.
// The 'auto' option allows for automatic generation based on the file structure, while 'loadRest' can be used to load remaining items after explicitly defined ones.
// You can customize the navigation by defining your own tabs, groups, and pages.
// You can hover over the properties in your IDE to see detailed explanations of each option.

const docNavigationConfig = defineDocNavigation({
	groups: [
		{
			title: 'Getting Started',
			icon: 'goal',
			showTitle: false,
			combineHref: false,
			pages: [
				{ title: 'Introduction', icon: 'book-open-check', slug: 'docs' },
				{ title: 'Quick Start', icon: 'rocket' },
				'loadRest'
			]
		},
		{
			title: 'Configuration',
			icon: 'cog',
			pages: 'auto'
		}
	]
});

export default docNavigationConfig;
