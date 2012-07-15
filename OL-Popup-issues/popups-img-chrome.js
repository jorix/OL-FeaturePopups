
var map = new OpenLayers.Map("map",{
    layers: [new OpenLayers.Layer("foo", {isBaseLayer: true})],
    center: new OpenLayers.LonLat(0, 0),
    zoom: 2
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
var html01 = 
    '<div style="background-color:#faf;">' +
    '<img style="width:50px" src="img/14012012329.jpg">' +
    '</div>';
var html02 = 
    '<div style="background-color:#faf;">' +
    '<img style="height:50px" src="img/14012012329.jpg">' +
    '</div>';
var html03 = 
    '<div style="background-color:#faf;">' +
    '<img style="height:50px; width:50px" src="img/14012012329.jpg">' +
    '</div>';

showPopup("popup0", html, OpenLayers.Popup, [-30, 50], false);
showPopup("popup1", html01, OpenLayers.Popup, [-30, -15], false);
showPopup("popup2", html02, OpenLayers.Popup, [0, -15], false);
showPopup("popup3", html03, OpenLayers.Popup, [30, -15], false);
