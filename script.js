var typeaheadBase = "https://demo.geo-solutions.it/geoserver/topp/ows?";
var queryLayer = "topp:states";
var nameField = "STATE_NAME";
var geometries = {};
var mapGeometries = {};

var typeaheadParams = {
  service: "WFS",
  version: "1.0.0",
  request: "GetFeature",
  outputFormat: "application/json",
  typeName: queryLayer
}

var map = L.map('map').setView([33.6132609,-97.6884029], 5);

var Stamen_TonerLite = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(map);

var resultsLayer = L.geoJSON(null).addTo(map);

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
      geometries = {};
      return $.map(response.features, function(feature) {
        geometries[feature.properties[nameField]] = feature.geometry;
        return (feature.properties[nameField]);
      });
    }
  },
});

bloodhoundEngine.initialize();
$('#txtStates').tokenfield({
  typeahead: [null, { source: bloodhoundEngine.ttAdapter() }]
}).on('tokenfield:createtoken', function (e) {
  var geometry = geometries[e.attrs.value];
  mapGeometries[e.attrs.value] = geometry;
  displayGeometries();
  geometries = {};
}).on('tokenfield:removedtoken', function (e) {
  delete mapGeometries[e.attrs.value];
  displayGeometries()

});

function displayGeometries(){
  resultsLayer.clearLayers();
  for (var key in mapGeometries) {
    if (mapGeometries.hasOwnProperty(key)) {
        var mapGeometry = mapGeometries[key];
        if (mapGeometry){
          resultsLayer.addData(mapGeometry);
        }
    }
  }
}
