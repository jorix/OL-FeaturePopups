;// Projections
// -----------
var sphericalMercatorProj = new OpenLayers.Projection('EPSG:900913');
var geographicProj = new OpenLayers.Projection('EPSG:4326');

// Vector layers
// -------------
// Sprinters: layer with different attributes.
var sprintersLayer = new OpenLayers.Layer.Vector('Sprinters (translated labels)', {
    styleMap: new OpenLayers.StyleMap({
        externalGraphic: 'http://www.openlayers.org/dev/examples/img/mobile-loc.png',
        graphicOpacity: 1.0,
        graphicWith: 16,
        graphicHeight: 26,
        graphicYOffset: -26
    })
});
sprintersLayer.addFeatures(getSprintersFeatures());

// Tasmania roads: layer of lines to show its length.
var tasmaniaRoadsLayer = new OpenLayers.Layer.Vector('Tasmania roads (function templates)', {
    projection: geographicProj,
    strategies: [new OpenLayers.Strategy.Fixed()],
    protocol: new OpenLayers.Protocol.HTTP({
        url: 'tasmania/TasmaniaRoads.xml',
        format: new OpenLayers.Format.GML.v2()
    })
});

// Sundials: layer uses Cluster strategy.
var sundialsLayer = new OpenLayers.Layer.Vector('Sundials (clustered)', {
    projection: geographicProj,
    strategies: [
        new OpenLayers.Strategy.Fixed(),
        new OpenLayers.Strategy.Cluster()
    ],
    styleMap: new OpenLayers.StyleMap({
        'default': new OpenLayers.Style({
                pointRadius: '${radius}',
                fillOpacity: 0.6,
                fillColor: '#ffcc66',
                strokeColor: '#cc6633'
            }, {
                context: {
                    radius: function(feature) {
                        return Math.min(feature.attributes.count, 10) * 1.5 + 2;
                    }
                }
        }),
        'select': {fillColor: '#8aeeef'}
    }),
    protocol: new OpenLayers.Protocol.HTTP({
        url: 'kml/sundials.kml',
        format: new OpenLayers.Format.KML({
            extractStyles: true,
            extractAttributes: true
        })
    })
});

// POIs: layer uses BBOX strategy and simulated "fid".
var TextAndFid = OpenLayers.Class(OpenLayers.Format.Text, {
    read: function(text) {
        var features = OpenLayers.Format.Text.prototype.read.call(this, text);
        for (var i = 0, len = features.length; i < len; i++) {
            var feature = features[i];
            feature.fid = feature.attributes.title.replace(/ /g, '_');
        }
        return features;
    }
});
var poisLayer = new OpenLayers.Layer.Vector('POIs (using BBOX)', {
    projection: geographicProj,
    strategies: [new OpenLayers.Strategy.BBOX({resFactor: 1.1})],
    protocol: new OpenLayers.Protocol.HTTP({
        url: 'textfile.txt',
        format: new TextAndFid()
    })
});

// Create map
// ----------
var map = new OpenLayers.Map({
    div: 'map',
    theme: null,
    projection: sphericalMercatorProj,
    displayProjection: geographicProj,
    units: 'm',
    numZoomLevels: 18,
    maxResolution: 156543.0339,
    maxExtent: new OpenLayers.Bounds(
        -20037508.34, -20037508.34, 20037508.34, 20037508.34
    ),
    controls: [
        new OpenLayers.Control.Attribution(),
        new OpenLayers.Control.Navigation(),
        new OpenLayers.Control.PanZoom(),
        new OpenLayers.Control.LayerSwitcher()
    ],
    layers: [
        new OpenLayers.Layer.OSM('OpenStreetMap', null),
        sprintersLayer,
        tasmaniaRoadsLayer,
        sundialsLayer,
        poisLayer
    ],
    center: new OpenLayers.LonLat(0, 0),
    zoom: 2
});

// Sprinters features
// ------------------
function getSprintersFeatures() {
    var features = {
        'type': 'FeatureCollection',
        'features': [
            { 'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [1332700, 7906300]},
                'properties': {'Name': 'Igor Tihonov', 'Country': 'Sweden', 'City': 'Gothenburg'}},
            { 'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [790300, 6573900]},
                'properties': {'Name': 'Marc Jansen', 'Country': 'Germany', 'City': 'Bonn'}},
            { 'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [568600, 6817300]},
                'properties': {'Name': 'Bart van den Eijnden', 'Country': 'Netherlands', 'City': 'Utrecht'}},
            { 'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-7909900, 5215100]},
                'properties': {'Name': 'Christopher Schmidt', 'Country': 'United States of America', 'City': 'Boston'}},
            { 'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-937400, 5093200]},
                'properties': {'Name': 'Jorge Gustavo Rocha', 'Country': 'Portugal', 'City': 'Braga'}},
            { 'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-355300, 7547800]},
                'properties': {'Name': 'Jennie Fletcher ', 'Country': 'Scotland', 'City': 'Edinburgh'}},
            { 'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [657068.53608487, 5712321.2472725]},
                'properties': {'Name': 'Bruno Binet ', 'Country': 'France', 'City': 'Chambéry'}},
            { 'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [667250.8958124, 5668048.6072737]},
                'properties': {'Name': 'Eric Lemoine', 'Country': 'France', 'City': 'Theys'}},
            { 'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [653518.03606319, 5721118.5122914]},
                'properties': {'Name': 'Antoine Abt', 'Country': 'France', 'City': 'La Motte Servolex'}},
            { 'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [657985.78042416, 5711862.6251028]},
                'properties': {'Name': 'Pierre Giraud', 'Country': 'France', 'City': 'Chambéry'}},
            { 'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [742941.93818208, 5861818.9477535]},
                'properties': {'Name': 'Stéphane Brunner', 'Country': 'Switzerland', 'City': 'Paudex'}},
            { 'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [736082.61064069, 5908165.4649505]},
                'properties': {'Name': 'Frédéric Junod', 'Country': 'Switzerland', 'City': 'Montagny-près-Yverdon'}},
            { 'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [771595.97057525, 5912284.7041793]},
                'properties': {'Name': 'Cédric Moullet', 'Country': 'Switzerland', 'City': 'Payerne'}},
            { 'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [744205.23922364, 5861277.319748]},
                'properties': {'Name': 'Benoit Quartier', 'Country': 'Switzerland', 'City': 'Lutry'}},
            { 'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [1717430.147101, 5954568.7127565]},
                'properties': {'Name': 'Andreas Hocevar', 'Country': 'Austria', 'City': 'Graz'}},
            { 'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-12362007.067301, 5729082.2365672]},
                'properties': {'Name': 'Tim Schaub', 'Country': 'United States of America', 'City': 'Bozeman'}}
        ]
    };
    var reader = new OpenLayers.Format.GeoJSON();
    return reader.read(features);
}
