extends Route
class_name Page

## A Page represents a navigable page or route in the application.

# The url that this page is associated with.
var url: String

# A dictionary of parameters extracted from the url when this page is navigated to.
# A url like "/user?id=123&q=username" would result in params being { "id": "123", "q": "username" }.
var params: Dictionary[String, String]