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
				{ title: 'Quick Start', icon: 'rocket' }
			]
		},
		{
			title: 'Routing',
			icon: 'route',
			pages: 'auto'
		},
		{
			title: 'Advanced Routing',
			icon: 'waypoints',
			pages: 'auto'
		},
		{
			title: 'Miscellaneous',
			icon: 'dices',
			pages: 'auto'
		},
		{
			title: 'API Reference',
			icon: 'book',
			pages: [{ title: 'Router (autoload)', fileName: 'api-reference/router.md' }, 'loadRest']
		}
	]
});

export default docNavigationConfig;
