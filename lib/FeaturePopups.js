/* Copyright 2011-2012 Xavier Mamano, http://github.com/jorix/OL-FeaturePopups
 * Published under MIT license. All rights reserved. */

/**
 * requires OpenLayers/Control/SelectFeature.js
 * requires OpenLayers/Lang.js
 * requires OpenLayers/Popup.js
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
     * Use bitwise operators and one or more of OpenLayers.Control.FeaturePopups:
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
     * APIProperty: popupHoverOptions
     * {Object} Options used to create the popup manager for to highlight on
     *     to hover. See <FeaturePopups.Popup> constructor options for more
     *     details.
     *
     * Default options:
     * popupClass - <OpenLayers.Popup.Anchored>
     * panMapIfOutOfView - false
     *
     * Default options for internal use:
     * followCursor - true
     * anchor - {size: new OpenLayers.Size(15, 19), offset: new OpenLayers.Pixel(-1, -1)}
     * relatedToClear - ["hoverList"]
     */
    popupHoverOptions: null,

    /**
     * APIProperty: popupHoverListOptions
     * {Object} Options used to create the popup manager for to highlight on
     *     to hover a cluster. See <FeaturePopups.Popup> constructor options
     *     for more details.
     *
     * Default options:
     * popupClass - <OpenLayers.Popup.Anchored>
     * panMapIfOutOfView - false
     *
     * Default options for internal use:
     * followCursor - true
     * anchor - {size: new OpenLayers.Size(15, 19), offset: new OpenLayers.Pixel(-1, -1)}
     * relatedToClear - ["hover"]
     */
    popupHoverListOptions: null,

    /**
     * APIProperty: popupSingleOptions
     * {Object} Options used to create the popup manager for single selections.
     *     See <FeaturePopups.Popup> constructor options for more details.
     *
     * Default options:
     * popupClass - <OpenLayers.Popup.FramedCloud>
     * panMapIfOutOfView - true
     *
     * Default options for internal use:
     * unselectOnClose - Depends on the <mode>
     * closeBox - Depends on the <mode>
     * observeItems - true
     * relatedToClear: ["hover", "hoverList", "list", "listItem"]
     */
    popupSingleOptions: null,

    /**
     * APIProperty: popupListOptions
     * {Object} Options used to create the popup manager for multiple selections.
     *     See <FeaturePopups.Popup> constructor options for more details.
     *
     * Default options:
     * popupClass - <OpenLayers.Popup.FramedCloud>
     * panMapIfOutOfView - true
     *
     * Default options for internal use:
     * unselectOnClose - Depends on the <mode>
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
     */
    popupListItemOptions: null,

    /**
     * APIProperty: layerListTemplate
     * Default is "<h2>${layer.name} - ${count}</h2><ul>${html}</ul>"
     */
    layerListTemplate: '<h2>${layer.name} - ${count}</h2><ul>${html}</ul>',

    /**
     * APIProperty: hoverClusterTemplate
     * Default is "Cluster with ${cluster.length} features<br>on layer "${layer.name}"
     */
    hoverClusterTemplate: "${i18n('Cluster with ${count} features<br>on layer \"${layer.name}\"')}",

    /**
     * Property: selectingSet
     * {Boolean} The control set to true this property while being selected a
     *     set of features to can ignore individual selection, internal use only.
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
        options = OpenLayers.Util.applyDefaults(options, {
            mode: OpenLayers.Control.FeaturePopups.DEFAULT
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
        if (options.hoverOptions !== null && !(this.selectOptions && this.selectOptions.hover)) {
            var hoverOptions = OpenLayers.Util.extend(this.hoverOptions, {
                hover: true,
                highlightOnly: true,
                box: false
            });
            var hoverClass = OpenLayers.Class(OpenLayers.Control.SelectFeature, {
                // Trick to close hover popup when hover over selected feature an leave it.
                outFeature: function(feature) {
                    if (feature._lastHighlighter === this.id) {
                        if (feature._prevHighlighter &&
                                    feature._prevHighlighter !== this.id) {
                            this.events.triggerEvent(
                                    'featureunhighlighted', {feature: feature});
                        }
                    }
                    OpenLayers.Control.SelectFeature.prototype.outFeature.apply(
                                                  this, arguments);
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
            OpenLayers.Util.extend(selOptions, {box: false, highlightOnly: false});
            var selectClass = OpenLayers.Class(OpenLayers.Control.SelectFeature, {
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
            // Trick to refresh popups when click a feature of a multiple selection.
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
        var _closeBox = !!(this.mode & OpenLayers.Control.FeaturePopups.CLOSE_BOX),
            _unselectOnClose = !!(this.mode & OpenLayers.Control.FeaturePopups.UNSELECT_ON_CLOSE);
        var popupObjs = {};
        if (options.popupListOptions !== null) {
            popupObjs.list = new OpenLayers.Control.FeaturePopups.Popup(
                this, 'list',
                OpenLayers.Util.applyDefaults(options.popupListOptions, {
                    popupClass: OpenLayers.Popup.FramedCloud,
                    panMapIfOutOfView: true,
                    // options for internal use
                    closeBox: _closeBox,
                    unselectOnClose: _unselectOnClose,
                    observeItems: true,
                    relatedToClear: ['hover', 'hoverList', 'single', 'listItem']
                })
            );
        }
        if (options.popupSingleOptions !== null) {
            popupObjs.single = new OpenLayers.Control.FeaturePopups.Popup(
                this, 'single',
                OpenLayers.Util.applyDefaults(options.popupSingleOptions, {
                    popupClass: OpenLayers.Popup.FramedCloud,
                    panMapIfOutOfView: true,
                    // options for internal use
                    closeBox: _closeBox,
                    unselectOnClose: _unselectOnClose,
                    relatedToClear: ['hover', 'hoverList', 'list', 'listItem']
                })
            );
        }
        if (options.popupListItemOptions !== null) {
            popupObjs.listItem = new OpenLayers.Control.FeaturePopups.Popup(
                this, 'listItem',
                OpenLayers.Util.applyDefaults(options.popupListItemOptions, {
                    popupClass: OpenLayers.Popup.FramedCloud,
                    panMapIfOutOfView: true,
                    // options for internal use
                    closeBox: _closeBox,
                    relatedToClear: ["single"]
                })
            );
        }
        if (options.popupHoverOptions !== null) {
            popupObjs.hover = new OpenLayers.Control.FeaturePopups.Popup(
                this, 'hover',
                OpenLayers.Util.applyDefaults(options.popupHoverOptions, {
                    popupClass: OpenLayers.Popup.Anchored,
                    panMapIfOutOfView: false,
                    // options for internal use
                    followCursor: true,
                    anchor: {
                        size: new OpenLayers.Size(15, 19),
                        offset: new OpenLayers.Pixel(-1, -1)
                    },
                    relatedToClear: ['hoverList']
                })
            );
        }
        if (options.popupHoverListOptions !== null) {
            popupObjs.hoverList = new OpenLayers.Control.FeaturePopups.Popup(
                this, 'hoverList',
                OpenLayers.Util.applyDefaults(options.popupHoverListOptions, {
                    popupClass: OpenLayers.Popup.Anchored,
                    panMapIfOutOfView: false,
                    // options for internal use
                    followCursor: true,
                    anchor: {
                        size: new OpenLayers.Size(15, 19),
                        offset: new OpenLayers.Pixel(-1, -1)
                    },
                    relatedToClear: ['hover']
                })
            );
        }
        this.popupObjs = popupObjs;

        // Add layers
        // ----------------
        layers && this.addLayers(layers);
    },

    /**
     * APIMethod: destroy
     */
    destroy: function() {
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
        this.controls.select && this.controls.select.destroy();
        if (this.controls.hover) {
            this.controls.hover.events.un(this.hoverListeners);
            this.controls.hover.destroy();
        }
        this.controls = null;
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: draw
     * This control does not have HTML component, so this method should be empty.
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
        if (!this.events) { // This should be in OpenLayers.Control: Can not activate a destroyed control.
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
            controls.hover && controls.hover.deactivate();
            controls.select && controls.select.deactivate();
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
        // To disable the context menu for machines which use CTRL-Click as a right click.
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
            // Set layers in the control when added to the map after activating this control.
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
     * It is convenient to use ${showPopup(fid)} instead of ${showPopup()}
     *     when the layer features have fid, this ensures that the popups from
     *     a list is still shown after zoom, even if a BBOX strategies is used.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>}
     * options - {Object} Optional
     *
     * Valid options:
     * templates - {Object} Templates
     * eventListeners - {Object} This object will be registered with
     *     <OpenLayers.Events.on>, default scope is the control.
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
     *     whether it belongs to a clustered layer.
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
            this.refreshLayers(); // can be removed: caled by select.setLayer() on select.unselectAll()
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
        var layerId = layer.id,
            layerObj = this.layerObjs[layerId],
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
            this.layerObjs[layerId] = layerObj;
            this.active && layerObj.activate();
            response = true;
        }
        return response;
    },

    /**
     * APIMethod: removeLayer
     */
    removeLayer: function(layer) {
        var layerId = layer.id,
            layerObj = this.layerObjs[layerId];
        if (layerObj) {
            if (this.active) {
                this.active && layerObj.clear();
                this.controls.hover && this.controls.hover.setLayer(this.layers.slice());
                this.controls.select && this.controls.select.setLayer(this.layers.slice());
            }
            layerObj.destroy();
            OpenLayers.Util.removeItem(this.layers, layer);
            delete this.layerObj[layerId];
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
     * APIMethod: showSingleFeatureById
     *
     * Parameters:
     * layerId - {String} id of the layer of selected feature.
     * featureId - {String} id of the feature.
     * idName - {String} Name of id: "id" or "fid".
     */
    showSingleFeatureById: function(layerId, featureId, idName) {
        var layerObj = this.layerObjs[layerId];
        if (layerObj) {
            layerObj.showSingleFeatureById(featureId, idName);
        } else {
            var popupObj = this.popupObjs.listItem;
            popupObj && popupObj.clear();
        }
    },

    /**
     * APIMethod: addSelectionByIds
     *
     * Parameters:
     * layerId - {String} id of the layer.
     * featureIds - {Array(String)} List of feature ids to be
     *     added to selection.
     * silent - {Boolean} Supress "selectionchanged" event triggering.  Default is false.
     */
    addSelectionByIds: function(layerId, featureIds, silent) {
        var layerObj = this.layerObjs[layerId];
        layerObj && layerObj.addSelectionByIds(featureIds, silent);
    },

    /**
     * APIMethod: setSelectionByIds
     *
     * Parameters:
     * layerId - {String} id of the layer.
     * featureIds - {Array(String)} List of feature ids to set as select.
     * silent - {Boolean} Supress "selectionchanged" event triggering.  Default is false.
     */
    setSelectionByIds: function(layerId, featureIds, silent) {
        var layerObj = this.layerObjs[layerId];
        layerObj && layerObj.setSelectionByIds(featureIds, silent);
    },

    /**
     * APIMethod: removeSelectionByIds
     *
     * Parameters:
     * layerId - {String} id of the layer.
     * featureIds - {Array(String)} List of feature ids to be
     *     removed to selection.
     * silent - {Boolean} Supress "selectionchanged" event triggering.  Default is false.
     */
    removeSelectionByIds: function(layerId, featureIds, silent) {
        var layerObj = this.layerObjs[layerId];
        layerObj && layerObj.removeSelectionByIds(featureIds, silent);
    },

    /**
     * APIFunction: getSelectionIds
     */
    getSelectionIds: function(layer) {
        var layerObj = this.layerObjs[layer.id];
        if (layerObj) {
            return layerObj.getSelectionIds();
        } else {
            return [];
        }
    },

    /**
     * Method: refreshLayers
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
            countSelected = 0,
            sFeature0 = null,
            allSelFeatures = [];
        var layerObj, lenAux, r;
        for (var layerId in this.layerObjs) {
            layerObj = this.layerObjs[layerId];
            if (layerObj.active) {
                r = layerObj.selectionObject;
                html.push(r.html);
                invalid = invalid || r.invalid;
                staticInvalid = staticInvalid || r.staticInvalid;
                r.staticInvalid = false; // reset flag of layerObj
                if (r.features.length) {
                    bounds.extend(r.bounds);
                    allSelFeatures.push({layer: layerObj.layer, features: r.features});
                    lenAux = layerObj.layer.selectedFeatures.length;
                    countSelected += lenAux;
                    if (lenAux === 1 && countSelected === 1) {
                        sFeature0 = layerObj.layer.selectedFeatures[0];
                    }
                }
            }
        }
        if (invalid) {
            var feature,
                response = false;
            // only one single feature is selected? so... try to show
            if (this.popupObjs.single && allSelFeatures.length === 1 &&
                                         allSelFeatures[0].features.length === 1) {
                var selObject = allSelFeatures[0],
                    feature = selObject.features[0];
                var rr = this.layerObjs[selObject.layer.id].getSingleHtml(feature);
                if (rr.hasTemplate) {
                    this.popupObjs.single.showPopup(
                                    feature, rr.lonLat, rr.html, staticInvalid);
                    response = !!this.popupObjs.single.popup;
                }
            }
            if (this.popupObjs.list && !response) {
                    // so is only one feature (or one cluster)
                var lonLat = (useCursorLocation && countSelected === 1) ?
                    this.getLocationFromSelPixel(this.controls.select, sFeature0) :
                    bounds.getCenterLonLat();
                this.popupObjs.list.showPopup(
                    allSelFeatures,
                    lonLat,
                    (allSelFeatures.length ? html.join('\n') : ''),
                    staticInvalid
                );
            }
        }
    },

    /**
     * function: getLocationFromSelPixel
     * Get selection location.
     *
     * Parameters:
     * selControls - {<OpenLayers.Control.SelectFeature>}
     * feature - {<OpenLayers.Feature.Vector>}
     *
     * Retruns:
     * {<OpenLayers.LonLat>} Location from pixel pixel where the feature was
     *      selected.
     */
    getLocationFromSelPixel: function(selControl, feature) {
        var lonLat,
            handler = selControl.handlers.feature;
        var xy = (handler.feature === feature) ? handler.evt.xy : null;
        return (xy ? this.map.getLonLatFromPixel(xy) :
                    feature.geometry.getBounds().getCenterLonLat()
               );
    },

    CLASS_NAME: 'OpenLayers.Control.FeaturePopups'
});

