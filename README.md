# GeoServer_TypeAhead

This is a demonstration site showing how to use GeoServer as the source of a type-ahead, based on [Twitter TypeAhead](https://twitter.github.io/typeahead.js/).

The modifications to the Twitter demos are found in the `prepare` and `transform` functions:

```
// Initialize the Bloodhound engine
var bloodhoundEngine = new Bloodhound({
  datumTokenizer: function(datum) {
      return Bloodhound.tokenizers.whitespace(datum.value);
    },
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  limit: 15,
  remote: {
    url: typeaheadBase + '%QUERY',
    wildcard: '%QUERY',
    prepare: function(query, settings) {
      // Build the query string in a GeoServer-ready format
      settings.url = typeaheadBase + jQuery.param(typeaheadParams);
      settings.url += "&CQL_FILTER=strToUpperCase(" + nameField + ")%20like%20%27QUERY%25%27";
      settings.url = settings.url.replace('QUERY', query.toUpperCase());
      return settings;
    },
    transform: function(response) {
      // temporarily persist the geometries of the returned states
      geometries = {};
      return $.map(response.features, function(feature) {
        geometries[feature.properties[nameField]] = feature.geometry;

        // Return the state name to the TypeAhead suggestion dropdown
        return (feature.properties[nameField]);
      });
    }
  },
});
bloodhoundEngine.initialize();
```

See the demo at https://slead.github.io/GeoServer_TypeAhead/ which also shows how [Leaflet.js](https://leafletjs.com/) and [Tokenfield](http://sliptree.github.io/bootstrap-tokenfield) can be integrated.

![screenshot](https://i.imgur.com/l3EbdaD.png)
