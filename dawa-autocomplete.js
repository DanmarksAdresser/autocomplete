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

		function getAutocompleteResponse(type, q, currentCaretPos, cb) {
			var params = {q: q, type: type, caretpos: currentCaretPos};
			if(adgangsadresseid) {
				params.adgangsadresseid = adgangsadresseid;
			}
			var adgangsadresseRestricted = !!adgangsadresseid;

			// Vi begrænser kun til en bestemt adgangsadresseid én gang
			adgangsadresseid = null;

			get(params, function(result) {
				if(adgangsadresseRestricted && result.length === 1) {
					// der er kun en adresse på adgangsadressen
					element.val(result[0].tekst);
					element.selectionStart = caretpos = result[0].caretpos;
					element.autocomplete('close');
					autocompleteWidget._trigger('select', null, result[0]);
				}
				else {
					cb(result);
				}
			});
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
				element[0].selectionStart = element[0].selectionEnd = caretpos = item.caretpos;
				if(item.type !== targetType) {
					if(item.type === 'adgangsadresse') {
						adgangsadresseid = item.data.id;
					}
					setTimeout(function () {
						element.autocomplete('search');
					});
				}
				else {
					element.autocomplete('close');
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
		// der er tilsyneladende ingen skudsikker måde at få en event når
		// cursor positionen ændrer sig, så vi benytter en timer i stedet.
		setInterval(function() {
			var currentCaretpos = element[0].selectionStart;
			if(element[0] === document.activeElement && caretpos !== currentCaretpos) {
				caretpos = currentCaretpos;
				element.autocomplete('search');
			}
		}, 100);
	}
});