/**
 * Constant: NONE
 * {Integer} Used in <mode> indicates to not activate any particular behavior.
 */
OpenLayers.Control.FeaturePopups.NONE = 0;

/**
 * Constant: CLOSE_ON_REMOVE
 * {Integer} Used in <mode> indicates that the popups will close when
 *     removing features in a layer.
 */
OpenLayers.Control.FeaturePopups.CLOSE_ON_REMOVE = 1;

/**
 * Constant: SAFE_SELECTION
 * {Integer} Used in <mode> indicates that the features will remain
 *     selected even have been removed from the layer. Is useful when using
 *     <OpenLayers.Strategy.BBOX> with features with "fid" or when using
 *     <OpenLayers.Strategy.Cluster>. Using "BBOX" when a feature is added
 *     back to the layer will be re-selected automatically by "fid".
 */
OpenLayers.Control.FeaturePopups.SAFE_SELECTION = 2;

/**
 * Constant: CLOSE_ON_UNSELECT
 * {Integer} Used in <mode> indicates that the popups will close when
 *     unselect the feature.
 */
OpenLayers.Control.FeaturePopups.CLOSE_ON_UNSELECT = 4;

/**
 * Constant: CLOSE_BOX
 * {Integer} Used in <mode> indicates to display a close box inside the popups.
 */
