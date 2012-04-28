// Define grid selectionIds and fpControl
        var grid,
            selectionIds = [], // to store grid selection
            fpControl;

// Functions to bind grid with fpControl
    // listeners on grig
    var rowSelected = function(id, status) {
        if (status) {
            selectionIds.push(id);
            fpControl.addSelectionByIds(vLayer.id, [id], true);
            fpControl.showSingleFeatureById(vLayer.id, id);
        } else {
            OpenLayers.Util.removeItem(selectionIds, id);
            fpControl.removeSelectionByIds(vLayer.id, [id], true);
            fpControl.showSingleFeatureById();
        }
    };
    var refreshSelection = function() {            
        for (var i =0, len = selectionIds.length; i < len; i++) {
            grid.jqGrid('setSelection', selectionIds[i], false);
        }
    };        
    // listeners on control
    var setGridFeatures = function(evt) {
        var features = evt.features;
        grid.jqGrid('clearGridData');
        grid.jqGrid('addRowData','id',features);
        grid.trigger("reloadGrid");
        if (features.length) {
            setGridSelection(evt);
            $("#grid-container").show();
        } else {
            $("#grid-container").hide();
        }
    };
    var setGridSelection = function(evt) {            
        grid.jqGrid('resetSelection');
        selectionIds = fpControl.getSelectionIds(evt.object);
        refreshSelection();
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
            "featureschanged": setGridFeatures,
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
            {name: 'attributes.title', label: 'Title', width: 150},
            {name: 'attributes.size', label: 'Size', width: 100}
        ],
        height: "100%",
        pager: '#grid-pager',
        rowNum: 20,
        sortname: 'Name',
        ignoreCase: true,
        multiselect: true,
        deselectAfterSort: true,
        loadComplete: refreshSelection,
        onSelectRow: rowSelected
    });
    $("#grid-container").hide();