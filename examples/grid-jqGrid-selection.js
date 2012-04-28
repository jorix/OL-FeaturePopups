// Define grid & control
        var grid, fpControl, lastSelectId;

// Functions to bind grid with fpControl
    // listeners on grig
    var rowSelected = function(id, status) {
        lastSelectId = id;
        fpControl.showSingleFeatureById(vLayer.id, id);
    };
    var refreshSelection = function() {            
        lastSelectId && grid.jqGrid("setSelection", lastSelectId, false);
    };        
    // listeners on control
    var setGridSelection = function(evt) {
        lastSelectId = null;
        fpControl.showSingleFeatureById();
        grid.jqGrid('clearGridData');
        if (evt.selection.length) {
            grid.jqGrid('addRowData', 'id', evt.selection);
            grid.trigger("reloadGrid");
            $("#grid-container").show();
        } else {
            $("#grid-container").hide();
        }
    };
    
// Create Control
    fpControl = new OpenLayers.Control.FeaturePopups({
        hoverOptions:{renderIntent: "temporary"},
        popupSelectOptions: null,
        popupListOptions: null
    });
    map.addControl(fpControl);
    fpControl.addLayer(vLayer, {
        selectTemplate: "${.title} ${.size}",
        eventListeners: {
            "selectionchanged": setGridSelection,
            "scope": fpControl
        }
    });
    
// Create Grid
    grid = $("#grid-data");
    grid.jqGrid({
        datatype: 'local',
        caption: vLayer.name,
        colModel: [
            {name: 'attributes', hidden: true}, // trick to can read the attributes
            { name: 'attributes.title', label: 'Title', width: 150},
            { name: 'attributes.size', label: 'Size', width: 100}
        ],
        height: "100%",
        pager: '#grid-pager',
        rowNum: 20,
        sortname: 'Name',
        ignoreCase: true,
        deselectAfterSort: true,
        loadComplete: refreshSelection,
        onSelectRow: rowSelected
    });
    $("#lli").hide();
    