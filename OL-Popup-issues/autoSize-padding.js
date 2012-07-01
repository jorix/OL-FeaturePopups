var map = new OpenLayers.Map('map',{
    layers: [new OpenLayers.Layer("foo", {isBaseLayer: true})]
});
map.zoomToMaxExtent();

var showPopup = function (id, pClass, xy, disArg) {
    var html = "<div style='width:115px; height:40px; background-color:#faf;'>" +
                disArg.title + "</div>";
    // contentDisplayClass
    var popupCls = (disArg.displayClass)?
            OpenLayers.Class(pClass, {contentDisplayClass: disArg.displayClass}):
            pClass;
    // create
    var popup,
        lonLat = new OpenLayers.LonLat(xy[0], xy[1]);
    if (popupCls.prototype.CLASS_NAME ==="OpenLayers.Popup") {
        popup = new popupCls(id, lonLat, null,
                             html, disArg.closeBox, function(){});
    } else {
        popup = new popupCls(id, lonLat, null,
                             html, null, disArg.closeBox, function(){});
    }
    popup.autoSize = true;
    map.addPopup(popup);
};

var displayArgs = [
    {title:"padding5",                displayClass:"",      closeBox:false,   xIncr:  0}, 
    {title:"padding5 closeBox",       displayClass:"",      closeBox:true,    xIncr:120},
    {title:"only border2",            displayClass:"contentOnlyWithBorder",  closeBox:false, xIncr:135},
    {title:"only border2 closeBox",   displayClass:"contentOnlyWithBorder",  closeBox:true,  xIncr:210}
];
var x =        -260;
for (var i = 0, len = displayArgs.length; i < len; i++) {
    x += displayArgs[i].xIncr;
    var y =     100;
    showPopup("i_FC_"+i, OpenLayers.Popup.FramedCloud, [x, y], displayArgs[i]);
    y +=       -145;
    showPopup("i_A_"+i,  OpenLayers.Popup.Anchored,    [x, y], displayArgs[i]);
    y +=        -35;
    showPopup("i_P_"+i,  OpenLayers.Popup, [x+(i+1 == len?-100:0), y], displayArgs[i]);
}


