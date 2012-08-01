var points = new OpenLayers.Layer.Vector("Points");
// Crate map
var map = new OpenLayers.Map("map",{
    layers: [new OpenLayers.Layer("foo", {isBaseLayer: true}), points]
});
map.zoomToMaxExtent();

// Function to show a popup and point of insertion.
var showPopup = function (relPos, xy) {
    var popup, 
        popupCls,
        lonLat = new OpenLayers.LonLat(xy[0], xy[1]);
    
    // the popup
    popupCls = OpenLayers.Class(OpenLayers.Popup.FramedCloud, {
        relativePosition: relPos,
        fixedRelativePosition: true,
        autoSize: false
    });
    popup = new popupCls(null, lonLat, new OpenLayers.Size(150,30), relPos);
    map.addPopup(popup);

    // insertion point as a anchored popup
    popupCls = OpenLayers.Class(OpenLayers.Popup.Anchored, {
        calculateRelativePosition: function(){
            return relPos;
        }
    });
    popup = new popupCls(null, lonLat, new OpenLayers.Size(6,6), "");
    popup.setOpacity(0.6);
    popup.setBackgroundColor("green");
    map.addPopup(popup);

    // insertion point as a point geometry
    points.addFeatures(
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(xy[0], xy[1]), 
            {}, {
                pointRadius: 6,
                graphicName: 'cross',
                fillColor: 'red',
                strokeOpacity: 0
        })
    );
};

// the popups of the four corners
var x = -10,
    y = 5;
showPopup("tl", [x,  y]);
showPopup("bl", [x, -y]);
x += 70;
showPopup("tr", [x,  y]);
showPopup("br", [x, -y]);
