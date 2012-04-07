// Projections
// -----------
var sphericalMercatorProj = new OpenLayers.Projection("EPSG:900913");
var geographicProj = new OpenLayers.Projection("EPSG:4326");

// Vector layers
// -------------

var sprintersLayer = new OpenLayers.Layer.Vector("Sprinters (translated labels)", {
    hoverPopupTemplate: "${.Name}",
    selectPopupTemplate: "${i18n(\"Name\")}: ${.Name}<br>" +
                         "${i18n(\"Country\")}: ${.Country}<br>" +
                         "${i18n(\"City\")}: ${.City}<br>",
    itemPopupTemplate: "<li><a href=\"#\" onclick =\"explicitlyShowPopup('${layer.id}','${id}','id');return false\">${.Name}</a></li>",
    styleMap: new OpenLayers.StyleMap({
        externalGraphic: "http://www.openlayers.org/dev/examples/img/mobile-loc.png",
        graphicOpacity: 1.0,
        graphicWith: 16,
        graphicHeight: 26,
        graphicYOffset: -26
    })
});
sprintersLayer.addFeatures(getSprintersFeatures());

var tasmaniaRoadsLayer = new OpenLayers.Layer.Vector("Tasmania roads (function templates)", {
    // Only popup from hover or a list from selection box.
    hoverPopupTemplate: function(feature){
        return "Length: " + Math.round(feature.geometry.getLength()/10)/100 + " km";
    },
    itemPopupTemplate:  function(feature){
        return "<li>" + Math.round(feature.geometry.getLength()/10)/100 + " km</li>";
    },
    projection: geographicProj,
    strategies: [new OpenLayers.Strategy.Fixed()],
    protocol: new OpenLayers.Protocol.HTTP({
        url: "tasmania/TasmaniaRoads.xml",
        format: new OpenLayers.Format.GML.v2()
    })
});

var sundialsLayer = new OpenLayers.Layer.Vector("Sundials (clustered)", { 
    hoverPopupTemplate: "${.name}",
    selectPopupTemplate: "<div style=\"margin-right:22px\"><h2>${.name}</h2>${.description}</div>",
        // `margin-right:22px` To ensure that there is room for the vertical scroll bar
    itemPopupTemplate: "<li><a href=\"#\" ${showPopup()}>${.name}</a></li>",
    projection: geographicProj,
    strategies: [
        new OpenLayers.Strategy.Fixed(),
        new OpenLayers.Strategy.Cluster()
    ],
    styleMap: new OpenLayers.StyleMap({
        "default": new OpenLayers.Style({
                pointRadius: "${radius}",
                fillOpacity: 0.6,
                fillColor: "#ffcc66",
                strokeColor: "#cc6633"
            }, {
                context: {
                    radius: function(feature) {
                        return Math.min(feature.attributes.count, 10)*1.5 + 2;
                    }
                }
        }),
        "select": {fillColor: "#8aeeef"}
    }),
    protocol: new OpenLayers.Protocol.HTTP({
        url: "kml/sundials.kml",
        format: new OpenLayers.Format.KML({
            extractStyles: true,
            extractAttributes: true
        })
    })
});

var poisLayer = new OpenLayers.Layer.Vector("POIs (using BBOX)", {
    projection: geographicProj,
    strategies: [new OpenLayers.Strategy.BBOX({resFactor: 1.1})],
    protocol: new OpenLayers.Protocol.HTTP({
        url: "textfile.txt",
        format: new OpenLayers.Format.Text()
    })
});

// Create control
// --------------
var featurePopupsCtl = new OpenLayers.Control.FeaturePopups({
    boxSelectionOptions: {},
    popupListClass: "divList"
});

// Add a layer to the control explicitly
// -------------------------------------
featurePopupsCtl.addLayer(poisLayer, {
    hoverTemplate: "${.title}",
    selectTemplate: "<h2>${.title}</h2>${.description}",
    itemTemplate: "<li><a href=\"#\" ${showPopup()}>${.title}</a></li>"
});

// Create function to show single feature from a list
// --------------------------------------------------
var explicitlyShowPopup = OpenLayers.Function.bind(
                     featurePopupsCtl.showSingleFeatureById, featurePopupsCtl);

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
        new OpenLayers.Control.LayerSwitcher(),
        featurePopupsCtl
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
