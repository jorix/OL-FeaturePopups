/* Copyright 2011-2014 by Xavier Mamano http://github.com/jorix/OL-FeaturePopups
 * Published under MIT license. */

/**
 * @requires OpenLayers/Control/SelectFeature.js
 * @requires OpenLayers/Lang.js
 * @requires OpenLayers/Popup.js
 */

/**
 * Class: OpenLayers.Control.FeaturePopups
 * The FeaturePopups control selects vector features from a given layers on
 * click and hover and can show the feature attributes in a popups.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.FeaturePopups = OpenLayers.Class(OpenLayers.Control, {

    /**
     * APIProperty: mode
     * To enable or disable the various behaviors of the control.
     *
     * Use bitwise operators and one or more <OpenLayers.Control.FeaturePopups>:
     *  NONE - To not activate any particular behavior.
     *  CLOSE_ON_REMOVE -Popups will close when removing features in a layer,
     *     is ignored when used in conjunction with SAFE_SELECTION.
     *  SAFE_SELECTION - Features will remain selected even have been removed
     *     from the layer. Is useful when using <OpenLayers.Strategy.BBOX> with
     *     features with "fid" or when using <OpenLayers.Strategy.Cluster>.
     *     Using "BBOX" when a feature is added back to the layer will be
     *     re-selected automatically by "fid".
     *  CLOSE_ON_UNSELECT - Popups will close when unselect the feature.
     *  CLOSE_BOX - Display a close box inside the popups.
     *  UNSELECT_ON_CLOSE - To unselect all features when a popup is closed.
     *  DEFAULT - Includes default behaviors SAFE_SELECTION |
     *      CLOSE_ON_UNSELECT | CLOSE_BOX | UNSELECT_ON_CLOSE
     *
     * Default is <OpenLayers.Control.FeaturePopups.DEFAULT>.
     */
    mode: null,

    /**
     * APIProperty: autoActivate
     * {Boolean} Activate the control when it is added to a map. Default is
     *     true.
     */
    autoActivate: true,

    /**
     * APIProperty: selectOptions
     * {Object|null} Used to set non-default properties on SelectFeature control
     *     dedicated to select features. When using a null value the select
     *     features control is not created. The default is create the control.
     *
     * Default options other than SelectFeature control:
     * - clickout: false
     * - multipleKey: 'shiftKey'
     * - toggleKey: 'shiftKey'
     *
     * Options ignored:
     * - highlightOnly: always false.
     * - box: always false (use <boxSelectionOptions>).
     */
    selectOptions: null,

    /**
     * APIProperty: boxSelectionOptions
     * {Object|null} Used to set non-default properties on
     *     <OpenLayers.Handler.Box> dedicated to select features by a box.
     *     When using a null value the handler is not created.
     *     The default is do not create the handler, so don't use box selection.
     *
     * Default options other than Box handler:
     * - KeyMask: OpenLayers.Handler.MOD_CTRL
     * - boxDivClassName: 'olHandlerBoxSelectFeature'
     */
    boxSelectionOptions: null,

    /**
     * APIProperty: hoverOptions
     * {Object|null} Used to set non-default properties on SelectFeature control
     *     dedicated to highlight features. When using a null value (or
     *     selectOptions.hover == true) the highlight features control is
     *     not created. The default is create the control.
     *
     * Options ignored:
     * - hover: always true
     * - highlightOnly: always true
     * - box: always false (use <boxSelectionOptions>).
     */
    hoverOptions: null,

    /**
     * APIProperty: popupOptions
     * {Object} Options used to create a popup manager for hover & selections,
     *     see defaults for any valid keys.
     *
     * May contain 5 valid keys: "hover","hoverList", "list", "single" and,
     *     "listItem". To not use the popups associated with a key set the value
     *     of the key to null.
     *
     * For more details of valid options for any key see
     *     <FeaturePopups.Popup.Constructor>.
     *
     * NOTE: Use this keys instead of <popupHoverOptions>,
     *     <popupHoverListOptions>, <popupListOptions>, <popupSingleOptions> and
     *     <popupListItemOptions>.
     *
     * Default options for "hover":
     * popupClass - <OpenLayers.Popup.Anchored>
     * panMapIfOutOfView - false
     * followCursor - true
     * anchor - {size: new OpenLayers.Size(15, 19),
     *           offset: new OpenLayers.Pixel(-1, -1)}
     * relatedToClear - ["hoverList"]
     *
     * Default options for "hoverList":
     * popupClass - <OpenLayers.Popup.Anchored>
     * panMapIfOutOfView - false
     * followCursor - true
     * anchor - {size: new OpenLayers.Size(15, 19),
     *           offset: new OpenLayers.Pixel(-1, -1)}
     * relatedToClear - ["hover"]
     *
     * Default options for "list":
     * popupClass - <OpenLayers.Popup.FramedCloud>
     * panMapIfOutOfView - true
     * unselectFunction - Depends on the <FeaturePopups.mode> (internal use)
     * closeBox - Depends on the <FeaturePopups.mode> (internal use)
     * observeItems - true (internal use)
     * relatedToClear - ["hover", "hoverList", "listItem", "single"]
     *
     * Default options for "single":
     * popupClass - <OpenLayers.Popup.FramedCloud>
     * panMapIfOutOfView - true
     * unselectFunction - Depends on the <mode> (internal use)
     * closeBox - Depends on the <mode> (internal use)
     * relatedToClear: ["hover", "hoverList", "listItem", "list"]
     *
     * Default options for "listItem":
     * popupClass -  <OpenLayers.Popup.FramedCloud>
     * panMapIfOutOfView - true
     * closeBox - Depends on the <mode> (internal use)
     * relatedSimultaneous - {axis: "v", related: "list"} (internal use)
     * relatedToClear - ["single"]
     */
    popupOptions: null,

    /**
     * APIProperty: popupHoverOptions
     * {Object} Options used to create a popup manager to highlight on hover.
     *     See <FeaturePopups.Popup> constructor options for more details.
     *
     * Default options:
     * popupClass - <OpenLayers.Popup.Anchored>
     * panMapIfOutOfView - false
     *
     * Default options for internal use:
     * followCursor - true
     * anchor - {size: new OpenLayers.Size(15, 19),
     *                                     offset: new OpenLayers.Pixel(-1, -1)}
     * relatedToClear - ["hoverList"]
     */
    popupHoverOptions: null,

    /**
     * APIProperty: popupHoverListOptions
     * {Object} Options used to create a popup manager for highlight on
     *     hover a cluster. See <FeaturePopups.Popup> constructor options
     *     for more details.
     *
     * Default options:
     * popupClass - <OpenLayers.Popup.Anchored>
     * panMapIfOutOfView - false
     *
     * Default options for internal use:
     * followCursor - true
     * anchor - {size: new OpenLayers.Size(15, 19),
     *                                     offset: new OpenLayers.Pixel(-1, -1)}
     * relatedToClear - ["hover"]
     */
    popupHoverListOptions: null,

    /**
     * APIProperty: popupSingleOptions
     * {Object} Options used to create a popup manager for single selections.
     *     See <FeaturePopups.Popup> constructor options for more details.
     *
     * Default options:
     * popupClass - <OpenLayers.Popup.FramedCloud>
     * panMapIfOutOfView - true
     *
     * Default options for internal use:
     * unselectFunction - Depends on the <mode>
     * closeBox - Depends on the <mode>
     * relatedToClear: ["hover", "hoverList", "list", "listItem"]
     */
    popupSingleOptions: null,

    /**
     * APIProperty: popupListOptions
     * {Object} Options used to create a popup manager for multiple selections.
     *     See <FeaturePopups.Popup> constructor options for more details.
     *
     * Default options:
     * popupClass - <OpenLayers.Popup.FramedCloud>
     * panMapIfOutOfView - true
     *
     * Default options for internal use:
     * unselectFunction - Depends on the <mode>
     * closeBox - Depends on the <mode>
     * observeItems - true
     * relatedToClear - ["hover", "hoverList", "single", "listItem"]
     */
    popupListOptions: null,

    /**
     * APIProperty: popupListItemOptions
     * {Object} Options used to create the popup manager for show a single item
     *     into a multiple selection. See <FeaturePopups.Popup> constructor
     *     options for more details.
     *
     * Default options:
     * popupClass -  <OpenLayers.Popup.FramedCloud>
     * panMapIfOutOfView - true
     *
     * Default options for internal use:
     * closeBox - Depends on the <mode>
     * relatedToClear - ["single"]
     * relatedSimultaneous - {axis: "v", related: "list"}
     */
    popupListItemOptions: null,

    /**
     * APIProperty: layerListTemplate
     * Default is
     *    "<h2>${layer.name} - ${count}</h2><ul>${html}</ul>"
     */
    layerListTemplate: '<h2>${layer.name} - ${count}</h2><ul>${html}</ul>',

    /**
     * APIProperty: hoverClusterTemplate
     * Default is
     *   "Cluster with ${cluster.length} features<br>on layer \"${layer.name}\""
     */
    hoverClusterTemplate:
      "${i18n('Cluster with ${count} features<br>on layer \"${layer.name}\"')}",

    /**
     * Property: selectingSet
     * {Boolean} The control set to true this property while being selected a
     *    set of features to can ignore individual selection, internal use only.
     */
    selectingSet: false,

    /**
     * Property: unselectingAll
     * {Boolean} The control set to true this property while being unselected
     *     all features to can ignore individual unselection, internal use only.
     */
    unselectingAll: false,

    /**
     * Property: hoverListeners
     * {Object} hoverListeners object will be registered with
     *     <OpenLayers.Events.on> on hover control, internal use only.
     */
    hoverListeners: null,

    /**
     * Property: popupObjs
     * {Object} Internal use only.
     */
    popupObjs: null,

    /**
     * Property: controls
     * {Object} Internal use only.
     */
    controls: null,

    /**
     * Property: layerObjs
     * {Object} stores templates and others objects of this control's layers,
     *     internal use only.
     */
    layerObjs: null,

    /**
     * Property: layers
     * {Array(<OpenLayers.Layer.Vector>)} The layers this control will work on,
     *     internal use only.
     */
    layers: null,

    /**
     * Constructor: OpenLayers.Control.FeaturePopups
     * Create a new control that internally uses two
     *     <OpenLayers.Control.SelectFeature> one for selecting features, and
     *     another only to highlight them by hover (see <selectOptions>,
     *     and <hoverOptions>). This control can use also a
     *     <OpenLayers.Handler.Box> to select features by a box, see
     *     <boxSelectionOptions> .
     *
     * The control can generates three types of popup: "hover", "single" and
     *     "list", see <addLayer>.
     * Each popup has a displayClass according to their type:
     *     "[displayClass]_hover" ,"[displayClass]_select" and
     *     "[displayClass]_list" respectively.
     *
     * options - {Object}
     */
    initialize: function(options) {
        // Options
        // -------
        var MODES = OpenLayers.Control.FeaturePopups;
        options = OpenLayers.Util.applyDefaults(options, {
            mode: MODES.DEFAULT
        });
        var layers = options.layers;
        delete options.layers;
        OpenLayers.Control.prototype.initialize.call(this, options);

        // Internal Objects
        // ----------------
        this.layerObjs = {};
        this.layers = [];

        // Controls
        // --------
        this.controls = {};
        var self = this; // to do some tricks.

        // Hover control
        if (options.hoverOptions !== null &&
                            !(this.selectOptions && this.selectOptions.hover)) {
            var hoverOptions = OpenLayers.Util.extend(this.hoverOptions, {
                hover: true,
                highlightOnly: true,
                box: false
            });
            var hoverClass = OpenLayers.Class(
                                             OpenLayers.Control.SelectFeature, {
                // Trick to close hover popup when over a selected feature and
                //     leave it.
                outFeature: function(feature) {
                    if (feature._lastHighlighter === this.id) {
                        if (feature._prevHighlighter &&
                                    feature._prevHighlighter !== this.id) {
                            this.events.triggerEvent(
                                    'featureunhighlighted', {feature: feature});
                        }
                    }
                    OpenLayers.Control.SelectFeature.prototype.outFeature
                                                        .apply(this, arguments);
                }
            });
            var controlHover = new hoverClass([], hoverOptions);
            this.hoverListeners = {
                scope: this,
                featurehighlighted: this.onFeaturehighlighted,
                featureunhighlighted: this.onFeatureunhighlighted
            };
            controlHover.events.on(this.hoverListeners);
            this.controls.hover = controlHover;
        }

        // Select control
        if (options.selectOptions !== null) {
            var selOptions = OpenLayers.Util.applyDefaults(this.selectOptions, {
                clickout: false,
                multipleKey: 'shiftKey',
                toggleKey: 'shiftKey'
            });
            OpenLayers.Util.extend(selOptions,
                                            {box: false, highlightOnly: false});
            var selectClass = OpenLayers.Class(
                                             OpenLayers.Control.SelectFeature, {
                // Trick to close hover popup when the feature is selected.
                highlight: function(feature) {
                    var _lastHighlighter = feature._lastHighlighter;
                    OpenLayers.Control.SelectFeature.prototype.highlight.apply(
                                                    this, arguments);
                    if (controlHover && _lastHighlighter &&
                                _lastHighlighter !== feature._lastHighlighter) {
                        controlHover.events.triggerEvent(
                                    'featureunhighlighted', {feature: feature});
                    }
                }
            });
            var control = new selectClass([], selOptions);
            if (this.boxSelectionOptions) {
                // Handler for the trick to manage selection box.
                this.handlerBox = new OpenLayers.Handler.Box(
                    this, {
                        done: this.onSelectBox
                    },
                    OpenLayers.Util.applyDefaults(this.boxSelectionOptions, {
                        boxDivClassName: 'olHandlerBoxSelectFeature',
                        keyMask: OpenLayers.Handler.MOD_CTRL
                    })
                );
            }
            // Trick to refresh popups when click a feature of a multiple
            //     selection.
            control.unselectAll = function(options) {
                self.unselectingAll = true;
                OpenLayers.Control.SelectFeature.prototype.unselectAll.apply(
                                          this, arguments);
                self.unselectingAll = false;

                var exceptLayerId,
                    layerObjs = self.layerObjs;
                if (options && options.except) {
                    exceptLayerId = options.except.layer.id;
                }
                var layers = this.layers || [this.layer];
                for (var i = 0, len = layers.length; i < len; i++) {
                    var layerId = layers[i].id,
                    layerObj = layerObjs[layerId];
                    if (layerObj.safeSelection) {
                        layerObj.selection = {}; // clear selection storage
                        layerObj.refreshSelection();
                        if (layerId === exceptLayerId) {
                            layerObj.storeAsSelected(options.except);
                            // Force refreshSelection() if feature is selected
                            var selLayerFeature =
                                                layerObj.layer.selectedFeatures;
                            if (selLayerFeature.length &&
                                  selLayerFeature[0].id === options.except.id) {
                                layerObj.refreshSelection();
                            }
                        }
                    } else {
                        layerObj.refreshSelection();
                    }
                }
                self.refreshLayers();
            };
            this.controls.select = control;
        }

        // Popup Object Managers
        // ---------------------
        var _closeBox = !!(this.mode & MODES.CLOSE_BOX),
            _unselectFunction = (
                this.mode & MODES.UNSELECT_ON_CLOSE ?
                function() {
                    self.unselectGeneric();
                } :
                null
            );
        var defaultPopupOptions = {
            list: {
                popupClass: OpenLayers.Popup.FramedCloud,
                panMapIfOutOfView: true,
                // options for internal use
                closeBox: _closeBox,
                unselectFunction: _unselectFunction,
                observeItems: true,
                relatedToClear: ['hover', 'hoverList', 'single', 'listItem']
            },
            single: {
                popupClass: OpenLayers.Popup.FramedCloud,
                panMapIfOutOfView: true,
                // options for internal use
                closeBox: _closeBox,
                unselectFunction: _unselectFunction,
                relatedToClear: ['hover', 'hoverList', 'list', 'listItem']
            },
            listItem: {
                popupClass: OpenLayers.Popup.FramedCloud,
                panMapIfOutOfView: true,
                // options for internal use
                closeBox: _closeBox,
                relatedToClear: ['single'],
                relatedSimultaneous: {axis: 'v', related: 'list'}
            },
            hover: {
                popupClass: OpenLayers.Popup.Anchored,
                panMapIfOutOfView: false,
                // options for internal use
                followCursor: true,
                anchor: {
                    size: new OpenLayers.Size(15, 19),
                    offset: new OpenLayers.Pixel(-1, -1)
                },
                relatedToClear: ['hoverList']
            },
            hoverList: {
                popupClass: OpenLayers.Popup.Anchored,
                panMapIfOutOfView: false,
                // options for internal use
                followCursor: true,
                anchor: {
                    size: new OpenLayers.Size(15, 19),
                    offset: new OpenLayers.Pixel(-1, -1)
                },
                relatedToClear: ['hover']
            }
        };
        var popupOptions = options.popupOptions;
        if (!popupOptions) {
            popupOptions = {
                list: options.popupListOptions,
                single: options.popupSingleOptions,
                listItem: options.popupListItemOptions,
                hover: options.popupHoverOptions,
                hoverList: options.popupHoverListOptions
            };
        }
        this.popupObjs =
            OpenLayers.Control.FeaturePopups_Utils.createPopupObjs(
                                       this, popupOptions, defaultPopupOptions);

        // Add layers
        // ----------------
        layers && this.addLayers(layers);
    },

    /**
     * APIMethod: destroy
     */
    destroy: function() {
        if (!this.events) {
        // Don't destroy again (if events === null then control was destroyed)
            return;
        }
        this.deactivate();
        for (var popupType in this.popupObjs) {
            this.popupObjs[popupType].destroy();
        }
        this.popupObjs = null;

        for (var layerId in this.layerObjs) {
            this.layerObjs[layerId].destroy();
        }
        this.layerObjs = null;

        this.layers = null;
        this.handlerBox && this.handlerBox.destroy();
        this.handlerBox = null;

        var controls = this.controls;
        // Another process may have destroyed the controls, don't destroy again.
        controls.select && controls.select.events &&
                                                 this.controls.select.destroy();
        if (controls.hover && controls.hover.events) {
            controls.hover.events.un(this.hoverListeners);
            controls.hover.destroy();
        }
        this.controls = null;

        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: draw
     * This control does not have HTML component, so this method should
     *     be empty.
     */
    draw: function() {},

    /**
     * APIMethod: activate
     * Activates the control.
     *
     * Returns:
     * {Boolean} The control was effectively activated.
     */
    activate: function() {
        if (!this.events) { // This should be in OpenLayers.Control: Can not
                            //     activate a destroyed control.
            return false;
        }
        if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
            this.map.events.on({
                scope: this,
                'addlayer': this.onAddlayer,
                'removelayer': this.onRemovelayer,
                'changelayer': this.onChangelayer
            });
            var controls = this.controls;
            if (controls.hover) {
                controls.hover.setLayer(this.layers.slice());
                controls.hover.activate();
            }
            this.handlerBox && this.handlerBox.activate();
            if (controls.select) {
                controls.select.setLayer(this.layers.slice());
                controls.select.activate();
            }
            for (var layerId in this.layerObjs) {
                this.layerObjs[layerId].activate();
            }
            this.refreshLayers();
            return true;
        } else {
            return false;
        }
    },

    /**
     * APIMethod: deactivate
     * Deactivates the control.
     *
     * Returns:
     * {Boolean} The control was effectively deactivated.
     */
    deactivate: function() {
        if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
            this.map.events.un({
                scope: this,
                'addlayer': this.onAddlayer,
                'removelayer': this.onRemovelayer,
                'changelayer': this.onChangelayer
            });
            for (var layerId in this.layerObjs) {
                this.layerObjs[layerId].deactivate();
            }
            this.handlerBox && this.handlerBox.deactivate();
            var controls = this.controls;
            // OL bug: Another process may have destroyed the controls, then
            //         deactivate fails (if events === null then the control was
            //         destroyed)
            controls.hover && controls.hover.events &&
                                                    controls.hover.deactivate();
            controls.select && controls.select.events &&
                                                   controls.select.deactivate();
            for (var popupType in this.popupObjs) {
                this.popupObjs[popupType].clearPopup();
            }
            return true;
        } else {
            return false;
        }
    },

    /**
     * Method: setMap
     * Set the map property for the control.
     *
     * Parameters:
     * map - {<OpenLayers.Map>}
     */
    setMap: function(map) {
        if (this.boxSelectionOptions &&
            this.boxSelectionOptions.keyMask === OpenLayers.Handler.MOD_CTRL) {
        // To disable the context menu for machines which use CTRL-Click as
        //      a right click.
            map.viewPortDiv.oncontextmenu = OpenLayers.Function.False;
        }
        this.controls.hover && map.addControl(this.controls.hover);
        this.controls.select && map.addControl(this.controls.select);
        this.handlerBox && this.handlerBox.setMap(map);
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
    },

    /**
     * Method: onAddlayer
     * Listens only if the control it is active, internal use only.
     */
    onAddlayer: function(evt) {
        var layerObj = this.layerObjs[evt.layer.id];
        if (layerObj) {
            // Set layers in the control when added to the map after activating
            //     this control.
            var controls = this.controls;
            controls.hover && controls.hover.setLayer(this.layers.slice());
            controls.select && controls.select.setLayer(this.layers.slice());
            layerObj.activate();
            this.refreshLayers();
        }
    },

    /**
     * Method: onRemovelayer
     * Internal use only.
     */
    onRemovelayer: function(evt) {
        this.removeLayer(evt.layer);
    },

    /**
     * Method: onChangelayer
     * Internal use only.
     */
    onChangelayer: function(evt) {
        var layerObj = this.layerObjs[evt.layer.id];
        if (layerObj && evt.property === 'visibility') {
            layerObj.refreshFeatures();
            this.refreshLayers();
        }
    },

    /**
     * APIMethod: clear
     * Clear selecction and popups.
     */
    clear: function() {
        this.unselectAll();
        for (var layerId in this.layerObjs) {
            this.layerObjs[layerId].clear();
        }
        for (var key in this.popupObjs) {
            this.popupObjs[key].clearPopup();
        }
    },

    /**
     * APIMethod: addLayer
     * Add the layer to control and assigns it the templates, see options.
     *
     * To add a layer that has already been added (maybe automatically),
     *     first must be removed using <removeLayer>.
     *
     * Templates containing patterns as ${i18n("key")} are internationalized
     *     using <OpenLayers.i18n> function.
     *
     * The control uses the patterns as ${showPopup()} in a "item" template
     *     to show individual popups from a list. This pattern becomes a
     *     combination of the layer.id+feature.id and can be used only as an
     *     html attribute.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>}
     * options - {Object} Optional
     *
     * Valid options:
     * templates - {Object} Templates
     * listContext - {Object} Contains the keys with the values that were used
     *     instead of values of context used by templates `list` and
     *    `hoverList`. If 'undefined' key exists their value will be
     *     used instead of text 'undefined'.
     * featureContext - {Object} Contains the keys with the values --could be a
     *     function or {string}--, the resulting value is used instead of values
     *     of feature property with the same name. Used by templates: single,
     *     item, hover, hoverItem. If 'undefined' key exists their value will
     *     be used instead of text 'undefined'.
     * eventListeners - {Object} This object will be registered with
     *     <OpenLayers.Events.on>, default scope is the control.
     * pupupOptions - {Object} Inform to display the list popup separate from
     *     other layers, set to {} to use default options. See
     *     <FeaturePopups.Layer.pupupOptions> property for more details.
     *
     * (code)
     * templates: {
     *   hover: '${.name}',
     *   single: 'Name: ${.name}<br>Area: ${area} km2<hr>${.description}',
     *   item: '<li><a href="#" ${showPopup()}>${.name}</a></li>'
     * },
     * featureContext: {
     *   area: function(feature) { return feature.geometry.getArea(); },
     *   ...
     * }, ...
     * (end)
     *
     * *NOTE*: If the features of the layer may have an *"fid" duplicate* the
     *     key "fid" of "featureContext" *should be declared*, and returns
     *     unique values for each layer features, e.g. as
     * (code)
     * ... },
     * featureContext: {
     *   fid: function(feature) { return feature.id; },
     *   ...
     * }, ...
     * (end)
     *
     * Valid templates:
     * single - {String || Function} template used to show a single feature.
     * list - {String || Function} template used to show selected
     *     features as a list (each feature is shown using "item"),
     *     defaul is <layerListTemplate>.
     * item - {String || Function} template used to show a feature as
     *     a item in a list.
     * hover - {String || Function} template used on hover a single feature.
     * hoverList - {String || Function} template used on hover a clustered
     *     feature.
     * hoverItem - {String || Function} template used to show a feature as
     *     a item in a list on hover a clustered feature.
     *
     * Contexts of templates:
     * single, item, hover, hoverItem - Context is feature, can use `.` instead
     *     of `attributes.`, note that the feature can not have a layer property
     *     whether it belongs from clustered feature.
     * list, hoverList - context is a object with three properties: "count"
     *     (number of features) "html" (html of list of features) and "layer"
     *     (vector layer)
     *
     * If specified some template as layer property and as options has priority
     *     the options template.
     *
     * Valid events on eventListeners:
     * selectionchanged - Triggered after selection is changed, receives a event
     *      with "layer" and "selection" as array of features (note that
     *      features are not clustered and in this case may lack the property
     *      layer)
     * featureschanged - Triggered after layer features are changed, fired only
     *      changing the list of features and ignore the clusters changes or
     *      recharge if obtained new features but with the same "fid". Receives
     *      a event with "layer" and "features" as array of features (note that
     *      features are not clustered and in this case may lack the property
     *      layer)
     *
     * Note: "featureschanged" event is the first if the "selectionchanged"
     *     event is also triggered.
     */
    addLayer: function(layer, options) {
        this.addLayers([[layer, options]]);
    },

    /**
     * APIMethod: addLayers
     *
     * Parameters:
     * layers - Array({<OpenLayers.Layer.Vector>} || Array({Object})) Layers to
     *     add, and array of layers or pairs of arguments layer and options.
     */
    addLayers: function(layers) {
        var added = false,
            response,
            layerItem;
        for (var i = 0, len = layers.length; i < len; i++) {
            layerItem = layers[i];
            if (OpenLayers.Util.isArray(layerItem)) {
                response = this.addLayerToControl.apply(this, layerItem);
            } else {
                response = this.addLayerToControl(layerItem);
            }
            added = added || response;
        }
        if (added && this.active) {
            var controls = this.controls;
            controls.hover && controls.hover.setLayer(this.layers.slice());
            controls.select && controls.select.setLayer(this.layers.slice());
            this.refreshLayers(); // can be removed: caled by select.setLayer()
                                  //       on select.unselectAll().
        }
    },

    /**
     * Method: addLayerToControl
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>}
     * options - {Object}
     *
     * Returns:
     * {Boolean} True if the layer has been added.
     */
    addLayerToControl: function(layer, options) {
        var layerObj = this.getLayerObj(layer),
            response = false;
        if (!layerObj) {
            options = OpenLayers.Util.applyDefaults(options, {templates: {} });
            var oTemplates = options.templates;
            OpenLayers.Util.applyDefaults(options.templates, {
                list: (oTemplates.item ? this.layerListTemplate : ''),
                hoverList: (
                    (oTemplates.hover || oTemplates.hoverItem) ?
                                                 this.hoverClusterTemplate : '')
            });
            layerObj = new OpenLayers.Control.FeaturePopups.Layer(
                                                         this, layer, options);
            this.layers.push(layer);
            this.layerObjs[layer.id] = layerObj;
            this.active && layerObj.activate();
            response = true;
        }
        return response;
    },

    /**
     * APIMethod: removeLayer
     */
    removeLayer: function(layer) {
        var layerObj = this.getLayerObj(layer);
        if (layerObj) {
            if (this.active) {
                this.controls.hover && this.controls.hover.setLayer(
                                                           this.layers.slice());
                this.controls.select && this.controls.select.setLayer(
                                                           this.layers.slice());
            }
            layerObj.destroy();
            OpenLayers.Util.removeItem(this.layers, layer);
            delete this.layerObj[layer.id];
        }
    },

    /**
     * Method: onSelectBox
     * Callback from the handlerBox set up when <selectBox> is true.
     *
     * Parameters:
     * position - {<OpenLayers.Bounds> || <OpenLayers.Pixel>}
     */
    onSelectBox: function(position) {
        // Trick to not show individual features when using a selection box.
        this.selectingSet = true;
        OpenLayers.Control.SelectFeature.prototype.selectBox.apply(
                                              this.controls.select, arguments);
        this.selectingSet = false;
        for (var layerId in this.layerObjs) {
            this.layerObjs[layerId].refreshSelection();
        }
        this.refreshLayers();
    },

    /**
     * Method: onFeaturehighlighted
     * Internal use only.
     */
    onFeaturehighlighted: function(evt) {
        var feature = evt.feature,
            layerObj = this.layerObjs[feature.layer.id];
        layerObj.highlightFeature(feature);
    },

    /**
     * Method: onFeatureunhighlighted
     */
    onFeatureunhighlighted: function(evt) {
        this.popupObjs.hover && this.popupObjs.hover.clear();
    },

    /**
     * APIMethod: unselectAll
     * Unselect all selected features, only works if the control is active.
     */
    unselectAll: function() {
        var selControl = this.controls.select;
        if (selControl && this.active) {
            selControl.unselectAll();
        }
    },

    /**
     * APIMethod: unselectGeneric
     * Unselect all selected features on layers on the control that don't
     *     have <popupOptions>. Only works if the control is active.
     */
    unselectGeneric: function() {
        var selControl = this.controls.select;
        if (selControl && this.active) {
            var layerObjs = this.layerObjs;
            for (var key in layerObjs) {
                var layerObj = layerObjs[key];
                if (!layerObj.popupObjs) {
                    layerObj.unselectLayer(selControl);
                }
            }
            this.refreshLayers();
        }
    },

    /**
     * APIMethod: unselectLayer
     * Unselect all selected features on the layer, only works if the control
     *     is active and layer is on the control.
     */
    unselectLayer: function(layer) {
        var selectedFeatures = layer.selectedFeatures;
        // layer.selectedFeatures is null after a layer is destroyed.
        if (selectedFeatures) {
            var selControl = this.controls.select,
                layerObj = this.getLayerObj(layer);
            if (selControl && layerObj && this.active) {
                layerObj.unselectLayer(selControl);
                this.refreshLayers();
            }
        }
    },

    /**
     * Function: getLayerObj
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} The layer of selected feature.
     */
    getLayerObj: function(layer) {
        return layer ? this.layerObjs[layer.id] : null;
    },

    /**
     * Method: refreshLayers
     *
     * Parameters:
     * useCursorLocation - {Boolean}
     */
    refreshLayers: function(useCursorLocation) {
        var layers = OpenLayers.Array.filter(this.layers,
            function(layer) {
                return !!layer.map;
            }
        );
        var bounds = new OpenLayers.Bounds(),
            invalid = false,
            staticInvalid = false,
            html = [],
            selectedFeatures = [];
        var layerObj, r, layerPopObjs;
        for (var layerId in this.layerObjs) {
            layerObj = this.layerObjs[layerId];
            if (layerObj.active) {
                r = layerObj.selectionObject;
                layerPopObjs = layerObj.popupObjs;
                if (layerPopObjs) {
                    if(r.invalid) {
                        OpenLayers.Control.FeaturePopups_Utils.showListPopup(
                            layerPopObjs, [{
                                layerObj: layerObj,
                                layer: layerObj.layer,
                                features: r.features
                            }],
                            r.bounds, [r.html],
                            r.staticInvalid,
                            useCursorLocation,
                            this.controls.select.handlers.feature
                        );
                    }
                } else {
                    r.html && html.push(r.html);
                    invalid = invalid || r.invalid;
                    staticInvalid = staticInvalid || r.staticInvalid;
                    if (r.features.length) {
                        bounds.extend(r.bounds);
                        selectedFeatures.push({
                            layerObj: layerObj,
                            layer: layerObj.layer,
                            features: r.features
                        });
                    }
                }
                // reset flags of layerObj
                r.invalid = false;
                r.staticInvalid = false;
            }
        }
        if (invalid) {
            OpenLayers.Control.FeaturePopups_Utils.showListPopup(
                this.popupObjs, selectedFeatures, bounds, html,
                staticInvalid,
                useCursorLocation, this.controls.select.handlers.feature
            );
        }
    },

    CLASS_NAME: 'OpenLayers.Control.FeaturePopups'
});

