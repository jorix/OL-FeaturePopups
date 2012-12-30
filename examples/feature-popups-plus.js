// Create control and add some layers
// ----------------------------------
// ** advanced use **

var framedCloudScrollable = OpenLayers.Class(OpenLayers.Popup.FramedCloud, {
    displayClass: "olScrollable olPopup",
    registerEvents:function() {
        this.events = new OpenLayers.Events(this);
    }
});
var singleEventListeners = {
    "beforepopupdisplayed": function(e) {
        var sel = e.selection;
        // Use alert instead of a popup for poisLayer
        if (sel.layer === sundialsLayer) {
            alert(sel.feature.id);
            return false;
        }
    }
};

var fpControl = new OpenLayers.Control.FeaturePopups({
    boxSelectionOptions: {},
    // ** Options for the SelectFeature control to select **
    selectOptions: {clickout: true},
    // ** Close the window when displaying the detail of an item **
    popupListItemOptions: {relatedToClear: ['list', 'single']},
    // ** Don't use close box on popups
    mode: OpenLayers.Control.FeaturePopups.DEFAULT & 
          ~OpenLayers.Control.FeaturePopups.CLOSE_BOX,
    // ** Allow pan or zoom the map and to zoom with the scroll wheel when the
    //    mouse is in popup active area (see `framedCloudScrollable`)
    // ** Alert instead of popup on `poisLayer` (see `singleEventListeners`)
    popupSingleOptions: {
        popupClass: framedCloudScrollable,
        eventListeners: singleEventListeners
    },
    popupListItemOptions: {
        popupClass: framedCloudScrollable,
        eventListeners: singleEventListeners
    },
    // ** Overwrites html of the list popups adding a vacuum <li> before each item **
    popupListOptions: {popupClass: framedCloudScrollable, eventListeners: {
        "beforepopupdisplayed": function(e){
            var html = [],
                feature0 = null,
                layerObj0 = null,
                count = 0;
            for (var i = 0, iLen = e.selection.length; i < iLen; i++) {
                var sel = e.selection[i],
                    htmlAux = [],
                    layerObj = sel.layerObj;
                for (var ii = 0, iiLen = sel.features.length; ii < iiLen; ii++) {
                    if (ii > 0 || iiLen === 1) { // remove the first feature to simulate a filter.
                        feature0 = sel.features[ii];
                        layerObj0 = layerObj;
                        count++;
                        htmlAux.push(
                            layerObj.applyTemplate.item(feature0)
                        );
                    }
                }
                html.push(layerObj.applyTemplate.list({
                        layer: sel.layer,
                        count: sel.features.length,
                        html: htmlAux.join('\n')
                    })
                );
            }
            if (count === 1) {
                layerObj0.control.popupObjs.single.showPopup({
                        layerObj: layerObj0,
                        layer: layerObj.layer,
                        feature: feature0
                    }, 
                    feature0.geometry.getBounds().getCenterLonLat(),
                    layerObj0.getSingleHtml(feature0).html, 
                    true
                );
                layerObj0 = null;
                feature0 = null;
                return false;
            }
            e.html = html.join('\n');
        }
    }},    
    // ** Overwrites html of the hover list popups adding a vacuum <hr> before each item **
    popupHoverListOptions: {eventListeners: {
        "beforepopupdisplayed": function(e){
            var htmlAux = [];
            var sel = e.selection,
                layerObj = sel.layerObj;
            for (var ii = 0, iiLen = sel.features.length; ii < iiLen; ii++) {
                if (true) {
                    htmlAux.push(
                        "<hr>" + 
                        layerObj.applyTemplate.hoverItem(sel.features[ii])
                    );
                }
            }
            e.html = layerObj.applyTemplate.hoverList({
                layer: sel.layer,
                count: sel.features.length,
                html: htmlAux.join('\n')
            });
        }
    }},
    layers: [
        [
        // Uses: Templates for hover & select and safe selection
        sundialsLayer, {templates: {
            // hover: single & list
            hover: '${.name}',
            hoverList: '<b>${count}</b><br>${html}',
            hoverItem: '${.name}<br>',
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

