ToolTip
=======

This is yet another ToolTip class for MooTools 1.3

It doesn't do any magic, but provides a few useful tools for integrating various widgets into tooltips. I'll give some examples
below, which would be the best way to understand how it works, followed by API docs. Note, that the examples are not complete
and may need some tweaking to use in your own application.

Using ToolTip on its own
------------------------

Display &lt;abbr&gt; titles as tooltips:

	document.getElements('abbr[title]').addEvent('click', function() {
		ToolTip.instance(this, this.get('title')).show();
	});

Using ToolTip with other widgets
--------------------------------

You may want to apply some matching CSS to these widgets to display them as tooltips.

Use with [Christopher Beloch](http://mootools.net/forge/profile/C_BHole)'s [mooRainbow](http://mootools.net/forge/p/moorainbow)
color picker and display it as tooltip:

	var colorPicker = new MooRainbow(element, options);
	colorPicker.arrow = ToolTip.arrow({
		'relativeTo': colorPicker.layout.getElement('div[class$="box"]'),
		'position': 'topLeft',
		'edge': 'right',
		'offset': {y: 16}
	});
	colorPicker.addEvents({
		'hide': function() {
			colorPicker.arrow.hide();
		},
		'show': function() {
			colorPicker.arrow.show();
		}
	});

Use with [Arian Stolwijk](http://mootools.net/forge/profile/astolwijk)'s [DatePicker](http://mootools.net/forge/p/mootools_datepicker)
plugin and display it as tooltip:

	var datePicker = new Picker.Date(element, options).attach([label, icon]);
	datePicker.select(date);
	datePicker.arrow = ToolTip.arrow({
		'relativeTo': datePicker.picker,
		'position': 'topLeft',
		'edge': 'right',
		'offset': {y: 16}
	});
	datePicker.addEvents({
		'show': function() {
			this.position(element, this.options.pickerPosition);
			this.arrow.show();
		},
		'hide': function() {
			this.arrow.hide();
		},
		'select': function(date) {
			input.set('value', date.format('db'));
			label.set('html', date.format(this.options.labelDateFormat));
		}
	});

API
---

### Constructor

Initializes ToolTip instance and creates tooltip arrow, depending on tooltip position options.

Accepted parameters:

 * _Element_ - ToolTip owner
 * _object_ (optional) - Constructor options:
   - `autohide`: _boolean_, hides tooltip after mouse pointer is away from tooltip and its owner element for over `hideDelay` ms; default: true,
   - `offset`: _number_, defines how far away is the tooltip from its owner element; default: 12,
   - `hideDelay`: _number_, delay until tooltip is hidden; default: 1000,
   - `position`: _object_, similar options as for [Element.position](http://mootools.net/docs/more/Element/Element.Position#Element:position):
     - `edge`: _string_, default: 'bottom',
     - `position`: _string_, default: 'centerTop',
     - `offset`: _object_:
         - `x`: _number_, default: 0,
         - `y`: _number_, default: 0
     - `text`: _string_, text to set as content at initialization time; default: null

### Events

#### Show

Fires, when tooltip was shown.

#### Hide

Fires, when tooltip was hidden.

### Class methods

#### set()

Sets tooltip content. Accepts _string_ or _Element_ as a parameter. Calls `position()` afterwards.

#### show()

Shows tooltip, if not already shown.

#### hide()

Hides tooltip.

#### position()

Repositions tooltip. This is a convenience method and there's no need to call it externally.

### Static methods

#### ToolTip.instance()

Creates ToolTip instance or retrieves it, if already created. This is a preferred way to call ToolTip.

Accepted parameters:

 * _Element_ - ToolTip owner element
 * _object_ (optional) - Constructor options, see above
 * _string_ or _Element_ (optional) - ToolTip content

Note: 2nd and 3rd parameters may be passed in reverse order, i.e. it doesn't matter whether you call
`ToolTip.instance(element, options, content)` or `ToolTip.instance(element, content, options)`.

#### ToolTip.arrow()

Creates CSS arrow and sets its position options.

Accepted parameters:

 * _object_ - Constructor options, contains similar position options as for ToolTip constructor, plus `distance` parameter
 * _Element_ (optional) - position relative to this element, alternatively may be set using options object

#### ToolTip.arrowPosition()

Returns default arrow position from position options of toolip element. It actually calculates `distance` parameter from position
offset, resets offsets and inverts `edge` and `position` parameters.