/**
 * Constants: Modes
 * NONE - {Integer} Used in <mode> indicates to not activate any particular
 *     behavior.
 * CLOSE_ON_REMOVE - {Integer} Used in <mode> indicates that the popups will
 *     close when removing features in a layer.
 * SAFE_SELECTION - {Integer} Used in <mode> indicates that the features will
 *     remain selected even have been removed from the layer. Is useful when
 *     using <OpenLayers.Strategy.BBOX> with features with "fid" or when using
 *     <OpenLayers.Strategy.Cluster>. Using "BBOX" when a feature is added
 *     back to the layer will be re-selected automatically by "fid".
 * CLOSE_ON_UNSELECT - {Integer} Used in <mode> indicates that the popups will
 *     close when unselect the feature.
 * CLOSE_BOX - {Integer} Used in <mode> indicates to display a close box inside
 *     the popups.
 * UNSELECT_ON_CLOSE - {Integer} Used in <mode> indicates to unselect all
 *     features when a popup is closed.
 * DEFAULT - {Integer} Used in <mode> indicates to activate default behaviors
 *     as <SAFE_SELECTION> | <CLOSE_ON_UNSELECT> | <CLOSE_BOX> |
 *     <UNSELECT_ON_CLOSE>.
 */
OpenLayers.Control.FeaturePopups.NONE = 0;
OpenLayers.Control.FeaturePopups.CLOSE_ON_REMOVE = 1;
OpenLayers.Control.FeaturePopups.SAFE_SELECTION = 2;
OpenLayers.Control.FeaturePopups.CLOSE_ON_UNSELECT = 4;
OpenLayers.Control.FeaturePopups.CLOSE_BOX = 8;
OpenLayers.Control.FeaturePopups.UNSELECT_ON_CLOSE = 16;
OpenLayers.Control.FeaturePopups.DEFAULT =
    OpenLayers.Control.FeaturePopups.SAFE_SELECTION |
    OpenLayers.Control.FeaturePopups.CLOSE_ON_UNSELECT |
    OpenLayers.Control.FeaturePopups.CLOSE_BOX |
    OpenLayers.Control.FeaturePopups.UNSELECT_ON_CLOSE;

