var typeaheadBase = "https://demo.geo-solutions.it/geoserver/topp/ows?";
var queryLayer = "topp:states";
var nameField = "STATE_NAME";

// For Tokenfield, maintain 2 lists of geometries in memory
var geometries = {}; // returned geometries from the TypeAhead response
var mapGeometries = {}; // geometries that are currently shown on the map

var typeaheadParams = {
  service: "WFS",
  version: "1.0.0",
  request: "GetFeature",
  outputFormat: "application/json",
  typeName: queryLayer
}

// Create a simple map centred on the USA
var map = L.map('map').setView([33.6132609,-97.6884029], 5);

// Add the stamen grayscale basemap
var Stamen_TonerLite = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(map);

// Create an empty layer to hold the state boundaries
var statesLayer = L.geoJSON(null).addTo(map);

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

// Configure the states field for TokenField (http://sliptree.github.io/bootstrap-tokenfield)
$('#txtStates').tokenfield({
  typeahead: [null, { source: bloodhoundEngine.ttAdapter() }]
}).on('tokenfield:createtoken', function (e) {
  // When a token is created, obtain its geometry from the temporary geometries object
  var geometry = geometries[e.attrs.value];
  mapGeometries[e.attrs.value] = geometry;

  // Update the map to show the latest set of geometries
  displayGeometries();
}).on('tokenfield:removedtoken', function (e) {
  // When a token is removed, also remove its geometry from the map
  delete mapGeometries[e.attrs.value];
  displayGeometries()

});

function displayGeometries(){
  // Update the map to show the current set of tokens
  statesLayer.clearLayers();
  for (var key in mapGeometries) {
    if (mapGeometries.hasOwnProperty(key)) {
      var mapGeometry = mapGeometries[key];
      if (mapGeometry){
        statesLayer.addData(mapGeometry);
      }
    }
  }
}
