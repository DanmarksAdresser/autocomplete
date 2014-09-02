# DAWA Autocomplete
DAWA autocomplete er en JavaScript komponent, som giver mulighed for at indtaste en dansk adresse i ét input-felt
ved hjælp af autocomplete. [Komponenten anvender Danmarks Adressers Web API (DAWA)](http://dawa.aws.dk).

Komponenten er baseret på JQueryUI's [autocomplete widget](http://api.jqueryui.com/autocomplete/), men har ingen andre
afhængigheder end JQuery denne komponent.

Du kan se en demo af komponenten på [dawa.aws.dk](http://dawa.aws.dk).

## Installation
Komponenten kan installeres via bower:
```
bower install dawa-autocomplete
```

## Eksempler
Aktivering af DAWA autocomplete:
```javascript
  $('#autocomplete-adresse').dawaautocomplete({
      select: function(event, adresse) {
        // denne funktion bliver kaldt når brugeren vælger en adresse.
      }
  });
```

Angiv konfigurationsparametre:
```javascript
$('#myInput').dawaautocomplete({
  jsonp: false,
  baseUrl: 'http://dawa.aws.dk',
  minLength: 2,
  delay: 0,
  adgangsadresserOnly: false,
  select: function(event, adresse) {
    // denne funktion bliver kaldt når brugeren vælger en adresse.
  }
});
```
## Options
Det er muligt at angive følgende options:
 - <strong>jsonp</strong>: Anvend JSONP i stedet for JSON (default false)
 - <strong>baseUrl</strong>: URL til API (default http://dawa.aws.dk)
 - <strong>minLength</strong>: Antal karakterer, der skal være tastet for autocomplete vises (default 2)
 - <strong>adgangsadresserOnly</strong>: Angiver, at der indtastes en adgangsadresse og ikke en fuld adresse (default: false)

## Events
DAWA Autocomplete udsender følgende events:
 - <strong>select</strong>: Når brugeren har valgt en adresse