/**
 * Namespace: FeaturePopups_Utils
 */
 OpenLayers.Control.FeaturePopups_Utils = {};

 /**
 * Function: createPopupObjs
 *
 * Parameters:
 * environments - {<OpenLayers.Control.FeaturePopups>}|Array()
 * popupOptions - {Object}
 * popupDefaults - {Object}
 *
 * Returns:
 * {Object of <OpenLayers.Control.FeaturePopups.Popup>}
 */
OpenLayers.Control.FeaturePopups_Utils.createPopupObjs =
                           function(environments, popupOptions, popupDefaults) {
    var popupManager = OpenLayers.Control.FeaturePopups.Popup,
        applyDefaults = OpenLayers.Util.applyDefaults;
    var popupObjs = {};
    for (var key in popupDefaults) {
        var pOptions = popupOptions[key];
        if (pOptions !== null) {
            popupObjs[key] = new popupManager(
                environments,
                key,
                applyDefaults(pOptions, popupDefaults[key])
            );
        }
    }
    return popupObjs;
};

 /**
 * Function: showListPopup
 *
 * Parameters:
 *
 */
OpenLayers.Control.FeaturePopups_Utils.showListPopup = function(
                            popupObjs, selectedFeatures, bounds, html,
                            staticInvalid,
                            useCursorLocation, featureHandler) {
    var feature,
        lonLat,
        response = false,
        listPopupObj = popupObjs.list,
        singlePopupObj = popupObjs.single;
    // only one single feature is selected? so... try to show
    if (singlePopupObj && selectedFeatures.length === 1 &&
                              selectedFeatures[0].features.length === 1) {
        var selObject = selectedFeatures[0],
            feature = selObject.features[0],
            layerObj = selObject.layerObj;
        var rr = layerObj.getSingleHtml(feature);
        if (rr.hasTemplate) {
            if (useCursorLocation &&
                            feature.geometry.getVertices().length > 1) {
                lonLat = OpenLayers.Control.FeaturePopups_Utils
                            .getLocationFromHandler(
                                featureHandler,
                                feature);
            } else {
                lonLat = feature.geometry.getBounds().getCenterLonLat();
            }
            singlePopupObj.showPopup({
                                layerObj: layerObj,
                                layer: layerObj.layer,
                                feature: feature
                            }, lonLat, rr.html, staticInvalid);
            response = true;
        }
    }
    if (listPopupObj && !response) {
        listPopupObj.showPopup(
            selectedFeatures,
            bounds.getCenterLonLat(),
            (selectedFeatures.length ? html.join('\n') : ''),
            staticInvalid
        );
    }
};

