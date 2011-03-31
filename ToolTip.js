/*
---
description: This is yet another ToolTip class for MooTools 1.3. See README.md for details
license: MIT-style
authors:
 - Korney Czukowski
requires:
 - core/1.3: [Class, Options, Events, Element, Element.Event]
 - more/1.3: [Element.Position, Element.Shortcuts, Locale]
provides: [ToolTip, Request.ToolTip]
...
*/
var ToolTip = new Class({
	Implements: [Events, Options],
	Binds: ['hide'],
	timer: null,
	options: {
		autohide: true,
		offset: 12,
		hideDelay: 1000,
		position: {
			edge: 'bottom',
			position: 'centerTop',
			offset: {x: 0, y: 0}
		},
		text: null
	},
	initialize: function(element, options) {
		this.element = element;
		this.setOptions(options);
		// Create ToolTip
		var edges = {
			'bottom': {'q': -1, 'dim': 'y'},
			'top': {'q': 1, 'dim': 'y'},
			'left': {'q': 1, 'dim': 'x'},
			'right': {'q': -1, 'dim': 'x'}
		};
		this.options.position.offset[edges[this.options.position.edge].dim] = this.options.offset * edges[this.options.position.edge].q;
		this.toolTip = new Element('div.tooltip', {'html': this.options.text})
			.hide()
			.inject(document.body);
		// Create arrow
		this.arrow = ToolTip.arrow(ToolTip.arrowPosition(this.options.position), this.toolTip);
		// Attach event listeners
		[this.element, this.toolTip].each(function(el) {
			el.addEvents({
				'mouseenter': function() {
					if (this.options.autohide) window.clearTimeout(this.timer);
				}.bind(this),
				'mouseleave': function() {
					if (this.options.autohide) this.timer = this.hide.delay(this.options.hideDelay, this);
				}.bind(this)
			});
		}, this);
	},
	hide: function() {
		this.arrow.hide();
		this.toolTip.hide();
		if (typeof(btn = this.toolTip.getElement('div.close')) == 'element') {
			btn.destroy();
		}
		this.fireEvent('hide');
		this.element.erase('data-tooltip-displayed');
		return this;
	},
	position: function() {
		this.toolTip.position({
			relativeTo: this.element,
			position: this.options.position.position,
			edge: this.options.position.edge,
			offset: this.options.position.offset
		});
		return this;
	},
	set: function(content) {
		if (typeOf(content) == 'element') {
			this.toolTip.empty().grab(content);
		}
		else {
			this.toolTip.set('html', content);
		}
		if ( ! this.options.autohide) {
			new Element('div.close[title="'+(Locale.get('ToolTip.close') || 'Close')+'"]')
				.inject(this.toolTip, 'top')
				.addEvent('click', this.hide.bind(this));
		}
		this.position();
	},
	show: function() {
		if ( ! this.element.get('data-tooltip-displayed')) {
			this.element.set('data-tooltip-displayed', true);
			this.position();
			this.toolTip.show();
			this.arrow.show();
			this.fireEvent('show');
		}
		return this;
	}
}).extend({
	/**
	 * Tooltip arrow factory
	 */
	arrow: function(options, tooltipElement) {
		options = Object.merge({
			distance: 12,
			edge: 'bottom',
			offset: {x: 0, y: 0},
			parent: document.body,
			position: 'centerTop'
		}, options);
		if (typeOf(tooltipElement) == 'element') {
			options.relativeTo = tooltipElement;
		}
		var edges = {
			'bottom': {'className': 'css-arrow-up', 'borderWidth': '0 {y}px {y}px'},
			'top': {'className': 'css-arrow-down', 'borderWidth': '{y}px {y}px 0'},
			'left': {'className': 'css-arrow-right', 'borderWidth': '{x2}px 0 {x2}px {x}px'},
			'right': {'className': 'css-arrow-left', 'borderWidth': '{x2}px {x}px {x2}px 0'}
		};
		var borderWidth = edges[options.edge].borderWidth.substitute({
			'x': (options.distance * .8).round(),
			'y': (options.distance * .8).round(),
			'x2': (options.distance * .8).round()
		});
		var element = new Element('div.tooltip-arrow.'+edges[options.edge].className)
			.setStyle('border-width', borderWidth)
			.hide()
			.inject(options.parent)
			.store('ArrowPosition', options);
		element.show = function() {
			this.setStyle('display', 'block')
				.position(this.retrieve('ArrowPosition'));
		};
		return element;
	},
	/**
	 * Returns tooptip arrow position options
	 */
	arrowPosition: function(options) {
		var edges = {
			'bottom': {'dim': 'y', 'edge': 'top'},
			'top': {'dim': 'y', 'edge': 'bottom'},
			'left': {'dim': 'x', 'edge': 'right'},
			'right': {'dim': 'x', 'edge': 'left'}
		};
		return Object.merge(Object.clone(options), {
			distance: options.offset[edges[options.edge].dim].abs(),
			edge: edges[options.edge].edge,
			offset: {x: 0, y: 0},
			position: options.position.replace(new RegExp(edges[options.edge].edge, 'i'), options.edge)
		});
	},
	/**
	 * Tooltip instance getter
	 * @param  Element           tooltip owner
	 * @param  string | Element  tooltip content
	 * @param  object            options; 2nd and 3rd parameters order may be reversed
	 */
	instance: function() {
		var element = arguments[0],
		    param = ['string', 'element'].contains(typeOf(arguments[1])),
			content = param ? arguments[1] : (arguments[2] || null),
			options = param ? (arguments[2] || {}) : arguments[1];
		if (typeOf(current = document.retrieve('ToolTip.current')) == 'object') {
			current.hide();
		}
		if ((toolTip = element.retrieve('ToolTip.instance')) == null) {
			toolTip = new ToolTip(element, options);
		}
		else {
			toolTip.setOptions(options);
		}
		element.store('ToolTip.instance', toolTip);
		document.store('ToolTip.current', toolTip);
		if (content) {
			toolTip.set(content);
		}
		return toolTip;
	}
});
/**
 * Experimental; shows tooltip while executing XHR
 */
Request.ToolTip = new Class({
	Extends: Request,
	options: {
		anchor: null,
		link: 'cancel',
		localePrefix: 'Lustr.xhr.default',
		method: 'post'
	},
	initialize: function(options) {
		this.parent(options);
		if (typeOf(this.options.anchor) != 'element') {
			throw 'Anchor option must be element';
		}
		this.addEvents({
			'failure': function(xhr) {
				var content = new Element('div').adopt(
					new Element('span[html="'+Locale.get(this.options.localePrefix+'.failed')+'. "]'),
					new Element('a[href="javascript:;"][html="'+Locale.get('Lustr.xhr.retry')+'"]')
						.addEvent('click', this.send.bind(this)),
					new Element('br'),
					new Element('span[html="'+Locale.get('Lustr.xhr.status').substitute(xhr)+'"]')
				);
				ToolTip.instance(this.options.anchor, {autohide: false}, content).show();
			},
			'request': function() {
				var content = new Element('div.progress[html="'+Locale.get(this.options.localePrefix+'.updating')+'&hellip;"]');
				ToolTip.instance(this.options.anchor, {autohide: false}, content).show();
			},
			'success': function(text) {
				if (/application\/json/.test(this.getHeader('Content-type'))) {
					var json = this.response.json = Function.attempt(function(){
						return JSON.decode(text);
					});
					text = json.message;
				}
				ToolTip.instance(this.options.anchor, {autohide: true}, text || Locale.get(this.options.localePrefix+'.success')).show();
				this.fireEvent('mouseleave');
			}
		});
	}
});