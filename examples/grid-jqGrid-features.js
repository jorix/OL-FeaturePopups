// Define grid selectionIds and fpControl
        var grid,
            selectionIds = [], // to store grid selection
            fpControl;

// Functions to bind grid with fpControl
    // listeners on control
    var fpControl_onFeaturesChanged = function(evt) {
        var features = evt.features;
        grid.jqGrid('clearGridData');
        grid.jqGrid('addRowData', 'id', features);
        grid.trigger('reloadGrid');
        if (features.length) {
            fpControl_onSelectionChanged(evt);
            $('#grid-container').show();
        } else {
            $('#grid-container').hide();
        }
    };
    var fpControl_onSelectionChanged = function(evt) {
        fpControl.showSingleFeatureById();
        grid.jqGrid('resetSelection');
        selectionIds = fpControl.getSelectionIds(evt.layer);
        refreshSelection();
    };
    // listeners on grid
    var grid_onRowSelected = function(id, status) {
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
    var grid_onLoadComplete = function() {
        refreshSelection();
    };
    var refreshSelection = function() {
        for (var i = 0, len = selectionIds.length; i < len; i++) {
            grid.jqGrid('setSelection', selectionIds[i], false);
        }
    };

// Create Control
    fpControl = new OpenLayers.Control.FeaturePopups({
        hoverOptions: {renderIntent: 'temporary'},
        popupSelectOptions: null,
        popupListOptions: null
    });
    map.addControl(fpControl);
    fpControl.addLayer(vLayer, {
        templates: {single: '${.title} ${.size}'},
        eventListeners: {
            'featureschanged': fpControl_onFeaturesChanged,
            'selectionchanged': fpControl_onSelectionChanged
        }
    });

// Create Grid
    grid = $('#grid-data');
    grid.jqGrid({
        datatype: 'local',
        caption: vLayer.name,
        colModel: [
            {name: 'attributes', hidden: true}, // trick to can read the attributes
            {name: 'attributes.title', label: 'Title', width: 200},
            {name: 'attributes.size', label: 'Size', width: 50}
        ],
        height: '100%',
        pager: '#grid-pager',
        rowNum: 20,
        sortname: 'Name',
        ignoreCase: true,
        multiselect: true,
        deselectAfterSort: true,
        loadComplete: grid_onLoadComplete,
        onSelectRow: grid_onRowSelected
    });
    $('#grid-container').hide();
