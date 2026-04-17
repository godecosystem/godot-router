---
description: Learn how to set up and use Godot-Router for file-based routing in your Godot project.
---

import { Steps, Step } from '$ui/steps';

## Setup

<Steps>
	<Step id="install-addon" title="Install Godot-Router Addon">
		Download or install the Godot-Router addon in your Godot project.
	</Step>
	<Step id="enable-addon" title="Enable the Addon">
		In Godot, go to **Project > Project Settings > Plugins** and enable Godot-Router.
	</Step>
	<Step id="create-routes-folder" title="Create routes Folder">
		In your project, create a `routes` folder if it doesn't exist.
	</Step>
	<Step id="add-page" title="Add a Page">
		Add a new folder inside `routes` (e.g., `routes/main`), then add a `+page.tscn` scene inside it. This becomes a route.
	</Step>
	<Step id="set-main-scene" title="Set Main Scene">
		In Godot, go to **Project > Project Settings > Run > Main Scene** and set it to your new `+page.tscn` (e.g., `routes/main/+page.tscn`).
	</Step>
	<Step id="navigate" title="Navigate to Your Page">
		Run your project. In a script, use `Router.goto` to navigate to another route.
		```gdscript
		Router.goto("/main")
		```
	</Step>
</Steps>
