extends Resource
class_name Route

## A Route represents a layout or page.

# A reference to the Node in the scene tree.
var node: Node

# A dictionary of arbitrary data associated with this route.
# Route data is merged together for the current `Router.page`.
var data: Dictionary[String, Variant]