/**
 * APIFunction: getLocationFromHandler
 * Get location from event handler.
 *
 * Parameters:
 * featureHandler - {<OpenLayers.Control.Handler.Feature>}
 * feature - {<OpenLayers.Feature.Vector>}
 *
 * Retruns:
 * {<OpenLayers.LonLat>} Location from pixel where the feature was selected.
 */
OpenLayers.Control.FeaturePopups_Utils.getLocationFromHandler =
                                             function(featureHandler, feature) {
    var lonLat;
    var xy = (featureHandler.feature === feature) ?
                                                   featureHandler.evt.xy : null;
    return (xy ? featureHandler.map.getLonLatFromPixel(xy) :
                feature.geometry.getBounds().getCenterLonLat()
           );
};

/**
 * Class: OpenLayers.Control.FeaturePopups.Popup
 */
OpenLayers.Control.FeaturePopups.Popup = OpenLayers.Class({
    /**
     * APIProperty: events
     * {<OpenLayers.Events>} Events instance for listeners and triggering
     *     specific events.
     *
     * Supported event types:
     *  beforepopupdisplayed - Triggered before a popup is displayed.
     *      To stop the popup from being displayed, a listener should return
     *      false. Receives an event with: "selection" a selection object
     *      (except for the "list" popup is an array of selection objects),
     *      "html" the html of the popup content (alter the html is allowed)
     *      Selection objects have three
     *      keys, "layerObj" (the <FeaturePopups.Layer> manager of the layer),
     *      "layer" (the layer) and "features" or "feature" (the singular key
     *      "feature" is used only for popupType: "single", "hover" or
     *      "listItem")
     *  popupdisplayed - Triggered after a popup is displayed. Receives an event
     *      with; "selection" (with the same structure described in the event
     *      "beforepopupdisplayed"), "div" the DOMElement used by the popup.
     *  closedbybox - Triggered after close a popup using close box. Receives
     *      an event with "popupType" see <Constructor>
     */
    events: null,

    /**
     * Constant: EVENT_TYPES
     * Only required to use <OpenLayers.Control.FeaturePopups> with 2.11 or less
     */
    EVENT_TYPES: ['beforepopupdisplayed', 'popupdisplayed', 'closedbybox'],

    /**
     * APIProperty: eventListeners
     * {Object} If set on options at construction, the eventListeners
     *     object will be registered with <OpenLayers.Events.on>.  Object
     *     structure must be a listeners object as shown in the example for
     *     the events.on method.
     */
    eventListeners: null,
    
    /** Property: environments
     * Array(<OpenLayers.Control.FeaturePopups>) First item is the control
     *     that initialized this popup manager.
     */
    environments: null,

    /** Property: control
     * {<OpenLayers.Control.FeaturePopups>} The control that initialized this
     *     popup manager.
     */
    control: null,

    /** APIProperty: type
     * {String} Type of popup manager, read only.
     */
    type: '',

    /** APIProperty: popupClass
     * {String|<OpenLayers.Popup>|Function} Type of popup to manage.
     */
    popupClass: null,

    /**
     * APIProperty: anchor
     * {Object} Object to which we'll anchor the popup. Must expose a
     *     'size' (<OpenLayers.Size>) and 'offset' (<OpenLayers.Pixel>).
     */
    anchor: null,

    /**
     * APIProperty: minSize
     * {<OpenLayers.Size>} Minimum size allowed for the popup's contents.
     */
    minSize: null,

    /**
     * APIProperty: maxSize
     * {<OpenLayers.Size>} Maximum size allowed for the popup's contents.
     */
    maxSize: null,

    /**
     * APIProperty: unselectFunction
     * {Function} Closing a popup all features are
     *     unselected using this function (used only if is not null)
     */
    unselectFunction: null,

    /**
     * APIProperty: closeBox
     * {Boolean} To display a close box inside the popup.
     */
    closeBox: false,

    /**
     * APIProperty: panMapIfOutOfView
     * {Boolean} When drawn, pan map such that the entire popup is visible in
     *     the current viewport (if necessary).
     *     Default is true.
     */
    panMapIfOutOfView: true,

    /**
     * Property: observeItems
     * {Boolean} If true, will be activated observers of the DOMElement of the
     *     popup to trigger some events (mostly in list popups).
     */
    observeItems: false,

    /**
     * Property: relatedToClear
     * Array({String}) Related <FeaturePopups.popupObjs> codes from <control>
     *     to clear.
     */
    relatedToClear: null,

    /** Property: origin
     * {<OpenLayers.Control.FeaturePopups.Popup>} Popup from where requested
     *     showing the current popup (usually an "listItem" that is requested
     *     from a "list")
     */
    origin: null,

    /**
     * Property: relatedSimultaneous
     * {Object} Object with two keys: "axis" key is the axis on which to display
     *     the two popups (valid values are "h" or "v") and "related" key is a
     *     code of <FeaturePopups.popupObjs> from <control> to show
     *     simultaneously without much overlap.
     */
    relatedSimultaneous: null,

    /** Property: popupType
     * {String} Code of type of popup to manage: "div", "OL" or "custom"
     */
    popupType: '',

    /**
     * Property: popup
     * {Boolean|<OpenLayers.Popup>} True or instance of OpenLayers.Popup when
     *     popup is showing.
     */
    popup: null,

    /**
     * Property: clearCustom
     * {Function|null} stores while displaying a custom popup the function to
     *     clear the popup, this function is returned by the custom popup.
     */
    clearCustom: null,

    /**
     * Property: onCloseBoxMethod
     * {Function|null} When the popup is created with closeBox argument to true,
     *     this property stores the method that implement any measures to close
     *     the popup, otherwise is null.
     */
    onCloseBoxMethod: null,

    /**
     * Property: moveListener
     * {Object} moveListener object will be registered with
     *     <OpenLayers.Events.on>, use only when <followCursor> is true.
     */
    moveListener: null,

    /**
     * Constructor: OpenLayers.Control.FeaturePopups.Popup
     * This class is a handler that is responsible for displaying and clear the
     *     one kind of popups managed by a <OpenLayers.Control.FeaturePopups>.
     *
     * The manager popup can handle three types of popups: a div a
     *     OpenLayers.Popup class or a custom popup, it depends on the type of
     *     "popupClass" argument.
     *
     * Parameters:
     * environments - {<OpenLayers.Control.FeaturePopups>}|Array() The control
     *     that initialized this popup manager, if array first item must be the
     *     control.
     * popupType - {String} Type of popup manager: "list", "single", "listItem"
     *     "hover" or "hoverList"
     * options - {Object}
     *
     * Valid ptions:
     * eventListeners - {Object} Listeners to register at object creation.
     * minSize - {<OpenLayers.Size>} Minimum size allowed for the popup's
     *     contents.
     * maxSize - {<OpenLayers.Size>} Maximum size allowed for the popup's
     *     contents.
     * popupClass - {String|<OpenLayers.Popup>|Function} Type of popup to
     *     manage: string for a "id" of a DOMElement, OpenLayers.Popup and a
     *     function for a custom popup.
     * anchor -{Object} Object to which we'll anchor the popup. Must expose a
     *     'size' (<OpenLayers.Size>) and 'offset' (<OpenLayers.Pixel>).
     * followCursor - {Boolean} If true, the popup will follow the cursor
     *     (useful for hover)
     * unselectFunction - {Function} Closing a popup all features are
     *     unselected using this function (used only if is not null)
     * closeBox - {Boolean} To display a close box inside the popup.
     * observeItems - {Boolean} If true, will be activated observers of the
     *     DOMElement of the popup to trigger some events (mostly by list
     *     popups).
     * relatedToClear - Array({String})|Array(Array({String})) Related
     *     <FeaturePopups.popupObjs> codes from <environments> to clear.
     * relatedSimultaneous - {Object} Object with two keys: "axis" key is the
     *     axis on which to display the two popups (valid values are "h" or "v")
     *     and "related" key is a code of <FeaturePopups.popupObjs> from
     *     <control> to show simultaneously without much overlap.
     * panMapIfOutOfView -{Boolean} When drawn, pan map such that the entire
     *     popup is visible in the current viewport (if necessary), default is
     *     true.
     */
    initialize: function(environments, popupType, options) {
        // Options
        OpenLayers.Util.extend(this, options);

        // Arguments
        if (OpenLayers.Util.isArray(environments)) {
            this.control = environments[0];
            this.environments = environments;
        } else {
            this.control = environments;
            this.environments = [environments];
        }
        
        this.type = popupType;

        // close box
        if (this.closeBox) {
            this.onCloseBoxMethod = OpenLayers.Function.bind(
                function(evt) {
                    this.unselectFunction && this.unselectFunction();
                    this.clear();
                    OpenLayers.Event.stop(evt);
                    this.events.triggerEvent(
                                         'closedbybox', {popupType: this.type});
                },
                this
            );
        }

        // Options
        this.relatedToClear = this.relatedToClear || [[]];
        if (this.relatedToClear.length === 0 ||
                             !OpenLayers.Util.isArray(this.relatedToClear[0])) {
            this.relatedToClear = [this.relatedToClear];
        }
        var popupClass = this.popupClass;
        if (popupClass) {
            var pClass = popupClass.prototype;
            if (typeof popupClass == 'string') {
                this.popupType = 'div';
            } else if (pClass && // Do some duck typed
                        pClass.contentDisplayClass &&
                        pClass.CLASS_NAME &&
                        pClass.map === null) {
                this.popupType = 'OL';
                var pClass = popupClass.prototype,
                    maxSize = this.maxSize,
                    minSize = this.minSize;
                if (maxSize) {
                    maxSize = new OpenLayers.Size(
                        isNaN(maxSize.w) ? 999999 : maxSize.w,
                        isNaN(maxSize.h) ? 999999 : maxSize.h
                    );
                }
                if (minSize) {
                    minSize = new OpenLayers.Size(
                        isNaN(minSize.w) ? 0 : minSize.w,
                        isNaN(minSize.h) ? 0 : minSize.h
                    );
                }
                if (pClass.maxSize) {
                    if (maxSize) {
                        maxSize.w = Math.min(maxSize.w, pClass.maxSize.w);
                        maxSize.h = Math.min(maxSize.h, pClass.maxSize.h);
                    } else {
                        maxSize = pClass.maxSize;
                    }
                }
                if (pClass.minSize) {
                    if (minSize) {
                        minSize.w = Math.max(minSize.w, pClass.minSize.w);
                        minSize.h = Math.max(minSize.h, pClass.minSize.h);
                    } else {
                        minSize = pClass.minSize;
                    }
                }
                var self = this; // To do tricks
                this.popupClass = OpenLayers.Class(popupClass, {
                    autoSize: true,
                    minSize: minSize,
                    maxSize: maxSize,
                    panMapIfOutOfView: this.panMapIfOutOfView,
                    panIntoView: function() {
                        self.panMapIfOutOfView &&
                            OpenLayers.Popup.prototype.panIntoView.call(this);
                    },
                    contentDisplayClass:
                        pClass.contentDisplayClass + ' ' +
                        this.control.displayClass + '_' + this.type
                });
            } else if (typeof popupClass == 'function') {
                this.popupType = 'custom';
            }
        }
        if (this.followCursor) {
            this.moveListener = {
                scope: this,
                mousemove: function(evt) {
                    var popup = this.popup;
                    if (popup && popup.moveTo) {
                        var map = this.control.map;
                        popup.moveTo(
                            map.getLayerPxFromLonLat(
                                map.getLonLatFromPixel(evt.xy)));
                    }
                }
            };
        }
        this.events = new OpenLayers.Events(this, null, this.EVENT_TYPES);
        this.eventListeners && this.events.on(this.eventListeners);
    },

    /**
     * APIMethod: destroy
     */
    destroy: function() {
        this.clear();
        this.eventListeners && this.events.un(this.eventListeners);
        this.events.destroy();
        this.events = null;
    },

    /**
     * Method: showPopup
     * Shows the popup if it has changed, and clears it previously
     *
     * Parameters:
     * selection - {Object}|Aray({Object}) Selected features.
     * lonlat - {<OpenLayers.LonLat>}  The position on the map the popup will
     *     be shown.
     * html - {String} An HTML string to display inside the popup.
     * panMap - {Boolean} If <panMapIfOutOfView> is true then pan map such that
     *     the entire popup is visible, defaul is true.
     * origin - {<OpenLayers.Control.FeaturePopups.Popup>|null} Popup from where
     *     requested showing the current popup
     */
    showPopup: function(selection, lonLat, html, panMap, origin) {
        this.clear();
        var popupClass = this.popupClass;
        if (popupClass && html) {
            var evt = {
                selection: selection,
                html: html
            };
            var cont = this.events.triggerEvent('beforepopupdisplayed', evt);
            if (cont !== false) {
                // this create "this.popup"
                html = evt.html;
                this.create(lonLat, html, panMap);
                if (this.popup) {
                    this.origin = origin ? origin : null;
                    this.observeItems && this.observeShowPopup(this.div);
                    this.events.triggerEvent('popupdisplayed', {
                        selection: selection,
                        div: this.div
                    });
                }
            }
        }
    },

    /**
     * APIMethod: clear
     * Clear the popup and related popups.
     */
    clear: function() {
        this.clearPopup();
        var iiLen = Math.min(this.relatedToClear.length,
                             this.environments.length);
        for (var ii = 0; ii < iiLen; ii++) {
            var popupObjs = this.environments[ii].popupObjs,
                relatedToClear = this.relatedToClear[ii];
            for (var i = 0, len = relatedToClear.length; i < len; i++) {
                var related = popupObjs[relatedToClear[i]];
                if (related &&
                         (related.origin === null || related.origin === this)) {
                    related.clearPopup();
                }
            }
        }
    },

    /**
     * Method: observeShowPopup
     * Internal use only.
     *
     * Parameters:
     * div - {DOMElement}
     */
    observeShowPopup: function(div) {
        for (var i = 0, len = div.childNodes.length; i < len; i++) {
            var child = div.childNodes[i];
            if (child.id && OpenLayers.String.startsWith(child.id,
                                              'showPopup-OpenLayers')) {
                OpenLayers.Event.observe(child, 'touchend',
                    OpenLayers.Function.bindAsEventListener(
                                              this.showListItem, this));
                OpenLayers.Event.observe(child, 'click',
                    OpenLayers.Function.bindAsEventListener(
                                              this.showListItem, this));
            } else {
                this.observeShowPopup(child);
            }
        }
    },

    /**
     * Method: showListItem
     * Internal use only.
     *
     * Parameters:
     * div - {DOMElement}
     *
     * Scope:
     * - {<OpenLayers.Control.FeaturePopups>}
     */
    showListItem: function(evt) {
        var elem = OpenLayers.Event.element(evt);
        if (elem.id) {
            var ids = elem.id.split('-');
            if (ids.length >= 2) {
                var layerObj = this.control.layerObjs[ids[1]];
                layerObj && layerObj.showSingleFeatureById(ids[2], this);
                OpenLayers.Event.stop(evt);
            }
        }
    },

    /**
     * Method: removeChildren
     * Internal use only.
     *
     * Parameters:
     * div - {DOMElement}
     */
    removeChildren: function(div) {
        var child;
        while (child = div.firstChild) {
            if (child.id && OpenLayers.String.startsWith(child.id,
                                              'showPopup-OpenLayers')) {
                OpenLayers.Event.stopObservingElement(child);
            }
            this.removeChildren(child);
            div.removeChild(child);
        }
    },

    /**
     * Method: create
     * Create the popup.
     */
    create: function(lonLat, html, panMap) {
        var div, popup,
            control = this.control;
        switch (this.popupType) {
        case 'div':
            div = document.getElementById(this.popupClass);
            if (div) {
                div.innerHTML = html;
                this.div = div;
                this.popup = true;
            }
            break;
        case 'OL':
            var _relatedPopup = null,
                _relatedAxis = null;
            if (this.relatedSimultaneous) {
                var relatedObj =
                            control.popupObjs[this.relatedSimultaneous.related];
                if (relatedObj &&
                            relatedObj.popup && relatedObj.popupType === 'OL') {
                    _relatedPopup = relatedObj.popup;
                    _relatedAxis = this.relatedSimultaneous.axis;
                }
            }
            popup = new this.popupClass(
                control.id + '_' + this.type,
                lonLat,
                new OpenLayers.Size(100, 100),
                html
            );
            if (this.anchor) {
                popup.anchor = this.anchor;
            }
            if (this.onCloseBoxMethod) {
                // The API of the popups is not homogeneous, closeBox may
                //      be the fifth or sixth argument, it depends!
                // So forces closeBox using other ways.
                popup.addCloseBox(this.onCloseBoxMethod);
                popup.closeDiv.style.zIndex = 1;
            }
            if (_relatedPopup) {
                var _prevCalcRelativePosition = popup.calculateRelativePosition,
                    _relpopRelPosition =
                                       (_relatedPopup.relativePosition || 'tr');
                var syncRelativePosition = function(px) {
                    if (!_relatedPopup.id) {
                        // if related is dretroyed
                        _prevCalcRelativePosition.call(popup, px);
                    }
                    var relPos = _relpopRelPosition || 'tr';
                    if (_relatedAxis === 'h') {
                        return relPos[0] + ((relPos[1] === 'l') ? 'r' : 'l');
                    } else {
                        return ((relPos[0] === 'b') ? 't' : 'b') + relPos[1];
                    }
                };
                if (_relatedPopup.calculateRelativePosition) {
                    _relatedPopup.calculateRelativePosition = function() {
                        return _relpopRelPosition;
                    };
                }
                if (popup.calculateRelativePosition) {
                    popup.calculateRelativePosition = syncRelativePosition;
                } else {
                    popup.relativePosition = syncRelativePosition();
                }
            }
            var save = this.panMapIfOutOfView;
            this.panMapIfOutOfView = (panMap !== false);
            control.map.addPopup(popup);
            this.panMapIfOutOfView = save;

            this.div = popup.contentDiv;
            this.popup = popup;
            this.moveListener && control.map.events.on(this.moveListener);
            break;
        case 'custom':
            var returnObj = this.popupClass(
                        control.map, lonLat, html, this.onCloseBoxMethod, this);
            if (returnObj.div) {
                this.clearCustom = returnObj.destroy;
                this.div = returnObj.div;
                this.popup = true;
            }
            break;
        }
    },

    /**
     * Method: clearPopup
     * Clear the popup if it is showing.
     */
    clearPopup: function() {
        if (this.popup) {
            this.observeItems && this.removeChildren(this.div);
            switch (this.popupType) {
            case 'OL':
                var control = this.control;
                if (control.map) {
                    control.map.removePopup(this.popup);
                }
                this.popup.destroy();
                this.moveListener && control.map.events.un(this.moveListener);
                break;
            case 'custom':
                if (this.popup) {
                    if (this.clearCustom) {
                        this.clearCustom();
                        this.clearCustom = null;
                    }
                }
                break;
            }
            this.div = null;
            this.popup = null;
            this.origin = null;
        }
    },

    CLASS_NAME: 'OpenLayers.Control.FeaturePopups.Popup'
});

