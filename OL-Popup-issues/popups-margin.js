
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

var html = 
    '<h2 style="margin: 15px; background-color:#f9f;">Foo</h2>' +
    '<ul style="margin: 5px; background-color:#fcf;">' +
        '<li>foo_foo</li>' +
    '</ul>';
showPopup("iP_marginCB", html, OpenLayers.Popup, [-200, 0], true);
showPopup("iFC_marginCB", html, OpenLayers.Popup.FramedCloud, [180, 0], true);
showPopup("iP_margin", html, OpenLayers.Popup, [-200, 200]);
showPopup("iFC_margin", html, OpenLayers.Popup.FramedCloud, [180, 200]);
