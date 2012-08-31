// Define grid & control
    var grid, fpControl,
        _silentSelect = false;

// Functions to bind grid with fpControl
    // listeners on control
    var fpControl_onFeaturesChanged = function(evt) {
        if (evt.features.length) {
            grid.getData().setItems(evt.features);
            grid.invalidate();
            $('#grid-container').show();
        } else {
            $('#grid-container').hide();
        }
    };
    var fpControl_onSelectionChanged = function(evt) {
        fpControl.showSingleFeatureById();
        _silentSelect = true;
        var ids = fpControl.getSelectionIds(evt.layer);
        grid.setSelectedRows(grid.getData().mapIdsToRows(ids));
        _silentSelect = false;
    };
    // listeners on grid
    var grid_selectionChanged = function(e, args) {
        if (!_silentSelect) {
            fpControl.setSelectionByIds(vLayer.id,
                grid.getData().mapRowsToIds(args.rows), true);
            // Show popup if active row is selected
            var row = grid.getActiveCell().row,
                selectedRows = grid.getSelectedRows();
            if (OpenLayers.Util.indexOf(selectedRows, row) > -1) {
                id = grid.getDataItem(row).id;
                fpControl.showSingleFeatureById(vLayer.id, id);
            } else {
                fpControl.showSingleFeatureById();
            }
        }
    };
    // Grid data view
    var grid_dataItemColumnValueExtractor = function(item, colDef) {
        return item.attributes[colDef.id];
    };
    var grid_onSort = function(e, args) {
        var sortcol = args.sortCol,
            dataView = grid.getData();
        _silentSelect = true;
        function comparer(a, b) {
            var x = grid_dataItemColumnValueExtractor(a, sortcol),
                y = grid_dataItemColumnValueExtractor(b, sortcol);
            return (x == y ? 0 : (x > y ? 1 : -1));
        }
        dataView.sort(comparer, args.sortAsc);
        grid.invalidate();
        _silentSelect = false;
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
    $('#grid-caption').html(vLayer.name);
    grid = new Slick.Grid('#grid-data',
        new Slick.Data.DataView({ inlineFilters: true }),
        [
            { id: 'title', field: 'title', name: 'Title', width: 200, sortable: true},
            { id: 'size', field: 'size', name: 'Size', width: 50, sortable: true}
        ], {
            forceFitColumns: true,
            multiSelect: true,
            dataItemColumnValueExtractor: grid_dataItemColumnValueExtractor
        }
    );
    grid.onSort.subscribe(grid_onSort);
    grid.setSelectionModel(new Slick.RowSelectionModel());
    grid.onSelectedRowsChanged.subscribe(grid_selectionChanged);
    grid.getData().syncGridSelection(grid, true);

    $('#grid-container').hide();

