$.widget("dawa.dawaautocomplete", {
	options: {
		jsonp: !("withCredentials" in (new XMLHttpRequest())),
		baseUrl: 'https://dawa.aws.dk',
		minLength: 2,
		delay: 0,
		adgangsadresserOnly: false,
		autoFocus: true,
		timeout: 10000,
		error: null,
		params: {}
	},


	_create: function () {
		var element = this.element;
		var options = this.options;
		var targetType =  options.adgangsadresserOnly ? 'adgangsadresse' : 'adresse';
		var autocompleteWidget = this;
		var caretpos = null;
		var adgangsadresseid = null;

		var cache = {};

		// perform a GET request to DAWA autocomplete, caching the response
		function get(params, cb) {
			var stringifiedParams = JSON.stringify(params);
			if (cache[stringifiedParams]) {
				return cb(cache[stringifiedParams]);
			}
			$.ajax({
				url: options.baseUrl + '/autocomplete',
				dataType: options.jsonp ? "jsonp" : "json",
				data: $.extend({}, params, options.params),
				timeout: options.timeout,
				success: function (data) {
					cache[stringifiedParams] = data;
					cb(data);
				},
				error: options.error
			});
		}

		function getAutocompleteResponse(type, q, caretpos, cb) {
			var params = {q: q, type: type, caretpos: caretpos};
			if(adgangsadresseid) {
				params.adgangsadresseid = adgangsadresseid;
			}

			// we only constrain adgangsadresseid once
			adgangsadresseid = null;

			get(params, cb);
		}

		var autocompleteOptions = $.extend({}, options, {
			source: function (request, response) {
				var q = request.term;
				caretpos = element[0].selectionStart;

				return getAutocompleteResponse(targetType, q, caretpos, response);
			},
			select: function (event, ui) {
				event.preventDefault();
				var item = ui.item;
				element.val(item.tekst);
				element[0].selectionStart = element[0].selectionEnd = item.caretpos;
				if(item.type !== targetType) {
					if(item.type === 'adgangsadresse') {
						adgangsadresseid = item.data.id;
					}
					setTimeout(function () {
						element.autocomplete('search');
					});
				}
				else {
					autocompleteWidget._trigger('select', null, item);
				}
			}
		});
		element.autocomplete(autocompleteOptions).data("ui-autocomplete")._renderItem = function (ul, item) {
			return $("<li></li>")
				.append(item.forslagstekst)
				.appendTo(ul);
		};
		element.on("autocompletefocus", function (event) {
			event.preventDefault();
		});
		setInterval(function() {
			var currentCaretpos = element[0].selectionStart;
			console.log('checkin caret position: ' + currentCaretpos + " " + caretpos);
			if(caretpos !== currentCaretpos) {
				element.autocomplete('search');
			}
		}, 100);
	}
});
