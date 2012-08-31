// Create control and add some layers
// ----------------------------------
var fpControl = new OpenLayers.Control.FeaturePopups({
    // External div for list popups
    popupListOptions: {popupClass: 'divList'},
    boxSelectionOptions: {},
    layers: [
        [
        // Uses: Templates for hover & select and safe selection
        sundialsLayer, {templates: {
            // hover single
            hover: '${.name}',
            // select: single & list
            single: '<div><h2>${.name}</h2>${.description}</div>',
            item: '<li><a href=\"#\" ${showPopup()}>${.name}</a></li>'
        }}], [
        // Uses: Internationalized templates.
        sprintersLayer, {templates: {
            hover: '${.Name}',
            single: '${i18n(\"Name\")}: ${.Name}<br>' +
                 '${i18n(\"Country\")}: ${.Country}<br>' +
                 '${i18n(\"City\")}: ${.City}<br>',
            item: '<li><a href=\"#\" ${showPopup()}>${.Name}</a></li>'
        }}], [
        // Uses: Templates as functions (only from hover-single and select-list)
        tasmaniaRoadsLayer, {templates: {
            hover: function(feature) {
                return 'Length: ' + Math.round(feature.geometry.getLength() / 10) / 100 + ' km';
            },
            item: function(feature) {
                return '<li>' + Math.round(feature.geometry.getLength() / 10) / 100 + ' km</li>';
            }
        }}]
    ]
});
map.addControl(fpControl);

// Add a layer to the control using addLayer
// -----------------------------------------
fpControl.addLayer(
    // Uses: Safe selection by "fid"
    poisLayer, {templates: {
        hover: '${.title}',
        single: '<h2>${.title}</h2>${.description}',
        item: '<li><a href=\"#\" ${showPopup(fid)}>${.title}</a></li>'
    }}
);

