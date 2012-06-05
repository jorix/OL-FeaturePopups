// Create control
// --------------
var fpControl = new OpenLayers.Control.FeaturePopups({
    boxSelectionOptions: {},
    layers: [
        [
        sprintersLayer, {templates: {
            hover: "${.Name}",
            single: "${i18n(\"Name\")}: ${.Name}<br>" +
                 "${i18n(\"Country\")}: ${.Country}<br>" +
                 "${i18n(\"City\")}: ${.City}<br>",
            item: "<li><a href=\"#\" ${showPopup()}>${.Name}</a></li>"
        }}], [
        tasmaniaRoadsLayer, {templates: {
            // Only popup from hover or list, .
            hover: function(feature){
                return "Length: " + Math.round(feature.geometry.getLength()/10)/100 + " km";
            },
            item:  function(feature){
                return "<li>" + Math.round(feature.geometry.getLength()/10)/100 + " km</li>";
            }
        }}], [
        sundialsLayer, {templates: { 
            hover: "${.name}",
            hoverList: "<b>${count}</b><br>${html}",
            hoverItem: "${.name}<br>",
            single: "<div style=\"margin-right:22px\"><h2>${.name}</h2>${.description}</div>",
            // `margin-right:22px` To ensure that there is room for the vertical scroll bar
            item: "<li><a href=\"#\" ${showPopup()}>${.name}</a></li>"
        }}]
    ]
});
map.addControl(fpControl);

// Add a layer to the control explicitly
// -------------------------------------
fpControl.addLayer(poisLayer, {templates: {
    hover: "${.title}",
    single: "<h2>${.title}</h2>${.description}",
    item: "<li><a href=\"#\" ${showPopup()}>${.title}</a></li>"
}});

