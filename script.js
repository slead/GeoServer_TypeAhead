var typeaheadBase = "https://demo.geo-solutions.it/geoserver/topp/ows?";
var queryLayer = "topp:states";
var nameField = "STATE_NAME";

var typeaheadParams = {
    service: "WFS",
    version: "1.0.0",
    request: "GetFeature",
    outputFormat: "application/json",
    typeName: queryLayer
  }

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
      settings.url = typeaheadBase + jQuery.param(typeaheadParams);
      settings.url += "&CQL_FILTER=strToUpperCase(" + nameField + ")%20like%20%27QUERY%25%27";
      settings.url = settings.url.replace('QUERY', query.toUpperCase());
      return settings;
    },
    transform: function(response) {
      return $.map(response.features, function(feature) {
        return toTitleCase(feature.properties[nameField]);
      });
    }
  },
});

bloodhoundEngine.initialize();
$('#txtStates').tokenfield({
  typeahead: [null, { source: bloodhoundEngine.ttAdapter() }]
});

function toTitleCase(str){
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