OpenLayers.Control.FeaturePopups.CLOSE_BOX = 8;

/**
 * Constant: UNSELECT_ON_CLOSE
 * {Integer} Used in <mode> indicates to unselect all features when a popup is
 *     closed.
 */
OpenLayers.Control.FeaturePopups.UNSELECT_ON_CLOSE = 16;

/**
 * Constant: DEFAULT
 * {Integer} Used in <mode> indicates to activate default behaviors
 *      <SAFE_SELECTION> <CLOSE_ON_UNSELECT> <CLOSE_BOX> and <UNSELECT_ON_CLOSE>.
 */
OpenLayers.Control.FeaturePopups.DEFAULT =
    OpenLayers.Control.FeaturePopups.SAFE_SELECTION |
    OpenLayers.Control.FeaturePopups.CLOSE_ON_UNSELECT |
    OpenLayers.Control.FeaturePopups.CLOSE_BOX |
    OpenLayers.Control.FeaturePopups.UNSELECT_ON_CLOSE;

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
     *      false. Receives an event with; "popupType" see <Constructor>,
     *      "selection" a feature except for the "list" porupType that is
     *      an array of pairs "layer" and "features", "popupClass" popupClass
     *      that will be used to display the popup.
     *  popupdisplayed - Triggered after a popup is displayed. Receives an event
     *      with; "popupType" see <Constructor>, "selection" a feature except
     *      for the "list" porupType that is an array of pairs "layer" and
     *      "features", "div" the DOMElement used by the popup and "popup" the
     *      instance of the popup class that has shown the popup.
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

    /** APIProperty: control
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
     * APIProperty: unselectOnClose
     * {Boolean} If true, closing a popup all features are unselected on
     *     control.controls.select.
     */
    unselectOnClose: false,

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
    relatedToClear: [],

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
     * control - {<OpenLayers.Control.FeaturePopups>} The control that
     *     initialized this popup manager.
     * popupType - {String} Type of popup manager: "list", "single", "listItem"
     *     or "hover"
     * options - {Object}
     *
     * Valid ptions:
     * eventListeners - {Object} Listeners to register at object creation.
     * minSize - {<OpenLayers.Size>} Minimum size allowed for the popup's contents.
     * maxSize - {<OpenLayers.Size>} Maximum size allowed for the popup's contents.
     * popupClass - {String|<OpenLayers.Popup>|Function} Type of popup to
     *     manage: string for a "id" of a DOMElement, OpenLayers.Popup and a
     *     function for a custom popup.
     * anchor -{Object} Object to which we'll anchor the popup. Must expose a
     *     'size' (<OpenLayers.Size>) and 'offset' (<OpenLayers.Pixel>).
     * followCursor - {Boolean} If true, the popup will follow the cursor
     *     (useful for hover)
     * unselectOnClose - {Boolean} If true, closing a popup all features are
     *     unselected on control.controls.select.
     * closeBox - {Boolean} To display a close box inside the popup.
     * observeItems - {Boolean} If true, will be activated observers of the
     *     DOMElement of the popup to trigger some events (mostly by list popups).
     * relatedToClear - Array({String}) Related <FeaturePopups.popupObjs> codes
     *     from <control> to clear.
     * panMapIfOutOfView -{Boolean} When drawn, pan map such that the entire
     *     popup is visible in the current viewport (if necessary), default is true.
     */
    initialize: function(control, popupType, options) {
        // Options
        OpenLayers.Util.extend(this, options);

        if (this.maxSize) {
            this.maxSize.w = isNaN(this.maxSize.w) ? 999999 : this.maxSize.w;
            this.maxSize.h = isNaN(this.maxSize.h) ? 999999 : this.maxSize.h;
        }
        if (this.minSize) {
            this.minSize.w = isNaN(this.minSize.w) ? 0 : this.minSize.w;
            this.minSize.h = isNaN(this.minSize.h) ? 0 : this.minSize.h;
        }

        // Arguments
        this.control = control;
        this.type = popupType;

        // close box
        if (this.closeBox) {
            this.onCloseBoxMethod = OpenLayers.Function.bind(
                function(evt) {
                    if (this.unselectOnClose && control.controls.select) {
                        control.controls.select.unselectAll();
                    }
                    this.clear();
                    OpenLayers.Event.stop(evt);
                    this.events.triggerEvent('closedbybox', {popupType: this.type});
                },
                this
            );
        }

        // Options
        var popupClass = this.popupClass;
        if (popupClass) {
            if (typeof popupClass == 'string') {
                this.popupType = 'div';
            } else if (popupClass.prototype.CLASS_NAME &&
                       OpenLayers.String.startsWith(
                            popupClass.prototype.CLASS_NAME, 'OpenLayers.Popup')) {
                this.popupType = 'OL';
                var self = this; // To do tricks
                this.popupClass = OpenLayers.Class(popupClass, {
                    autoSize: true,
                    minSize: this.minSize,
                    maxSize: this.maxSize,
                    panMapIfOutOfView: this.panMapIfOutOfView,
                    panIntoView: function() {
                        self.panMapIfOutOfView &&
                            OpenLayers.Popup.prototype.panIntoView.call(this);
                    },
                    contentDisplayClass:
                        popupClass.prototype.contentDisplayClass + ' ' +
                        control.displayClass + '_' + this.type
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
     * selection - {<OpenLayers.Feature.Vector>}|Object} Selected features.
     * lonlat - {<OpenLayers.LonLat>}  The position on the map the popup will
     *     be shown.
     * html - {String} An HTML string to display inside the popup.
     * panMap - {Boolean} If <panMapIfOutOfView> is true then pan map such that
     *     the entire popup is visible, defaul is true.
     */
    showPopup: function(selection, lonLat, html, panMap) {
        this.clear();
        var popupClass = this.popupClass;
        if (popupClass && html) {
            var cont = this.events.triggerEvent('beforepopupdisplayed', {
                popupType: this.type,
                selection: selection,
                popupClass: popupClass
            });
            if (cont !== false) {
                // this alters "this.popup"
                this.create(lonLat, html, panMap);
            }
        }
        if (this.popup) {
            this.observeItems && this.observeShowPopup(this.div);
            this.events.triggerEvent('popupdisplayed', {
                popupType: this.type,
                selection: selection,
                div: this.div,
                popup: this.popup
            });
        }
    },

    /**
     * Method: clear
     * Internal use only.
     */
    clear: function() {
        this.clearPopup();
        var popupObjs = this.control.popupObjs,
            related;
        for (var i = 0, len = this.relatedToClear.length; i < len; i++) {
            related = popupObjs[this.relatedToClear[i]];
            related && related.clearPopup();
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
                    OpenLayers.Function.bindAsEventListener(this.showListItem, this.control));
                OpenLayers.Event.observe(child, 'click',
                    OpenLayers.Function.bindAsEventListener(this.showListItem, this.control));
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
            if (ids.length >= 3) {
                this.showSingleFeatureById(ids[1], ids[3], ids[2]);
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
            control = this.control;
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
     * {Boolean} nternal use to optimize performance, true if <eventListeners>
     *     contains a "featureschanged" event.
     */
    listenFeatures: false,

    /**
     * APIProperty: templates
     * {Object} Set of templates, see <FeaturePopups.AddLayer>
     */
    templates: null,

     /**
     * Property: safeSelection
     * {Boolean} Internal use to optimize performance, true if
     *     <FeaturePopups.mode> contains
     *     <OpenLayers.Control.FeaturePopups.SAFE_SELECTION>.
     */
    safeSelection: false,

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
     * {Object} Used to store calculations associated with the current selection.
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
     *     featuresof the layer regardless of the order or clustering of these,
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
    regExpShow: /\$\{showPopup\((|id|fid)\)(\w*)\}/g,

    /**
     * Property: regExpAttributes
     * {RegEx} Used to omit the name "attributes" as ${.myPropertyName} instead
     *     of ${attributes.myPropertyName} to show data on a popup using templates.
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

        // Templates
        var oTemplates = options && options.templates || {};
        var templates = {};
        for (var templateName in oTemplates) {
            templates[templateName] =
                                 this.prepareTemplate(oTemplates[templateName]);
        }
        this.templates = templates;
        this.eventListeners = options.eventListeners,

        // Events
        this.events = new OpenLayers.Events(this, null, this.EVENT_TYPES);
        if (this.eventListeners) {
            this.events.on(this.eventListeners);
            this.listenFeatures = !!(this.eventListeners &&
                                       this.eventListeners['featureschanged']);
        }

        // Layer listeners
        // ---------------
        this.safeSelection = !!(control.mode &
                               OpenLayers.Control.FeaturePopups.SAFE_SELECTION);
        this.layerListeners = {
            scope: this,
            'featureselected': this.onFeatureselected
        };
        if (control.mode & OpenLayers.Control.FeaturePopups.CLOSE_ON_UNSELECT ||
                                                           this.safeSelection) {
            this.layerListeners['featureunselected'] = this.onFeatureunselected;
        }
        if (this.safeSelection) {
            this.layerListeners['beforefeaturesremoved'] = this.onBeforefeaturesremoved;
            this.layerListeners['featuresadded'] = this.onFeaturesadded;
        } else if (control.mode & OpenLayers.Control.FeaturePopups.CLOSE_ON_REMOVE) {
            this.layerListeners['featuresremoved'] = this.onFeaturesremoved;
        }
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
            var subId = 0,
                layerId = this.layer.id;
            template = template.replace(
                this.regExpShow,
                function(a, idName) {
                    subId++;
                    idName = idName || 'id';
                    return 'id="showPopup-' + layerId + '-' + 
                                   idName + '-${' + idName + '}-' + subId + '"';
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
     * Method: destroy
     */
    destroy: function() {
        this.deactivate();
        this.eventListeners && this.events.un(this.eventListeners);
        this.events.destroy();
    },

    /**
     * Method: activate
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
     * Method: deactivate
     */
    deactivate: function() {
        if (this.active) {
            this.layer.events.un(this.layerListeners);
            this.active = false;
            return true;
        } else {
            return false;
        }
    },

    /**
     * Method: clear
     */
    clear: function() {
        if (this.active) {
            if (this.selectionHash !== '') {
                this.events.triggerEvent('selectionchanged', {
                    layer: this.layer,
                    control: this.control,
                    selection: []
                });
            }
            if (this.featuresHash !== '') {
                this.events.triggerEvent('featureschanged', {
                    layer: this.layer,
                    control: this.control,
                    features: []
                });
            }
        }
        this.selection = {};
        this.selectionObject = {};
        this.selectionHash = '';
        this.staticSelectionHash = '';
        this.featuresHash = '';
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
            template = templates.hover;
        if (template) {
            var lonLat = control.getLocationFromSelPixel(control.controls.hover,
                                                                       feature);
            if (feature.cluster) {
                if (feature.cluster.length == 1) {
                    // show cluster as a single feature.
                    popupObjHover.showPopup(feature, lonLat,
                            this.renderTemplate(template, feature.cluster[0]));
                } else {
                    var html = '',
                        popupObjHoverList = control.popupObjs.hoverList;
                    if (popupObjHoverList) {
                        var cFeatures = feature.cluster,
                            itemTemplate = templates.hoverItem;
                        if (itemTemplate) {
                            var htmlAux = [];
                            for (var i = 0 , len = cFeatures.length; i < len; i++) {
                                htmlAux.push(this.renderTemplate(itemTemplate,
                                                                cFeatures[i]));
                            }
                            html = htmlAux.join('\n');
                        }
                        popupObjHoverList.showPopup(cFeatures, lonLat,
                            this.renderTemplate(templates.hoverList, {
                                layer: feature.layer,
                                count: cFeatures.length,
                                html: html
                            })
                        );
                    }
                }
            } else {
                popupObjHover.showPopup(feature, lonLat,
                                        this.renderTemplate(template, feature));
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
        var savedSF = this.selection,
            fid = feature.fid;
        if (fid) {
            savedSF[fid] = true;
        } else if (feature.cluster) {
            for (var i = 0 , len = feature.cluster.length; i < len; i++) {
                var cFeature = feature.cluster[i];
                var fidfid = cFeature.fid;
                if (fidfid) {
                    savedSF[fidfid] = true;
                } else {
                    savedSF[cFeature.id] = true;
                }
            }
        } else {
            savedSF[feature.id] = true;
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
                    var fid = feature.fid;
                    if (fid) {
                        delete savedSF[fid];
                    } else if (feature.cluster) {
                        for (var i = 0 , len = feature.cluster.length; i < len; i++) {
                            var cFeature = feature.cluster[i];
                            var fidfid = cFeature.fid;
                            if (fidfid) {
                                delete savedSF[fidfid];
                            } else {
                                delete savedSF[cFeature.id];
                            }
                        }
                    } else {
                        delete savedSF[feature.id];
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
     *    conbtains <OpenLayers.Control.FeaturePopups..SAFE_SELECTION>.
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
            control.selectingSet = true;
            this.updatingSelection = true;
            for (var i = 0 , len = features.length; i < len; i++) {
                var feature = features[i];
                if (feature.fid && savedSF[feature.fid]) {
                    selectCtl.select(feature);
                } else if (feature.cluster) {
                    for (var ii = 0 , lenlen = feature.cluster.length; ii < lenlen; ii++) {
                        var cFeature = feature.cluster[ii];
                        if (cFeature.fid) {
                            if (savedSF[cFeature.fid]) {
                                selectCtl.select(feature);
                                break;
                            }
                        } else if (savedSF[cFeature.id]) {
                            selectCtl.select(feature);
                            break;
                        }
                    }
                } else if (savedSF[feature.id]) {
                    selectCtl.select(feature);
                }
            }
            control.selectingSet = false;
            this.updatingSelection = false;
        }
        this.refreshFeatures();
        control.refreshLayers();
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
                var feature,
                    ids = [];
                for (var i = 0, len = layerFeatures.length; i < len; ++i) {
                    feature = layerFeatures[i];
                    if (feature.fid) {
                        ids.push(feature.fid);
                    } else {
                        ids.push(feature.id);
                    }
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
                layerSelection = this.layer.selectedFeatures;
            if (this.safeSelection) {
                var savedSF = this.selection;
                for (i = 0, len = layerSelection.length; i < len; ++i) {
                    feature = layerSelection[i];
                    if (feature.cluster) {
                        // Not all features on layerSelection may be selected on a cluster
                        var clusterFeatures = feature.cluster;
                        for (var ii = 0 , llen = clusterFeatures.length; ii < llen; ii++) {
                            var cFeature = clusterFeatures[ii];
                            if (cFeature.fid) {
                                if (savedSF[cFeature.fid]) {
                                    features.push(cFeature);
                                }
                            } else if (savedSF[cFeature.id]) {
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
                layerTemplate && htmlAux.push(this.renderTemplate(itemTemplate, feature));
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
                        }
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
            var lonLat;
            if (feature.geometry.getVertices().length > 1) {
                lonLat = this.control.getLocationFromSelPixel(this.controls.select,
                                                                      feature);
            } else {
                lonLat = feature.geometry.getBounds().getCenterLonLat();
            }
            html = this.renderTemplate(sTemplate, feature);
            hasTemplate = true;
        }
        return {hasTemplate: hasTemplate, html: html, lonLat: lonLat};
    },

    /**
     * APIMethod: addSelectionByIds
     *
     * Parameters:
     * featureIds - {Array(String)} List of feature ids to be
     *     added to selection.
     * silent - {Boolean} Supress "selectionchanged" event triggering.  Default is false.
     */
    addSelectionByIds: function(featureIds, silent) {
        if (featureIds.length > 0) {
            var i, len,
                savedSF = this.selection;
            for (i = 0, len = featureIds.length; i < len; i++) {
                savedSF[featureIds[i]] = true;
            }
            this.applySelection(silent);
        }
    },

    /**
     * APIMethod: setSelectionByIds
     *
     * Parameters:
     * featureIds - {Array(String)} List of feature ids to set as select.
     * silent - {Boolean} Supress "selectionchanged" event triggering.  Default is false.
     */
    setSelectionByIds: function(featureIds, silent) {
        var i, len,
            savedSF = {};
        for (i = 0, len = featureIds.length; i < len; i++) {
            savedSF[featureIds[i]] = true;
        }
        this.selection = savedSF;
        this.applySelection(silent);
    },

    /**
     * Method: applySelection
     */
    applySelection: function(silent) {
        var i, len,
            savedSF = this.selection,
            control = this.control,
            selectCtl = control.controls.select,
            _indexOf = OpenLayers.Util.indexOf,
            layer = this.layer,
            features = layer.features;
        control.selectingSet = true;
        this.updatingSelection = true;
        for (var i = 0 , len = features.length; i < len; i++) {
            var feature = features[i],
                selected = false;
            if (feature.fid && savedSF[feature.fid]) {
                selected = true;
            } else if (feature.cluster) {
                for (var ii = 0 , lenlen = feature.cluster.length; ii < lenlen; ii++) {
                    var cFeature = feature.cluster[ii];
                    if (cFeature.fid) {
                        if (savedSF[cFeature.fid]) {
                            selected = true;
                            break;
                        }
                    } else if (savedSF[cFeature.id]) {
                        selected = true;
                        break;
                    }
                }
            } else if (savedSF[feature.id]) {
                selected = true;
            }
            if (selected) {
                if (_indexOf(layer.selectedFeatures, feature) == -1) {
                    selectCtl.select(feature);
                }
            } else if (_indexOf(layer.selectedFeatures, feature) > -1) {
                selectCtl.unselect(feature);
            }
        }
        control.selectingSet = false;
        this.updatingSelection = false;

        this.silentSelection = !!silent;
        this.refreshSelection();
        this.silentSelection = false;

        control.refreshLayers();
    },

    /**
     * APIMethod: removeSelectionByIds
     *
     * Parameters:
     * featureIds - {Array(String)} List of feature ids to be
     *     removed to selection.
     * silent - {Boolean} Supress "selectionchanged" event triggering.  Default is false.
     */
    removeSelectionByIds: function(featureIds, silent) {
        if (featureIds.length > 0) {
            var i, len,
                savedSF = this.selection;
            for (i = 0, len = featureIds.length; i < len; i++) {
                var featureId = featureIds[i];
                if (savedSF[featureId]) {
                    delete savedSF[featureId];
                }
            }
            this.applyDeselection(silent);
        }
     },

    /**
     * Method: applyDeselection
     */
    applyDeselection: function(silent) {
        var i, len,
            savedSF = this.selection,
            control = this.control,
            selectCtl = control.controls.select,
            _indexOf = OpenLayers.Util.indexOf,
            layer = this.layer,
            features = layer.selectedFeatures;
        control.selectingSet = true;
        this.updatingSelection = true;
        for (var i = features.length - 1; i >= 0; i--) {
            var feature = features[i],
                selected = false;
            if (feature.fid && savedSF[feature.fid]) {
                selected = true;
            } else if (feature.cluster) {
                for (var ii = 0 , lenlen = feature.cluster.length; ii < lenlen; ii++) {
                    var cFeature = feature.cluster[ii];
                    if (cFeature.fid) {
                        if (savedSF[cFeature.fid]) {
                            selected = true;
                            break;
                        }
                    } else if (savedSF[cFeature.id]) {
                        selected = true;
                        break;
                    }
                }
            } else if (savedSF[feature.id]) {
                selected = true;
            }
            if (!selected) {
                selectCtl.unselect(feature);
            }
        }
        control.selectingSet = false;
        this.updatingSelection = false;

        this.silentSelection = !!silent;
        this.refreshSelection();
        this.silentSelection = false;

        control.refreshLayers();
    },

    /**
     * APIMethod: showSingleFeatureById
     *
     * Parameters:
     * featureId - {String} id of the feature.
     * idName - {String} Name of id: "id" or "fid".
     */
    showSingleFeatureById: function(featureId, idName) {
        var popupObj = this.control.popupObjs.listItem;
        if (!popupObj) { return; }

        idName = idName || 'id';
        var clearPopup = true;
        if (featureId) {
            var i, len, feature,
                layer = this.layer,
                features = layer.features;
            for (i = 0, len = features.length; i < len; i++) {
                feature = features[i];
                if (feature.cluster) {
                    var ii, len2, cFeature;
                    cFeature = feature;
                    for (ii = 0, len2 = cFeature.cluster.length; ii < len2; ii++) {
                        feature = cFeature.cluster[ii];
                        if (feature[idName] == featureId) {
                            break;
                        }
                    }
                }
                // Don't try to show a cluster as a single feature,
                //      templates.single does not support it.
                if (feature[idName] == featureId && !feature.cluster) {
                    popupObj.clear();
                    var template = this.templates.single;
                    if (template) {
                        var html = this.renderTemplate(template, feature);
                        popupObj.showPopup(
                            feature,
                            feature.geometry.getBounds().getCenterLonLat(),
                            html
                        );
                    }
                    clearPopup = false;
                    break;
                }
            }
        }
        if (clearPopup) {
            popupObj.clear();
        }
    },

    /**
     * APIFunction: getSelectionIds
     */
    getSelectionIds: function() {
        var ids = [];
        if (this.layer.getVisibility()) {
            if (this.safeSelection) {
                var id,
                    savedSF = this.selection;
                for (id in savedSF) {
                    ids.push(id);
                }
            } else {
                var i, len,
                    features = this.layer.selectedFeatures;
                for (i = 0, len = features.length; i < len; ++i) {
                    ids.push(features[i].id);
                }
            }
        }
        return ids;
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
     *     by the value of context["token"]. When is a function it will receive
     *     the context as a argument.
     * context - {Object} Object with properties corresponding to the tokens
     *     in the template.
     *
     * Returns:
     * {String} A string with tokens replaced from the context object.
     */
    renderTemplate: function(template, context) {
        if (typeof template == 'string') {
            return OpenLayers.String.format(template, context);
        } else if (typeof template == 'function') {
            return template(context);
        } else {
            return '';
        }
    },

    CLASS_NAME: 'OpenLayers.Control.FeaturePopups.Layer'
});
