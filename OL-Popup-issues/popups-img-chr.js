
var map = new OpenLayers.Map("map",{
    layers: [new OpenLayers.Layer("foo", {isBaseLayer: true})],
    center: new OpenLayers.LonLat(0, 0),
    zoom: 3
});
//map.zoomToMaxExtent();

var showPopup = function (id, html, popupCls, xy, closeBox) {
    // create
    var popup,
        lonLat = new OpenLayers.LonLat(xy[0], xy[1]);
    if (popupCls.prototype.CLASS_NAME ==="OpenLayers.Popup") {
        popup = new popupCls(id, lonLat, null,
                             html, closeBox, function(){});
    } else {
        popup = new popupCls(id, lonLat, null,
                             html, null, closeBox, function(){});
    }
    popup.autoSize = true;
    map.addPopup(popup);
};
var html = 
    '<div style="background-color:#faf;">' +
    '<img src="img/14012012329.jpg">' +
    '</div>';

showPopup("iFC_cBox", html, OpenLayers.Popup.FramedCloud, [0, 0], false);
