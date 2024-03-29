# Signatures

Borrowing to the point of theft from https://github.com/Rosuav/StilleBot.

## Dependencies

- gtk2 (`brew install gtk+`)
- Pike 9+
- Image Magic (`brew install imagemagick`)

## Development

There's an `.editorconfig` file to help with consistency between devs and environments.
For VS Code [this extension](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig) will enable it.
There are extensions for other editors as well.

### Pike

Array `({})`
Mapping `([])`
Set `(<>)`
Split string `string / "boundary"`
While app is running, type `update` to hot reload.
A file is a class (or "program" (from LPC)) in Pike, so at top of file you can: `inherit`.
Create a program within a program (file/class) using the `class` keyword. This will be of _type_ `program`.
`@` is the spread operator

To get extra debug information on stdout: `pike -DSP_DEBUG app`

## Markdown Parsing

Markdown elements can receive a following  `> `

The `render()` method of `http_request` (which inherits from (currently) `websocket_handler`) accepts
a mapping, which is a set of replacements.
When `vars` is submitted, it writes js vars into a script tag.
There are also some defaults, for example `ws_type` and `ws_code`, which
default to the module name (eg `index` and `/static/index.js`) _if_ `ws_group` is
present.
For example:
```
return render(req,
	([
			"vars": (["ws_group": "", "helloworld": 1234]),
			"foo": "foo-value",
	]));
	```

Will yield:
```
<script>let helloworld = 1234;
let ws_group = "";
let ws_type = "index";
let ws_code = "/static/index.js";
let ws_sync = null; import('/static/ws_sync.js?mtime=1711459399').then(m => ws_sync = m);</script>
```

Here's an example markdown with additional variables (and defaults) defined:

```
constant markdown = #"# PageFlow Index Screen

* This is a variable: $$foo$$
* This variable has no value but a default: $$bar||bar-default$$
";
```

Markdown can be rendered directly via the http module (`index.pike`, etc), or via
a `.md` file with matching name. The one in the pike file takes precedence.

### Websockets

Group will always follow pattern: {org:item?}
