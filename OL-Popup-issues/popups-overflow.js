var map = new OpenLayers.Map("map",{
    layers: [new OpenLayers.Layer("foo", {isBaseLayer: true})]
});
map.zoomToMaxExtent();

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

var html = "<div>" + (new Array(20)).join("1 2 3 4<br>") + "</div>";
var htmlFC = "<div>" + (new Array(20)).join("1 2 3 4 5 6<br>") + "</div>";
var x = -370;
var y = -94;
showPopup("iFC_cBox", htmlFC, OpenLayers.Popup.FramedCloud, [x, y], true);
x += 105;
showPopup("iFC_", htmlFC, OpenLayers.Popup.FramedCloud, [x, y], false);
x += 75;
showPopup("iA_cBox", htmlFC, OpenLayers.Popup.Anchored, [x, y], true);
x += 95;
showPopup("iA_", htmlFC, OpenLayers.Popup.Anchored, [x, y], false);
x += 95;
showPopup("iP_cBox", htmlFC, OpenLayers.Popup, [x, -y], true);
x += 92;
showPopup("iP_", htmlFC, OpenLayers.Popup, [x, -y], false);