/**
 * Class: OpenLayers.Control.FeaturePopups.Layer
 */
OpenLayers.Control.FeaturePopups.Layer = OpenLayers.Class({
    /**
     * APIProperty: events
     * {<OpenLayers.Events>} Events instance for listeners and triggering
     *     specific events.
     *
     * Supported event types: see  <FeaturePopups.addLayer>
     */
    events: null,

    /**
     * Constant: EVENT_TYPES
     * Only required to use <OpenLayers.Control.FeaturePopups> with 2.11 or less
     */
    EVENT_TYPES: ['featureschanged', 'selectionchanged'],

    /**
     * APIProperty: eventListeners
     * {Object} If set on options at construction, the eventListeners
     *     object will be registered with <OpenLayers.Events.on>.  Object
     *     structure must be a listeners object as shown in the example for
     *     the events.on method.
     */
    eventListeners: null,

    /**
     * Property: listenFeatures
     * {Boolean} internal use to optimize performance, true if <eventListeners>
     *     contains a "featureschanged" event.
     */
    listenFeatures: false,

    /**
     * APIProperty: templates
     * {Object} Set of templates, see <FeaturePopups.addLayer>
     */
    templates: null,

    /**
     * APIProperty: featureContext
     * {Object} See <FeaturePopups.addLayer>
     */
    featureContext: null,

    /**
     * APIProperty: listContext
     * {Object} See <FeaturePopups.addLayer>
     */
    listContext: null,

     /**
     * APIProperty: safeSelection
     * {Boolean} Read only, true if the control constructor argument in the
     *     <FeaturePopups.mode> have set
     *     <OpenLayers.Control.FeaturePopups.SAFE_SELECTION>.
     */
    safeSelection: false,

    /**
     * APIProperty: popupOptions
     * {Object} Options used to create a popup manager for selections only on
     *     this layer, set to {} to use default options, default is null.
     *
     * May contain two keys: "list" and "single".
     *
     * For more details of valid options for any key see
     *     <FeaturePopups.Popup.Constructor>.
     *
     * Default options for "list":
     * popupClass - <OpenLayers.Popup.FramedCloud>
     * panMapIfOutOfView - true
     * unselectFunction - Depends on the <FeaturePopups.mode> (internal use)
     * closeBox - Depends on the <FeaturePopups.mode> (internal use)
     * observeItems - true (internal use)
     * relatedToClear - [["hover", "hoverList", "listItem"], ["single"]]
     *     (internal use)
     *
     * Default options for "single":
     * popupClass - <OpenLayers.Popup.FramedCloud>
     * panMapIfOutOfView - true
     * unselectFunction - Depends on the <mode> (internal use)
     * closeBox - Depends on the <mode> (internal use)
     * relatedToClear: [["hover", "hoverList", "listItem"], ["list"]] (internal
     *     use)
     */
    popupOptions: null,

    /**
     * Property: popupObj
     * <OpenLayers.Control.FeaturePopups.Popup> Internal use.
     */
    popupObj: null,

    /**
     * Property: selection
     * {Object} Used if <safeSelection> is true. Set of the identifiers (id or
     *     fid if it exists) of the features that were selected, a feature
     *     remains on the object after being removed from the layer until
     *     occurs new selection.
     */
    selection: null,

    /**
     * Property: selectionObject
     * {Object} Used to store calculations associated with current selection.
     */
    selectionObject: null,

    /**
     * Property: selectionHash
     * {String} String unique for the single features of the selected features
     *     of the layer regardless of the order or clustering of these, is
     *     based on its id or fid (if it exists)
     */
    selectionHash: '',

    /**
     * Property: staticSelectionHash
     * {String} String unique for the single features of the static selected
     *     features of the layer regardless of the order or clustering of these,
     *     is based on its id or fid (if it exists)
     */
    staticSelectionHash: '',

    /**
     * Property: featuresHash
     * {String} String unique for the single features of the layer regardless
     *     of the order or clustering of these, is based on its id or fid (if
     *     it exists)
     */
    featuresHash: '',

    /**
     * Property: layerListeners
     * {Object} layerListeners object will be registered with
     *     <OpenLayers.Events.on>, internal use only.
     */
    layerListeners: null,

    /**
     * APIProperty: active
     * {Boolean} The object is active (read-only)
     */
    active: null,

    /**
     * Property: updatingSelection
     * {Boolean} The control set to true this property while being refreshed
     *     selection on a set of features to can ignore others acctions,
     *     internal use only.
     */
    updatingSelection: false,

    /**
     * Property: silentSelection
     * {Boolean} Suppress "selectionchanged" event triggering during a selection
     *     process, internal use only.
     */
    silentSelection: false,

    /**
     * Property: refreshDelay
     * {Number} Number of accepted milliseconds of waiting between removing and
     *     re-add features (useful when using strategies such as BBOX), after
     *     this time has expired is forced a popup refresh.
     */
    refreshDelay: 300,

    /**
     * Property: delayedRefresh
     * {Number} Timeout id of forced refresh.
     */
    delayedRefresh: null,

    /**
     * Property: regExpI18n
     * {RegEx} Used to internationalize templates.
     */
    regExpI18n: /\$\{i18n\(["']?([\s\S]+?)["']?\)\}/g,

    /**
     * Property: regExpShow
     * {RegEx} Used to activate events in the html elements to show individual
     *     popup.
     */
    regExpShow: /\$\{showPopup\(\w*\)\w*\}/g,

    /**
     * Property: regExpAttributes
     * {RegEx} Used to omit the name "attributes" as ${.myPropertyName} instead
     *     of ${attributes.myPropertyName} to show data on a popup using
     *     templates.
     */
    regExpAttributes: /\$\{\./g,

    /**
     * Constructor: OpenLayers.Control.FeaturePopups.Layer
     */
    initialize: function(control, layer, options) {
        // Options
        OpenLayers.Util.extend(this, options);

        // Objects
        this.selection = {};
        this.selectionObject = {};

        // Arguments
        this.control = control;
        this.layer = layer;

        // Prepare for special options
        options = options || {};

        // Templates
        var oTemplates = options.templates || {};
        var _templates = {};
        for (var templateName in oTemplates) {
            _templates[templateName] =
                                 this.prepareTemplate(oTemplates[templateName]);
        }
        this.templates = _templates;

        // Events
        this.events = new OpenLayers.Events(this, null, this.EVENT_TYPES);
        if (this.eventListeners) {
            this.events.on(this.eventListeners);
            this.listenFeatures = !!(this.eventListeners &&
                                       this.eventListeners['featureschanged']);
        }

        // Layer listeners
        // ---------------
        var mode = control.mode,
            MODES = OpenLayers.Control.FeaturePopups;
        this.safeSelection = !!(mode & MODES.SAFE_SELECTION);
        this.layerListeners = {
            scope: this,
            'featureselected': this.onFeatureselected
        };
        if (mode & MODES.CLOSE_ON_UNSELECT || this.safeSelection) {
            this.layerListeners['featureunselected'] = this.onFeatureunselected;
        }
        if (this.safeSelection) {
            this.layerListeners['beforefeaturesremoved'] =
                                                   this.onBeforefeaturesremoved;
            this.layerListeners['featuresadded'] = this.onFeaturesadded;
        } else if (mode & MODES.CLOSE_ON_REMOVE) {
            this.layerListeners['featuresremoved'] = this.onFeaturesremoved;
        }

        // Create a popups for this layer
        // -----------------------------
        if (options.popupOptions) {
            var _closeBox = !!(mode & MODES.CLOSE_BOX),
                _unselectFunction = (
                    mode & MODES.UNSELECT_ON_CLOSE ?
                    function() {
                        control.unselectLayer(layer);
                    } :
                    null
                );
            var defaultPopupOptions = {
                list: {
                    popupClass: OpenLayers.Popup.FramedCloud,
                    panMapIfOutOfView: true,
                    // options for internal use
                    closeBox: _closeBox,
                    unselectFunction: _unselectFunction,
                    observeItems: true,
                    relatedToClear: [
                        ['hover', 'hoverList', 'listItem'],
                        ['single']
                    ]
                },
                single: {
                    popupClass: OpenLayers.Popup.FramedCloud,
                    panMapIfOutOfView: true,
                    // options for internal use
                    closeBox: _closeBox,
                    unselectFunction: _unselectFunction,
                    relatedToClear: [
                        ['hover', 'hoverList', 'listItem'],
                        ['list']
                    ]
                }
            };
            this.popupObjs =
                    OpenLayers.Control.FeaturePopups_Utils.createPopupObjs(
                        [control, this],
                        options.popupOptions,
                        defaultPopupOptions
                    );
        }

        // Contexts as a private vars
        var _featureContext = this.featureContext || {},
            _listContext = this.listContext || {};
        // fid by feature context
        var getFid = _featureContext.fid;
        if (getFid) {
            this.getFeatureId = getFid;
        } else {
            /**
             * APIFunction: getFeatureId
             * Returns the id of the feature used specifically for this layer.
             *     Usually the id returned is the `fid` feature if it exists and
             *     otherwise is the `id`.
             *
             * This function can not be overwritten, use <featureContext> to
             *     change this behavior.
             *
             * Parameters:
             * feature - {OpenLayers.Feature.Vector}
             *
             * Returns:
             * {String} A unique identifier of the feature within the layer
             *     according <featureContext>.
             */
            this.getFeatureId = function(feature) {
                return feature.fid || feature.id;
            };
            _featureContext.fid = this.getFeatureId;
        }
        this.featureContext = _featureContext;
        this.listContext = _listContext;

        // Renderer of templates
        // ---------------
        // private vars
        var _context, _extendedContext;
        var _replacer = function(str, match) {
            var replacement;
            // Loop through all subs. Example: ${a.b.c}
            var subs = match.split(/\.+/);
            if (_extendedContext && subs.length === 1) {
                replacement = _extendedContext[subs[0]];
                if (replacement && typeof replacement == 'function') {
                    replacement = replacement.call(this, _context);
                }
            }
            if (replacement === undefined) {
                for (var i = 0; i < subs.length; i++) {
                    if (i == 0) {
                        replacement = _context;
                    }
                    if (replacement === undefined) {
                        break;
                    }
                    replacement = replacement[subs[i]];
                }
            }
            // If replacement is undefined, return the string 'undefined'.
            if (replacement === undefined) {
                if (_extendedContext) {
                    replacement = _extendedContext['undefined'];
                }
                replacement =
                        (replacement !== undefined ? replacement : 'undefined');
            }
            return replacement;
        };

        /**
         * Function: renderTemplate
         * Given a string with tokens in the form ${token}, return a string
         *     with tokens replaced with properties from the given context
         *     object.  Represent a literal "${" by doubling it, e.g. "${${".
         *
         * Parameters:
         * template - {String || Function}
         *     If template is a string then template
         *     has the form "literal ${token}" where the token will be replaced
         *     by the value of context["token"]. When is a function it will
         *     receive the context as a argument.
         * context - {Object} Object with properties corresponding to the tokens
         *     in the template.
         * extendedContext - {Object} Object with properties corresponding to
         *     the overlaid tokens, if a token is a function its scope is
         *     context.
         *
         * Returns:
         * {String} A string with tokens replaced from the context object.
         */
        var renderTemplate = function(template, context, extendedContext) {
            if (typeof template == 'string') {
                _context = context;
                _extendedContext = extendedContext;
                return template.replace(
                                       OpenLayers.String.tokenRegEx, _replacer);
            } else if (typeof template == 'function') {
                return template(context);
            } else {
                return '';
            }
        };

        /**
         * APIProperty: applyTemplate
         * {Object} The object contains an applicator of the template for each
         *    template name. Each applicator returns a {String} with tokens
         *    replaced from the context of feature (for names single, item,
         *    hover, hoverItem) or context of list (for names list and
         *    hoverList)
         */
        this.applyTemplate = {
            single: function(feature) {
                return renderTemplate(
                                   _templates.single, feature, _featureContext);
            },
            item: function(feature) {
                return renderTemplate(
                                     _templates.item, feature, _featureContext);
            },
            hover: function(feature) {
                return renderTemplate(
                                    _templates.hover, feature, _featureContext);
            },
            hoverItem: function(feature) {
                return renderTemplate(
                                _templates.hoverItem, feature, _featureContext);
            },
            list: function(listObj) {
                return renderTemplate(_templates.list, listObj, _listContext);
            },
            hoverList: function(listObj) {
                return renderTemplate(
                                   _templates.hoverList, listObj, _listContext);
            }
        };

        // published as public function
        this.renderTemplate = renderTemplate;
    },

    /**
     * Function: prepareTemplate
     * When the template is a string returns a prepared template, otherwise
     *     returns it as is.
     *
     * Parameters:
     * template - {String || Function}
     *
     * Returns:
     * {String || Function} A internationalized template.
     */
    prepareTemplate: function(template) {
        if (typeof template == 'string') {
            var _subId = 0,
                _layerId = this.layer.id;
            template = template.replace(
                this.regExpShow,
                function(a) {
                    _subId++;
                    return 'id="showPopup-' + _layerId +
                                                      '-${fid}-' + _subId + '"';
                }
            );
            template = template.replace(
                this.regExpAttributes,
                '${attributes.'
            );
            return template.replace( // internationalize template.
                this.regExpI18n,
                function(a, key) {
                    return OpenLayers.i18n(key);
                }
            );
        } else {
            return template;
        }
    },

    /**
     * APIMethod: destroy
     */
    destroy: function() {
        this.deactivate();
        this.selection = null;
        this.selectionObject = null;
        if (this.popupObjs) {
            for (var key in this.popupObjs) {
                this.popupObjs[key].destroy();
            }
        }
        this.eventListeners && this.events.un(this.eventListeners);
        this.events.destroy();
    },

    /**
     * APIMethod: activate
     */
    activate: function() {
        if (!this.active && this.layer.map) {
            this.layer.events.on(this.layerListeners);
            this.refreshFeatures();
            this.active = true;
            return true;
        } else {
            return false;
        }
    },

    /**
     * APIMethod: deactivate
     */
    deactivate: function() {
        if (this.active) {
            this.layer.events.un(this.layerListeners);
            this.active = false;
            if (this.popupObjs) {
                for (var key in this.popupObjs) {
                    this.popupObjs[key].clearPopup();
                }
            }
            return true;
        } else {
            return false;
        }
    },

    /**
     * Method: isEmptyObject
     *
     * Parameters:
     * obj - {Object}
     */
    isEmptyObject: function(obj) {
        for (var prop in obj) {
            return false;
        }
        return true;
    },

    /**
     * Method: highlightFeature
     * Internal use only.
     */
    highlightFeature: function(feature) {
        var control = this.control,
            popupObjHover = control.popupObjs.hover;
        if (!popupObjHover) { return; }

        popupObjHover.clear();
        var templates = this.templates,
            template = templates.hover,
            oContextFeature = this.featureContext;
        if (template) {
            var lonLat = OpenLayers.Control.FeaturePopups_Utils
                            .getLocationFromHandler(
                                control.controls.hover.handlers.feature,
                                feature);
            if (feature.cluster) {
                if (feature.cluster.length == 1) {
                    // show cluster as a single feature.
                    popupObjHover.showPopup({
                                layerObj: this,
                                layer: this.layer,
                                feature: feature
                            },
                            lonLat,
                            this.renderTemplate(
                                template, feature.cluster[0], oContextFeature));
                } else {
                    var html = '',
                        popupObjHoverList = control.popupObjs.hoverList;
                    if (popupObjHoverList) {
                        var cFeatures = feature.cluster,
                            itemTemplate = templates.hoverItem;
                        if (itemTemplate) {
                            var htmlAux = [];
                            for (var i = 0, len = cFeatures.length;
                                                                 i < len; i++) {
                                htmlAux.push(this.renderTemplate(itemTemplate,
                                                cFeatures[i], oContextFeature));
                            }
                            html = htmlAux.join('\n');
                        }
                        popupObjHoverList.showPopup({
                                layerObj: this,
                                layer: this.layer,
                                features: cFeatures
                            },
                            lonLat,
                            this.renderTemplate(templates.hoverList, {
                                layer: feature.layer,
                                count: cFeatures.length,
                                html: html
                            }, this.listContext)
                        );
                    }
                }
            } else {
                popupObjHover.showPopup({
                            layerObj: this,
                            layer: this.layer,
                            feature: feature
                        },
                        lonLat,
                        this.renderTemplate(template, feature, oContextFeature)
                );
            }
        }
    },

    /**
     * Method: onFeatureselected
     *
     * Parameters:
     * evt - {Object}
     */
    onFeatureselected: function(evt) {
        if (!this.updatingSelection && this.safeSelection) {
            this.storeAsSelected(evt.feature);
        }
        if (!this.control.selectingSet) {
            this.refreshSelection();
            this.control.refreshLayers(true);
        }
    },

    /**
     * Method: storeAsSelected
     *
     * Parameter:
     * feature - {OpenLayers.Feature.Vector} Feature to store as selected.
     */
    storeAsSelected: function(feature) {
        var layerId = feature.layer.id;
        var savedSF = this.selection;
        if (feature.cluster) {
            for (var i = 0 , len = feature.cluster.length; i < len; i++) {
                savedSF[this.getFeatureId(feature.cluster[i])] = true;
            }
        } else {
            savedSF[this.getFeatureId(feature)] = true;
        }
    },

    /**
     * Method: onFeatureunselected
     * Called when the select feature control unselects a feature.
     *
     * Parameters:
     * evt - {Object}
     */
    onFeatureunselected: function(evt) {
        var control = this.control;
        if (!control.unselectingAll) {
            if (this.safeSelection) {
                var savedSF = this.selection,
                    feature = evt.feature;
                if (savedSF) {
                    if (feature.cluster) {
                        for (var i = 0, len = feature.cluster.length;
                                                                 i < len; i++) {
                            delete savedSF[
                                         this.getFeatureId(feature.cluster[i])];
                        }
                    } else {
                        delete savedSF[this.getFeatureId(feature)];
                    }
                }
            }
            if (control.mode &
                           OpenLayers.Control.FeaturePopups.CLOSE_ON_UNSELECT) {
                this.refreshSelection();
                control.refreshLayers();
            }
        }
    },

    /**
     * Method: onBeforefeaturesremoved
     * Called before some features are removed, only used when <mode>
     *    contains <OpenLayers.Control.FeaturePopups.SAFE_SELECTION>.
     *
     * Parameters:
     * evt - {Object}
     */
    onBeforefeaturesremoved: function(evt) {
        if (evt.features.length && this.layer.getVisibility() &&
                                          !this.isEmptyObject(this.selection)) {
            // The features may be deleted to add others, so we will wait...
            if (this.delayedRefresh !== null) {
                window.clearTimeout(this.delayedRefresh);
            }
            this.delayedRefresh = window.setTimeout(
                OpenLayers.Function.bind(
                    function() {
                        if (this.layer.getVisibility()) {
                            this.delayedRefresh = null;
                            this.refreshFeatures();
                            this.control.refreshLayers();
                        }
                    },
                    this
                ),
                this.refreshDelay
            );
        }
    },

    /**
     * Method: onFeaturesremoved
     * Called when some features are removed, only used when
     *     <mode> = <OpenLayers.Control.FeaturePopups.CLOSE_ON_REMOVE>
     *
     * Parameters:
     * evt - {Object}
     */
    onFeaturesremoved: function(evt) {
        if (this.layer.getVisibility()) {
            this.refreshSelection();
            this.control.refreshLayers();
        }
    },

    /**
     * Method: onFeaturesadded
     * Called when some features are added, only used when value of <mode>
     *    conbtains <OpenLayers.Control.FeaturePopups.SAFE_SELECTION>.
     *
     * Parameters:
     * evt - {Object}
     */
    onFeaturesadded: function(evt) {
        if (!this.layer.getVisibility()) {
            return;
        }
        if (this.delayedRefresh !== null) {
            // Waiting for new features has been successful.
            window.clearTimeout(this.delayedRefresh);
            this.delayedRefresh = null;
        }
        var layerId = this.layer.id,
            control = this.control,
            features = evt.features,
            savedSF = this.selection;
        if (!this.isEmptyObject(savedSF)) {
            var selectCtl = control.controls.select;
            // Trick to can operate clickout after a zoom.
            // NOTE: SAFE_SELECTION mode is required.
            var _handlerFeature = selectCtl.handlers.feature,
                _replaceLastFeature = false;
            if (_handlerFeature.lastFeature &&
                                           !_handlerFeature.lastFeature.layer) {
                _replaceLastFeature = true;
            }
            var select = function(feature) {
                selectCtl.select(feature);
                if (_replaceLastFeature) {
                    _handlerFeature.lastFeature = feature;
                    _replaceLastFeature = false;
                }
            };
            control.selectingSet = true;
            this.updatingSelection = true;
            for (var i = 0 , len = features.length; i < len; i++) {
                var feature = features[i];
                if (feature.cluster) {
                    for (var ii = 0, lenlen = feature.cluster.length;
                                                            ii < lenlen; ii++) {
                        if (savedSF[this.getFeatureId(feature.cluster[ii])]) {
                            select(feature);
                            break;
                        }
                    }
                } else if (savedSF[this.getFeatureId(feature)]) {
                    select(feature);
                }
            }
            control.selectingSet = false;
            this.updatingSelection = false;
        }
        this.refreshFeatures();
        control.refreshLayers();
    },

    /**
     * Method: unselectLayer
     * Unselect all selected features by `selControl` on the layer.
     */
    unselectLayer: function(selControl) {
        var layer = this.layer,
            selectedFeatures = layer.selectedFeatures,
            control = this.control;
        // Clear internal selection objects
        this.selection = {};
        this.selectionObject = {
            invalidStatic: (this.staticSelectionHash !== ''),
            invalid: (this.selectionHash !== ''),
            html: '',
            features: [],
            bounds: new OpenLayers.Bounds()
        };
        this.selectionHash = '';
        this.staticSelectionHash = '';
        // Unselect by the selControl
        control.unselectingAll = true;
        for (var i = selectedFeatures.length - 1; i >= 0; i--) {
            selControl.unselect(selectedFeatures[i]);
        }
        control.unselectingAll = false;
    },

    /**
     * Method: refreshFeatures
     */
    refreshFeatures: function() {
        if (this.listenFeatures) {
            var featuresHash,
                layer = this.layer,
                layerFeatures = this.getSingleFeatures(layer.features);
            // get hash
            if (layer.getVisibility() && layer.map) {
                var ids = [];
                for (var i = 0, len = layerFeatures.length; i < len; ++i) {
                    ids.push(this.getFeatureId(layerFeatures[i]));
                }
                featuresHash = ids.sort().join('\t');
            } else {
                featuresHash = '';
                layerFeatures = [];
            }
            // have been changed?
            if (featuresHash !== this.featuresHash) {
                this.featuresHash = featuresHash;
                this.events.triggerEvent('featureschanged', {
                    layer: layer,
                    features: layerFeatures
                });
            }
        }
        this.refreshSelection();
    },

    /**
     * Function: refreshSelection
     */
    refreshSelection: function() {
        var layer = this.layer;

        var html = '',
            features = [],
            bounds = new OpenLayers.Bounds(),
            invalid = false,
            staticInvalid = false;
        if (layer.getVisibility() && layer.inRange) {
            var i, len, feature,
                selectionHash = [],
                staticSelectionHash = '',
                layerSelection = this.layer.selectedFeatures,
                oContextFeature = this.featureContext;
            if (this.safeSelection) {
                var savedSF = this.selection;
                for (i = 0, len = layerSelection.length; i < len; ++i) {
                    feature = layerSelection[i];
                    if (feature.cluster) {
                        // Not all features on layerSelection may be selected
                        //     on a cluster.
                        var clusterFeatures = feature.cluster;
                        for (var ii = 0, llen = clusterFeatures.length;
                                                              ii < llen; ii++) {
                            var cFeature = clusterFeatures[ii];
                            if (savedSF[this.getFeatureId(cFeature)]) {
                                features.push(cFeature);
                            }
                        }
                    } else {
                        features.push(feature);
                    }
                }
                var aux = [];
                for (var id in savedSF) {
                    aux.push(id);
                }
                staticSelectionHash = aux.sort().join('\t');
            } else {
                features = this.getSingleFeatures(layerSelection);
            }

            var layerTemplate = this.templates.list,
                htmlAux = [],
                itemTemplate = this.templates.item;
            for (i = 0, len = features.length; i < len; ++i) {
                feature = features[i];
                bounds.extend(feature.geometry.getBounds());
                layerTemplate && htmlAux.push(
                    this.renderTemplate(itemTemplate, feature, oContextFeature)
                );
                if (feature.fid) {
                    selectionHash.push(feature.fid);
                } else {
                    selectionHash.push(feature.id);
                }
            }
            selectionHash = selectionHash.sort().join('\t');
            if (!this.safeSelection) {
                staticSelectionHash = selectionHash;
            }
            if (selectionHash !== this.selectionHash) {
                invalid = true;
                this.selectionHash = selectionHash;
            }
            if (staticSelectionHash !== this.staticSelectionHash) {
                staticInvalid = true;
                this.staticSelectionHash = staticSelectionHash;
            }
            if (layerTemplate) {
                if (htmlAux.length) {
                    html = this.renderTemplate(
                        layerTemplate, {
                            layer: layer,
                            count: features.length,
                            html: htmlAux.join('\n')
                        },
                        this.listContext
                    );
                }
            }
        } else if (this.selectionHash !== '') {
            invalid = true;
            this.selectionHash = '';
        }
        if (invalid && !this.silentSelection) {
            this.events.triggerEvent('selectionchanged', {
                layer: layer,
                selection: features
            });
        }

        this.selectionObject = {
            invalid: invalid,
            staticInvalid: staticInvalid,
            html: html,
            bounds: bounds,
            features: features
        };
    },

    /**
     * Function: getSingleHtml
     */
    getSingleHtml: function(feature) {
        var html = '',
            hasTemplate = false,
            sTemplate = this.templates.single;
        if (sTemplate) {
            html = this.renderTemplate(
                             sTemplate, feature, this.featureContext);
            hasTemplate = true;
        }
        return {hasTemplate: hasTemplate, html: html};
    },

    /**
     * APIMethod: showSingleFeatureById
     * See featureContext at <FeaturePopups.addLayer> to know how to use "id" or
     *     "fid" of features.
     *
     * Parameters:
     * featureId - {String} id of the feature.
     * origin - {<OpenLayers.Control.FeaturePopups.Popup>|null}
     */
    showSingleFeatureById: function(featureId, origin) {
        var popupObj = this.control.popupObjs.listItem;
        if (!popupObj) { return; }

        var clearPopup = true;
        if (featureId) {
            var i, len, feature,
                found = false,
                layer = this.layer,
                features = layer.features;
            for (i = 0, len = features.length; i < len; i++) {
                feature = features[i];
                if (feature.cluster) {
                    var ii, len2, cFeature;
                    cFeature = feature;
                    for (ii = 0, len2 = cFeature.cluster.length;
                                                              ii < len2; ii++) {
                        feature = cFeature.cluster[ii];
                        if (this.getFeatureId(feature) == featureId) {
                            found = true;
                            break;
                        }
                    }
                } else {
                    found = this.getFeatureId(feature) == featureId;
                }
                // Don't try to show a cluster as a single feature,
                //      templates.single does not support it.
                if (found && !feature.cluster) {
                    var template = this.templates.single;
                    if (template) {
                        popupObj.showPopup({
                                layerObj: this,
                                layer: layer,
                                feature: feature
                            },
                            feature.geometry.getBounds().getCenterLonLat(),
                            this.renderTemplate(
                                template, feature, this.featureContext
                            ),
                            true,
                            origin
                        );
                        clearPopup = false;
                    }
                    break;
                }
            }
        }
        if (clearPopup) {
            popupObj.clear();
        }
    },

    /**
     * Function: getSingleFeatures
     */
    getSingleFeatures: function(features) {
        var sFeatures = [];
        var i, len, feature;
        for (i = 0, len = features.length; i < len; ++i) {
            feature = features[i];
            if (feature.cluster) {
                Array.prototype.push.apply(sFeatures, feature.cluster);
            } else {
                sFeatures.push(feature);
            }
        }
        return sFeatures;
    },

    CLASS_NAME: 'OpenLayers.Control.FeaturePopups.Layer'
});
