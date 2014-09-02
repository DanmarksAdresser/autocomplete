$.widget( "dawa.dawaautocomplete", {
  options: {
    jsonp: false,
    baseUrl: 'http://dawa.aws.dk',
    minLength: 2,
    delay: 0,
    adgangsadresserOnly: false,
    autoFocus: true
  },


  _create: function() {
    var element = this.element;
    var options = this.options;
    var autocompleteWidget = this;

    // perform a GET request to DAWA, caching the response
    function get(path, params, cache, cb) {
      var stringifiedParams = JSON.stringify(params);
      if(cache && cache[stringifiedParams]) {
        return cb(cache[stringifiedParams]);
      }
      $.ajax({
        url: options.baseUrl + path,
        dataType: options.jsonp ? "jsonp" : "json",
        data: params,
        success: function(data) {
          if(cache) {
            cache[ stringifiedParams] = data;
          }
          cb(data);
        }
      });
    }

    // perform an autocomplete GET request to DAWA.
    // If there is at most one result, continue to next type.
    // We autocomplete through vejnavne, adgangsadresser and adresser.
    function invokeSource(typeIdx, q, cb) {
      var maxTypeIdx = options.adgangsadresserOnly ? 1 : 2;
      var params = { q: q };
      get(paths[typeIdx], params, caches[typeIdx], function(data) {
        if(data.length <= 1 && typeIdx < maxTypeIdx) {
          invokeSource(typeIdx + 1, q, cb);
        }
        else {
          prevResultType = typeIdx;
          prevSearch = q;
          cb(data);
        }
      });
    }

    var caches = [{}, {}, {}];
    var paths = ['/vejnavne/autocomplete', '/adgangsadresser/autocomplete', '/adresser/autocomplete'];

    var prevSearch = "", prevResultType = 0;

    var autocompleteOptions = $.extend({}, options, {
      source: function (request, response) {
        var q = request.term;

        // we start over searching in vejnavne, if the current query is not a prefix of
        // the previous one.
        var sourceTypeIdx = q.indexOf(prevSearch) !== 0 ? 0 : prevResultType;
        return invokeSource(sourceTypeIdx, q, response);
      },
      select: function (event, ui) {
        event.preventDefault();
        var item = ui.item;
        if (item.vejnavn) {
          element.val(ui.item.tekst + ' ');
          setTimeout(function () {
            element.autocomplete('search');
          });
        }
        else if (item.adgangsadresse) {
          if (options.adgangsadresserOnly) {
            autocompleteWidgets._trigger('select', null, item);
            return;
          }
          var addr = item.adgangsadresse;
          get(
            '/adresser/autocomplete',
            { adgangsadresseid: item.adgangsadresse.id }, null,
            function (data) {
              if (data.length > 1) {
                var textBefore = addr.vejnavn + ' ' + addr.husnr + ', ';
                var textAfter = ' ';
                if (addr.supplerendebynavn) {
                  textAfter += ', ' + addr.supplerendebynavn;
                }
                if (addr.postnr) {
                  textAfter += ', ' + addr.postnr;
                }
                if (addr.postnrnavn) {
                  textAfter += ' ' + addr.postnrnavn;
                }
                element.val(textBefore + textAfter);
                element[0].selectionStart = element[0].selectionEnd = textBefore.length;
                setTimeout(function () {
                  element.autocomplete('search');
                });
              }
              else if (data.length === 1) {
                autocompleteWidget._trigger('select', null, data[0]);
                element.val(data[0].tekst);
              }
            });
        }
        else {
          autocompleteWidget._trigger('select', null, ui.item);
          element.val(ui.item.tekst);
        }
      }
    });
    element.autocomplete(autocompleteOptions).data( "ui-autocomplete" )._renderItem = function(ul, item) {
      return $( "<li></li>" )
        .append( item.tekst )
        .appendTo( ul );
    };
    element.on("autocompletefocus", function( event, ui ) {
      event.preventDefault();
    });
  }
});