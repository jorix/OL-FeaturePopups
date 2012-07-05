
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
/* OK: removed */ 
    // var html = 
        // '<h2 style="margin: 0 15px 15px; background-color:#f9f;">Foo</h2>' +
        // '<ul style="background-color:#fbf; margin-bottom:0">' +
            // '<li>foo</li>' +
        // '</ul>';

/* ko */ 
    var html = 
        '<h2 style="margin: 15px; background-color:#f9f;">Foo</h2>' +
        '<ul style="background-color:#fbf;">' +
            '<li>foo</li>' +
        '</ul>';

/* OK: added to the size */
    //var forceMargin = '<div style="margin:0; width:1px; height:1px; clear:both"></div>';
    //html = forceMargin + html + forceMargin;
    
var x = -370;
var y = -94;
showPopup("iFC_cBox", html, OpenLayers.Popup.FramedCloud, [x, y], true);
