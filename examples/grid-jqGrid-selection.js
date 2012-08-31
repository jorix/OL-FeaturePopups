// Define grid & control
        var grid, fpControl, lastSelectId;

// Functions to bind grid with fpControl
    // listeners on control
    var fpControl_onSelectionChanged = function(evt) {
        lastSelectId = null;
        fpControl.showSingleFeatureById();
        grid.jqGrid('clearGridData');
        if (evt.selection.length) {
            grid.jqGrid('addRowData', 'id', evt.selection);
            grid.trigger('reloadGrid');
            $('#grid-container').show();
        } else {
            $('#grid-container').hide();
        }
    };
    // listeners on grid
    var grid_onRowSelected = function(id, status) {
        lastSelectId = id;
        fpControl.showSingleFeatureById(vLayer.id, id);
    };
    var grid_onLoadComplete = function() {
        lastSelectId && grid.jqGrid('setSelection', lastSelectId, false);
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
            'selectionchanged': fpControl_onSelectionChanged,
            'scope': fpControl
        }
    });

// Create Grid
    grid = $('#grid-data');
    grid.jqGrid({
        datatype: 'local',
        caption: vLayer.name,
        colModel: [
            {name: 'attributes', hidden: true}, // trick to can read the attributes
            { name: 'attributes.title', label: 'Title', width: 200},
            { name: 'attributes.size', label: 'Size', width: 50}
        ],
        height: '100%',
        pager: '#grid-pager',
        rowNum: 20,
        sortname: 'Name',
        ignoreCase: true,
        deselectAfterSort: true,
        loadComplete: grid_onLoadComplete,
        onSelectRow: grid_onRowSelected
    });
    $('#grid-container').hide();

