// Projections
// -----------
var sphericalMercatorProj = new OpenLayers.Projection("EPSG:900913");
var geographicProj = new OpenLayers.Projection("EPSG:4326");

// Vector layers
// -------------

var sprintersLayer = new OpenLayers.Layer.Vector("Sprinters (translated labels)", {
    hoverPopupTemplate: "{{Name}}",
    selectPopupTemplate: "{{OpenLayers.i18n(\"Name\")}}: {{Name}}<br>" +
                         "{{OpenLayers.i18n(\"Country\")}}: {{Country}}<br>" +
                         "{{OpenLayers.i18n(\"City\")}}: {{City}}<br>",
    itemPopupTemplate: "<li>{{Name}}</li>",
    styleMap: new OpenLayers.StyleMap({
        externalGraphic: "http://www.openlayers.org/dev/examples/img/mobile-loc.png",
        graphicOpacity: 1.0,
        graphicWith: 16,
        graphicHeight: 26,
        graphicYOffset: -26
    })
});
sprintersLayer.addFeatures(getSprintersFeatures());

var getLengthRoad = function(feature){
    return Math.round(feature.geometry.getLength()/10)/100 + " km";
}
var tasmaniaRoadsLayer = new OpenLayers.Layer.Vector("Tasmania roads (function templates)", {
    // Only hover popup
    hoverPopupTemplate: function(feature){return "Length: " + getLengthRoad(feature);},
    itemPopupTemplate:  function(feature){return "<li>" + getLengthRoad(feature) + "</li>";},
    projection: geographicProj,
    strategies: [new OpenLayers.Strategy.Fixed()],
    protocol: new OpenLayers.Protocol.HTTP({
        url: "tasmania/TasmaniaRoads.xml",
        format: new OpenLayers.Format.GML.v2()
    })
});

var sundialsLayer = new OpenLayers.Layer.Vector("Sundials", { // TODO: use cluster
    // No hover popup
    selectPopupTemplate: "<h2>{{name}}</h2>{{description}}",
    itemPopupTemplate: "<li>{{name}}</li>",
    projection: geographicProj,
    strategies: [new OpenLayers.Strategy.Fixed()],
    protocol: new OpenLayers.Protocol.HTTP({
        url: "kml/sundials.kml",
        format: new OpenLayers.Format.KML({
            extractStyles: true,
            extractAttributes: true
        })
    })
});

var poisLayer = new OpenLayers.Layer.Vector("POIs (using BBOX)", {
    hoverPopupTemplate: "{{title}}",
    selectPopupTemplate: "<h2>{{title}}</h2>{{description}}",
    itemPopupTemplate: "<li>{{title}}</li>",
    projection: geographicProj,
    strategies: [new OpenLayers.Strategy.BBOX({resFactor: 1.1})],
    protocol: new OpenLayers.Protocol.HTTP({
        url: "textfile.txt",
        format: new OpenLayers.Format.Text()
    })
});

// Create map
// ----------
var map = new OpenLayers.Map({
    div: "map",
    theme: null,
    projection: sphericalMercatorProj,
    displayProjection: geographicProj,
    units: "m",
    numZoomLevels: 18,
    maxResolution: 156543.0339,
    maxExtent: new OpenLayers.Bounds(
        -20037508.34, -20037508.34, 20037508.34, 20037508.34
    ),
    controls: [
        new OpenLayers.Control.Attribution({position: new OpenLayers.Pixel(1,486)}),
        new OpenLayers.Control.Navigation(),
        new OpenLayers.Control.PanZoom(),
        new OpenLayers.Control.FeaturePopups({
            closeBox: true, 
            selectionBox: true,
            eventListeners: {
                beforefeaturehighlighted: logEvent,
                featurehighlighted: logEvent,
                featureunhighlighted: logEvent,
                featureselected: logEvent,
                featureunselected: logEvent,
                beforeselectionbox: logEvent,
                afterselectionbox: logEvent
            }
        }),
        new OpenLayers.Control.LayerSwitcher()
    ],
    layers: [
        new OpenLayers.Layer.OSM("OpenStreetMap", null),
        sprintersLayer,
        tasmaniaRoadsLayer,
        sundialsLayer,
        poisLayer
    ],
    center: new OpenLayers.LonLat(0, 0),
    zoom: 2
});

// Log events
// ----------
function logEvent(evt) {

    if (!console || !console.log) {
        return;
    }
    var feature = evt.feature
    var layer = feature.layer;
    console.log(evt.type + ": layer=" + layer.name + ((feature.fid)?" fid=" + feature.fid:" id=" + feature.id));
}
