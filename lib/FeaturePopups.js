/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

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
     * APIProperty: events
     * {<OpenLayers.Events>} Events instance for listeners and triggering
     *     specific events.
     *
     * Register a listener for a particular event with the following syntax:
     * (code)
     * control.events.register(type, obj, listener);
     * (end)
     *
     * Supported event types (in addition to those from <OpenLayers.Control.events>):
     *  selectionchanged - Triggered after selection is changed (occurs after 
     *      "popupdisplayed", and even no if no popup displayed).
     */
    
    /**
     * APIProperty: mode
     * To enable or disable the various behaviors of the control.
     *
     * Use bitwise operators and one or more of OpenLayers.Control.FeaturePopups:
     *  NONE - To not activate any particular behavior.
     *  CLOSE_ON_REMOVE -Popups will close when removing features in a layer.
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
     * {Object} Options used to create the pop-controller for to highlight on 
     *     to hover.
     *
     * Default options:
     * popupClass - <OpenLayers.Popup.Anchored>
     * followCursor - true
     * anchor - {size: new OpenLayers.Size(15, 19), offset: new OpenLayers.Pixel(-1, -1)}
     */
    popupHoverOptions: null,
    
    /**
     * APIProperty: popupSelectOptions
     * {Object} Options used to create the pop-controller for single selections.
     *
     * Default options:
     * popupClass - <OpenLayers.Popup.FramedCloud>
     *
     * Default options for internal use:
     * unselectOnClose - Depends on the <mode>
     * closeBox - Depends on the <mode>
     * observeItems - true
     * related: ["list"],
     * relatedToClear: ["hover", "list", "listItem"]
     */
    popupSelectOptions: null,
    
    /**
     * APIProperty: popupListOptions
     * {Object} Options used to create the pop-controller for multiple selections.
     *
     * Default options:
     * popupClass - <OpenLayers.Popup.FramedCloud>
     *
     * Default options for internal use:
     * unselectOnClose - Depends on the <mode>
     * closeBox - Depends on the <mode>
     * observeItems - true
     * related - ["select"]
     * relatedToClear - ["hover", "select", "listItem"]
     */
    popupListOptions: null,
    
    /**
     * APIProperty: popupListItemOptions
     * APIProperty: popupListOptions
     * {Object} Options used to create the pop-controller for show a single item 
     *     into a multiple selection.
     *
     * Default options:
     * popupClass -  <OpenLayers.Popup.FramedCloud>
     *
     * Default options for internal use:
     * closeBox - Depends on the <mode>
     */
    popupListItemOptions: null,
    
    /**
     * APIProperty: layerListTemplate
     * Default is "<h2>${layer.name} - ${count}</h2><ul>${html}</ul>"
     */
    layerListTemplate: "<h2>${layer.name} - ${count}</h2><ul>${html}</ul>",

    /**
     * APIProperty: hoverClusterTemplate
     * Default is "Cluster with ${cluster.length} features<br>on layer \"${layer.name}\"
     */
    hoverClusterTemplate: "${i18n('Cluster with ${cluster.length} features<br>on layer \"${layer.name}\"')}",
    
    /**
     * Property: regExesI18n
     * {RegEx} Used to internationalize templates.
     */
    regExesI18n: /\$\{i18n\(["']?([\s\S]+?)["']?\)\}/g,
    
    /**
     * Property: regExesShow
     * {RegEx} Used to activate events in the html elements to show individual 
     *     popup.
     */
    regExesShow: /\$\{showPopup\((|id|fid)\)(\w*)\}/g,
         
    /**
     * Property: regExesAttributes
     * {RegEx} Used to omit the name "attributes" as ${.myPropertyName} instead 
     *     of ${attributes.myPropertyName} to show data on a popup using templates.
     */
    regExesAttributes: /\$\{\./g,
    
    /**
     * Property: selectingSet
     * {Boolean} The control set to true this property while being selected a 
     *     set of features to can ignore individual selection, internal use only.
     */
    selectingSet: false,
    
    /**
     * Property: refreshSelection
     * {Boolean} The control set to true this property while being refreshed 
     *     selection on a set of features to can ignore others acctions, 
     *     internal use only.
     */
    refreshSelection: false,

    /**
     * Property: hoverListeners
     * {Object} hoverListeners object will be registered with 
     *     <OpenLayers.Events.on> on hover control, internal use only.
     */
    hoverListeners: null,
    
    /**
     * Property: layerListeners
     * {Object} layerListeners object will be registered with 
     *     <OpenLayers.Events.on>, internal use only.
     */
    layerListeners: null,
    
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
     * Property: selectionStorage
     * {Object} To store the current selection, internal use only.
     */
    selectionStorage: null,
    
    /**
     * Property: safeSelection
     * {Boolean} True if <mode> contains  
     *                  OpenLayers.Control.FeaturePopups.SAFE_SELECTION.
     */
    safeSelection: false,
    
    /**
     * Property: refreshDelay
     * {Number} Number of accepted milliseconds of waiting between removing and 
     *     re-add features (useful when using strategies such as BBOX), after 
     *     this time has expired is forced a popup refresh.
     */
    refreshDelay: 300,
    
    /**
     * Property: delayedRefresh
     * {Number} Timeout id of forced a refresh.
     */
    delayedRefresh: null,
    
    /**
     * Property: delayedRefreshLayers
     * {Object} To store the current layers to refresh.
     */
    delayedRefreshLayers: null,
    
    /**
     * Constructor: OpenLayers.Control.FeaturePopups
     * Create a new control that internally uses two 
     *     <OpenLayers.Control.SelectFeature> one for selecting features, and 
     *     another only to highlight them by hover (see <selectOptions>, 
     *     and <hoverOptions>). This control can use also a 
     *     <OpenLayers.Handler.Box> to select features by a box, see 
     *     <boxSelectionOptions> .
     *
     * The control can generates three types of popup: "hover", "select" and 
     *     "list", see <addLayer>. 
     * Each popup has a displayClass according to their type: 
     *     "[displayClass]_hover" ,"[displayClass]_select" and 
     *     "[displayClass]_list" respectively.
     * 
     * options - {Object} 
     */
    initialize: function (options) {
        // Options
        // -------
        options = OpenLayers.Util.applyDefaults(options, {
            mode: OpenLayers.Control.FeaturePopups.DEFAULT
        });
        OpenLayers.Control.prototype.initialize.call(this, options);
        this.safeSelection = !!(this.mode & 
                               OpenLayers.Control.FeaturePopups.SAFE_SELECTION);
        
        // Controls
        // --------
        this.controls = {};
        var control,
            self = this; // to do some tricks.
        
        // Hover control
        if (options.hoverOptions !== null && !(this.selectOptions && this.selectOptions.hover)) {
            var hoverOptions = OpenLayers.Util.extend(this.hoverOptions, {
                hover: true,
                highlightOnly: true,
                box: false
            });
            var hoverClass = OpenLayers.Class(OpenLayers.Control.SelectFeature, {
                // Trick to close hover popup when the feature is selected.
                outFeature: function (feature) {
                    if (feature._lastHighlighter === this.id) {
                        if (feature._prevHighlighter &&
                                    feature._prevHighlighter !== this.id) {
                            self.popupObjs.hover.clear();
                        }
                    }
                    OpenLayers.Control.SelectFeature.prototype.outFeature.apply(
                                                  this, arguments);
                }
            });
            control = new hoverClass([], hoverOptions);
            this.hoverListeners = {
                scope: this,
                featurehighlighted: this.onFeaturehighlighted,
                featureunhighlighted: this.onFeatureunhighlighted
            };
            control.events.on(this.hoverListeners);
            this.controls.hover = control;
        }
        
        // Select control
        if (options.selectOptions !== null) {
            var selOptions = OpenLayers.Util.applyDefaults(this.selectOptions, {
                clickout: false,
                multipleKey: 'shiftKey',
                toggleKey: 'shiftKey'
            });
            OpenLayers.Util.extend(selOptions, {box: false, highlightOnly: false});
            control = new OpenLayers.Control.SelectFeature([], selOptions);
            if (this.boxSelectionOptions) {
                // Handler for the trick to manage selection box.
                this.handlerBox = new OpenLayers.Handler.Box(
                    this, {
                        done: this.onSelectBox
                    }, 
                    OpenLayers.Util.applyDefaults(this.boxSelectionOptions, {
                        boxDivClassName: "olHandlerBoxSelectFeature", 
                        keyMask: OpenLayers.Handler.MOD_CTRL
                    })
                ); 
            }
            // Trick to refresh popups when click a feature of a multiple selection.
            control.unselectAll = function (options) {
                var safeSelection = self.safeSelection;
                if (safeSelection) {
                    self.selectionStorage = {};
                }
                OpenLayers.Control.SelectFeature.prototype.unselectAll.apply(
                                          this, arguments);
                if (options && options.except) {
                    if (safeSelection) {
                        self.storeAsSelected(options.except);
                    }
                    self.showAllSelectedFeatures();
                }
            };
            this.controls.select = control;
        }
        
        // Popup Object Managers
        // ---------------------
        var _closeBox = (this.mode & OpenLayers.Control.FeaturePopups.CLOSE_BOX),
            _unselectOnClose = (this.mode & OpenLayers.Control.FeaturePopups.UNSELECT_ON_CLOSE);
        var popupObjs = {};
        if (options.popupListOptions !== null) {
            popupObjs.list = new OpenLayers.Control.FeaturePopups.Popup(
                this, "list",
                OpenLayers.Util.applyDefaults(options.popupListOptions, {
                    popupClass: OpenLayers.Popup.FramedCloud,
                    // options for internal use
                    closeBox: _closeBox,
                    unselectOnClose: _unselectOnClose,
                    observeItems: true,
                    related: ["select"],
                    relatedToClear: ["hover", "select", "listItem"]
                })
            );
        }
        if (options.popupSelectOptions !== null) {
            popupObjs.select = new OpenLayers.Control.FeaturePopups.Popup(
                this, "select",
                OpenLayers.Util.applyDefaults(options.popupSelectOptions, {
                    popupClass: OpenLayers.Popup.FramedCloud,
                    // options for internal use
                    closeBox: _closeBox,
                    unselectOnClose: _unselectOnClose,
                    related: ["list"],
                    relatedToClear: ["hover", "list", "listItem"]
                })
            );
        }
        if (options.popupListItemOptions !== null) {
            popupObjs.listItem = new OpenLayers.Control.FeaturePopups.Popup(
                this, "listItem", 
                OpenLayers.Util.applyDefaults(options.popupListItemOptions, {
                    popupClass: OpenLayers.Popup.FramedCloud,
                    // options for internal use
                    closeBox: _closeBox
                })
            );
        }
        if (options.popupHoverOptions !== null) {
            popupObjs.hover = new OpenLayers.Control.FeaturePopups.Popup(
                this, "hover",
                OpenLayers.Util.applyDefaults(options.popupHoverOptions, {
                    popupClass: OpenLayers.Popup.Anchored,
                    followCursor: true,
                    anchor: {
                        size: new OpenLayers.Size(15, 19),
                        offset: new OpenLayers.Pixel(-1, -1)
                    }
                })
            );
        }
        this.popupObjs = popupObjs;
        
        // Templates
        // ---------
        this.hoverClusterTemplate = this.prepareTemplate(
                                               this.hoverClusterTemplate);

        // Listeners
        // ---------
        this.layerListeners = {
            scope: this,
            "visibilitychanged": this.showAllSelectedFeatures,
            "featureselected": this.onFeatureselected
        };
        if (this.mode & OpenLayers.Control.FeaturePopups.CLOSE_ON_UNSELECT || 
                                                           this.safeSelection) {
            this.layerListeners["featureunselected"] = this.onFeatureunselected;
        }
        if (this.safeSelection) {
            this.layerListeners["beforefeaturesremoved"] = this.onBeforefeaturesremoved;
            this.layerListeners["featuresadded"] = this.onFeaturesadded;
        } else if (this.mode & OpenLayers.Control.FeaturePopups.CLOSE_ON_REMOVE) {
            this.layerListeners["featuresremoved"] = this.onFeaturesremoved;
        }
        
        // Internal Objects
        // ----------------
        this.layerObjs = {};
        this.selectionStorage = {};
        this.delayedRefreshLayers = {};
        this.layers = [];
    },

    /**
     * APIMethod: destroy
     */
    destroy: function () {
        this.deactivate();
        this.layerListeners = null;
        for (var popupType in this.popupObjs) {
            this.popupObjs[popupType].destroy();
        }
        this.popupObjs = null;
        
        for (var layerId in this.layerObjs) {
            this.layerObjs[layerId].events.destroy();
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
    activate: function () {
        if (!this.events) { // This should be in OpenLayers.Control: Can not activate a destroyed control.
            return false;
        }
        var i, len, layer;
        if (!this.active && this.events) { // Add the layers before activating improves performance.
            for (i = 0, len = this.map.layers.length; i < len; i++) {
                layer = this.map.layers[i];
                var options = this.getLayerOptions(layer);
                options && this.addLayerToControl(layer, options);
            }
        }
        if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
            this.map.events.on({
                scope: this,
                "addlayer": this.onAddLayer,
                "removelayer": this.onRemoveLayer
            });
            for (i = 0, len = this.layers.length; i < len; i++) {
                layer = this.layers[i];
                layer.map && layer.events.on(this.layerListeners);
            }
            var controls = this.controls;
            if (controls.hover) {
                controls.hover.setLayer(this.layers);
                controls.hover.activate();
            }
            this.handlerBox && this.handlerBox.activate();
            if (controls.select) {
                controls.select.setLayer(this.layers);
                controls.select.activate();
            }
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
    deactivate: function () {
        if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
            this.map.events.un({
                scope: this,
                "addlayer": this.onAddLayer,
                "removelayer": this.onRemoveLayer
            });
            for (var i = 0, len = this.layers.length; i < len; i++) {
                this.layers[i].events.un(this.layerListeners);
            }
            var controls = this.controls;
            controls.hover && controls.hover.deactivate();
            this.handlerBox && this.handlerBox.deactivate();
            controls.select && controls.select.deactivate();
            for (var popupType in this.popupObjs) {
                this.popupObjs[popupType].clear();
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
     * Method: onAddLayer
     * Internal use only.
     */
    onAddLayer: function (evt) {
        var layer = evt.layer;
        if (this.layerObjs[layer.id]) {
            // Set layers in the control when added to the map after activating this control.
            this.listenLayer(layer);
        } else {
            var options = this.getLayerOptions(layer);
            options && this.addLayerToControl(layer, options);
        }
    },
        
    /**
     * Method: onRemoveLayer
     * Internal use only.
     */
    onRemoveLayer: function (evt) {
        this.removeLayer(evt.layer);
    },
    
    /**
     * APIMethod: addLayer
     * Add the layer to control and assigns it the templates, see options. 
     * Layers are automatically assigned if they have the properties for any of 
     *     the three types of templates: "hoverPopupTemplate", 
     *     "selectPopupTemplate" and "itemPopupTemplate".
     * In a layer can also specify a "listPopupTemplate" (default is 
     *     <layerListTemplate>), this template is ignored if not 
     *     specified in conjunction with "itemPopupTemplate".
     *
     * To add a layer that has already been added (maybe automatically),
     *     first must be removed using <removeLayer>.
     *
     * Templates containing patterns as ${i18n("key")} are internationalized 
     *     using <OpenLayers.i18n> function.
     *
     * The control uses the patterns as ${showPopup()} in "itemPopupTemplate" 
     *     to show individual popups from a list. This pattern becomes a 
     *     combination of the layer.id+feature.id and can be used only as an 
     *     html attribute.
     * It is convenient to use ${showPopup(fid)} instead of ${showPopup()} 
     *     when the layer features have fid, this ensures that the popups from 
     *     a list is still shown after zoom, even if a BBOX strategies is used.
     * When various html elements (in the same "itemPopupTemplate") uses 
     *     ${showPopup()} should differentiate by a suffix in order to avoid 
     *     duplicate id, eg:
     * (code)
     * itemPopupTemplate: '<span ${showPopup()1} >...</span><br>' +
     *                    '<img  ${showPopup()2} src="...">', ...
     * (code)
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} 
     * options - {Object} Optional
     *
     * Valid options:
     * hoverTemplate - {String || Function} template used on hover a feature.
     * selectTemplate - {String || Function} template used on select a feature.
     * itemTemplate - {String || Function} template used to show a feature as 
     *     a item in a list.
     * listTemplate - {String || Function} template used to show selected 
     *     features as a list (each feature is shown using "itemTemplate"), 
     *     defaul is <layerListTemplate>.
     * eventListeners - {Object} This object will be registered with 
     *     <OpenLayers.Events.on> for the layer.
     *
     * If specified some template as layer property and as options has priority 
     *     the options template.
     */
    addLayer: function (layer, options) {
        this.addLayerToControl(layer, 
                             options || this.getLayerOptions(layer, options));
    },
    
    /**
     * APIMethod: addLayerToControl
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} 
     * options - {Object} 
     */
    addLayerToControl: function (layer, options) {
        var layerId = layer.id;
        if (!this.layerObjs[layerId]) {
            options = OpenLayers.Util.applyDefaults(options, {
                listTemplate: this.layerListTemplate 
            });
            var layerObjs = {
                hoverTemplate: this.prepareTemplate(options.hoverTemplate),
                selectTemplate: this.prepareTemplate(options.selectTemplate),
                itemTemplate: this.prepareTemplate(options.itemTemplate),
                listTemplate: this.prepareTemplate(options.listTemplate),
                events: new OpenLayers.Events(this),
                eventListeners: options.eventListeners,
                ids: ""
            };
            if (layerObjs.eventListeners instanceof Object) {
                layerObjs.events.on(layerObjs.eventListeners);
            }
            this.layerObjs[layerId] = layerObjs;
            this.layers.push(layer);
            if (this.active && layer.map) {
                this.listenLayer(layer);
            }
        }
    },
    
    /** 
     * Function: getLayerOptions
     */
    getLayerOptions: function (layer, options) {
        var result = null;
        if (layer instanceof OpenLayers.Layer.Vector) {
            options = OpenLayers.Util.applyDefaults(options, {
                    hoverTemplate: layer.hoverPopupTemplate,
                    selectTemplate: layer.selectPopupTemplate,
                    itemTemplate: layer.itemPopupTemplate,
                    listTemplate: layer.listPopupTemplate
            });
            if (options.hoverTemplate || options.selectTemplate || 
                options.itemTemplate  || options.listTemplate) {
                result = options;
            }
        }
        return result;
    },
    
    /**
     * Method: listenLayer
     */
    listenLayer: function (layer) {
        layer.events.on(this.layerListeners);
        var controls = this.controls;
        controls.hover && controls.hover.setLayer(this.layers);
        controls.select && controls.select.setLayer(this.layers);
    },
    
    /**
     * APIMethod: removeLayer
     */    
    removeLayer: function (layer) {
        var layerId = layer.id;
        if (this.layerObjs[layerId]) {
            this.layerObjs[layerId].events.destroy();
            delete this.layerObjs[layerId];
            OpenLayers.Util.removeItem(this.layers, layer);
            if (this.active) {
                this.showAllSelectedFeatures();
                this.controls.hover && this.controls.hover.setLayer(this.layers);
                this.controls.select && this.controls.select.setLayer(this.layers);
                layer.events.un(this.layerListeners);
            }
        }
    },
    
    /**
     * Method: onFeatureselected
     *
     * Parameters:
     * evt - {Object} 
     */
    onFeatureselected: function (evt) {
        if (!this.refreshSelection && this.safeSelection) {
            this.storeAsSelected(evt.feature);
        } 
        if (!this.selectingSet) {
            this.showAllSelectedFeatures();
        }
    },
    
    /**
     * Method: storeAsSelected
     *
     * Parameter:
     * feature - {OpenLayers.Feature.Vector} Feature to store as selected.
     */
    storeAsSelected: function (feature) {
        var layerId = feature.layer.id;
        if (!this.selectionStorage[layerId]) {
            this.selectionStorage[layerId] = {};
        }
        var savedSF = this.selectionStorage[layerId],
            fid = feature.fid;
        if (fid) {
            savedSF[fid] = true;
        } else if (feature.cluster) {
            for (var i = 0 , len = feature.cluster.length; i <len; i++) {
                var cFeature = feature.cluster[i];
                var fidfid = cFeature.fid;
                if (fidfid) {
                    savedSF[fidfid] = true;
                } else {
                    savedSF[cFeature.id] = true;
                }
            }
        }
    },
    
    /**
     * Method: onFeatureunselected
     * Called when the select feature control unselects a feature.
     *
     * Parameters:
     * evt - {Object} 
     */
    onFeatureunselected: function (evt) {
        if (this.safeSelection) {
            var savedSF = this.selectionStorage[evt.object.id],
                feature = evt.feature; 
            if (savedSF) { 
                var fid = feature.fid;
                if (fid) {
                    delete savedSF[fid];
                } else if (feature.cluster) {
                    for (var i = 0 , len = feature.cluster.length; i <len; i++) {
                        var cFeature = feature.cluster[i];
                        var fidfid = cFeature.fid;
                        if (fidfid) {
                            delete savedSF[fidfid];
                        } else {
                            delete savedSF[cFeature.id];
                        }
                    }
                }
            }
        }
        if (this.mode & OpenLayers.Control.FeaturePopups.CLOSE_ON_UNSELECT) {
            this.showAllSelectedFeatures();
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
    onBeforefeaturesremoved: function (evt) {
        var layer = evt.object;
        var layerId = layer.id;
        var features = evt.features;
        if (features.length) {
            var delayRefresh = false;
            delayRefresh = !this.isEmptyObject(this.selectionStorage[layerId]);
            if (delayRefresh) {
                this.delayedRefreshLayers[layerId] = true;
                if (this.delayedRefresh !== null) {
                    window.clearTimeout(this.delayedRefresh);
                }
                this.delayedRefresh = window.setTimeout(
                    OpenLayers.Function.bind(
                        function() {
                            this.delayedRefresh = null;
                            this.showAllSelectedFeatures();
                        }, 
                        this
                    ),
                    this.refreshDelay
                );
            }
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
    onFeaturesadded: function (evt) {
        var layer = evt.object;
        var layerId = layer.id;
        var features = evt.features;
        var savedSF = this.selectionStorage[layerId];
        if (savedSF) {
            var selectCtl = this.controls.select;
            this.selectingSet = true;
            this.refreshSelection = true;
            for (var i = 0 , len = features.length; i <len; i++) {
                var feature = features[i];
                if (feature.fid && savedSF[feature.fid]) {
                    if (OpenLayers.Util.indexOf(layer.selectedFeatures, feature) == -1) {
                        selectCtl.select(feature);
                    }
                } if (feature.cluster) {
                    for (var ii = 0 , lenlen = feature.cluster.length; ii <lenlen; ii++) {
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
                }
            }
            this.selectingSet = false;
            this.refreshSelection = false;
            delete this.delayedRefreshLayers[layerId];
            if (this.isEmptyObject(this.delayedRefreshLayers)) {
                this.showAllSelectedFeatures();
            }
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
    onFeaturesremoved: function (evt) {
        this.showAllSelectedFeatures();
    },
    
    /**
     * Method: isEmptyObject
     *
     * Parameters:
     * obj - {Object}
     */
    isEmptyObject: function (obj) {
        for(var prop in obj) {
            return false;
        }
        return true;
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
        this.showAllSelectedFeatures();
    },
    
    /**
     * Method: onFeaturehighlighted
     * Internal use only.
     */
    onFeaturehighlighted: function (evt) {
        var popupObjHover = this.popupObjs.hover;
        if (!popupObjHover) { return; }
        
        popupObjHover.clear(); 
        var feature = evt.feature;
        var template = this.layerObjs[feature.layer.id].hoverTemplate;
        if (template && this.popupHoverOptions) {
            var lonLat = this.getLocationFromSelPixel(this.controls.hover, 
                                                                       feature);
            if (feature.cluster) {
                var response = false;
                if (feature.cluster.length == 1){
                    // show cluster as a single feature.
                    popupObjHover.showPopup(feature, lonLat, 
                        this.renderTemplate(
                            template, 
                            this.cloneDummyFeature(
                                             feature.cluster[0], feature.layer)
                        )
                    );
                    response = !!popupObjHover.popup;
                } 
                if (feature.cluster.length >= 1 && response === false) {
                    popupObjHover.showPopup(feature, lonLat, 
                        this.renderTemplate(this.hoverClusterTemplate, feature)
                    );
                }
            } else {
                popupObjHover.showPopup(feature, lonLat, 
                                        this.renderTemplate(template, feature));
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
    getLocationFromSelPixel: function (selControl, feature) {
        var lonLat,
            handler = selControl.handlers.feature;
        var xy = (handler.feature === feature)? handler.evt.xy: null;
        return (xy? this.map.getLonLatFromPixel(xy):
                    feature.geometry.getBounds().getCenterLonLat()
               );
    },
    
    /**
     * Method: onFeatureunhighlighted
     */
    onFeatureunhighlighted: function (evt) {
        this.popupObjs.hover && this.popupObjs.hover.clear();
    },
    
    /**
     * function: cloneDummyFeature
     * Used on clustered features.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} the feature.
     * layer -   {<OpenLayers.Layer.Vector>}
     *
     * Returns:
     * {Object} Context of the feature including the layer.
     */
    cloneDummyFeature: function (feature, layer) {
        feature = OpenLayers.Util.extend({}, feature);
        feature.layer = layer;
        return feature;
    },

    /**
     * APIMethod: showSingleFeatureById
     *
     * Parameters:
     * layerId - {String} id of the layer of selected feature.
     * featureId - {String} id of the selected feature.
     * idName - {String} Name of id: "id" or "fid".
     */
    showSingleFeatureById: function (layerId, featureId, idName) {
        var popupObj = this.popupObjs.listItem;
        if (!popupObj) { return false; }

        idName = idName || "id";
        var i, len, layer,
            layers = this.layers;
        for (i=0, len=(layerId? layers.length: 0); i<len; i++) {
            layer = layers[i];
            if (layerId === layer.id) {
                var features = layer.features;
                var ii, len2, feature;
                for (ii=0, len2 = features.length; ii<len2; ii++) {
                    feature = features[ii];
                    if (feature.cluster) {
                        var iii, len3, cFeature;
                        cFeature = feature;
                        for (iii=0, len3 = cFeature.cluster.length; iii<len3; iii++) {
                            feature = cFeature.cluster[iii];
                            if (feature[idName] == featureId) {
                                feature = this.cloneDummyFeature(feature, layer);
                                break;
                            }
                        }
                    }
                    // Don't try to show a cluster as a single feature, 
                    //      selectTemplate does not support it.
                    if (feature[idName] == featureId && !feature.cluster) {
                        popupObj.clear();
                        var template = this.layerObjs[layerId].selectTemplate;
                        if (template) {
                            var html = this.renderTemplate(template, feature)
                            popupObj.showPopup( 
                                feature,
                                feature.geometry.getBounds().getCenterLonLat(), 
                                html
                            );
                        }
                        return true;
                    }
                }
                popupObj.clear();
                return false;
            }
        }
        popupObj.clear();
        return false;
    },
    
    /**
     * Method: showAllSelectedFeatures
     *
     * Returns:
     * {Integer} Number of selected features.
     */
    showAllSelectedFeatures: function () {
        if (this.delayedRefresh !== null) {
            window.clearTimeout(this.delayedRefresh);
            this.delayedRefresh = null;
        }
        var layers = this.layers,
            bounds = new OpenLayers.Bounds(),
            invalid = false,
            html = [],
            ids = [],
            allSelFeatures = [];
        var i, len, layer, sFeatures, r;
        for (i=0, len=layers.length; i<len; i++) {
            layer = layers[i];
            var layerObjs = this.layerObjs[layer.id]
            if (layer.visibility) {
                if (this.safeSelection) {
                    sFeatures = this.getSafeSelecction(layer, layer.selectedFeatures);
                } else {
                    sFeatures = this.getFeatures(layer.selectedFeatures);
                }
                if (sFeatures.length) {
                    allSelFeatures.push({layer:layer, features:sFeatures});
                    r = this.getLayerSelection(layer, sFeatures, bounds);
                    html.push(r.html);
                    if (r.invalid) {
                        layerObjs.events.triggerEvent("selectionchanged", {
                            layer: layer,
                            selection: sFeatures
                        });
                        invalid = true;
                    }
                } else {
                    if (layerObjs.ids !== "") {
                        invalid = true;
                        layerObjs.ids = "";
                        layerObjs.events.triggerEvent("selectionchanged", {
                            layer: layer,
                            selection: []
                        });
                    }
                }
            } else {
                if (layerObjs.ids !== "") {
                    invalid = true;
                    layerObjs.ids = "";
                    layerObjs.events.triggerEvent("selectionchanged", {
                        layer: layer,
                        selection: []
                    });
                }
            }
        }
        if (invalid) {
            var feature,
                response = false;
            if (this.popupObjs.select && allSelFeatures.length === 1 && 
                                         allSelFeatures[0].features.length === 1) {
                // only one single feature is selected so... try to show
                var selObject = allSelFeatures[0],
                    feature = selObject.features[0];
                if (!feature.layer) {
                    feature = this.cloneDummyFeature(feature, selObject.layer);
                }
                var sTemplate = this.layerObjs[selObject.layer.id].selectTemplate;
                if (sTemplate) {
                    var lonLat;
                    if (feature.geometry.getVertices().length > 1) {
                        lonLat = this.getLocationFromSelPixel(this.controls.select, 
                                                                           feature);
                    } else {
                        lonLat = feature.geometry.getBounds().getCenterLonLat();
                    }
                    html = this.renderTemplate(sTemplate, feature);
                    this.popupObjs.select.showPopup(feature, lonLat, html);
                }
                response = !!this.popupObjs.select.popup;
            }
            if (this.popupObjs.list && !response) {
                this.popupObjs.list.showPopup(
                    allSelFeatures, 
                    bounds.getCenterLonLat(),
                    html.join("\n")
                );
            }
            this.events.triggerEvent("selectionchanged", {
                selection: allSelFeatures
            });
        }
    },
    
    /**
     * Function: getLayerSelection
     */
    getLayerSelection: function (layer, features, bounds) {
        var response = {html: "", invalid: false},
            layerId = layer.id,
            layerObjs =this.layerObjs[layerId],
            layerTemplate = layerObjs.listTemplate;
        var i, len, feature,
            html = [],
            ids = [],
            itemTemplate = layerObjs.itemTemplate;
        for (i=0, len = features.length; i<len; ++i) {
            feature = features[i];
            bounds.extend(feature.geometry.getBounds());
            if (!feature.layer) {
                feature = this.cloneDummyFeature(feature, layer);
            }
            layerTemplate && html.push(this.renderTemplate(itemTemplate, feature));
            if (feature.fid) {
                ids.push(feature.fid);
            } else {
                ids.push(feature.id);
            }
        }
        ids = ids.sort().join("\t");
        if (ids !== layerObjs.ids) {
            response.invalid = true;
            layerObjs.ids = ids;
        }
        if (layerTemplate) {
            if (html.length) {
                response.html = this.renderTemplate(
                    layerTemplate, {
                        layer: layer, 
                        count: features.length, 
                        html: html.join("\n")
                    }
                );
            }
        } 
        return response;
    },
    
    /**
     * Method: getSafeSelecction
     */
    getSafeSelecction: function (layer, features){
        var sFeatures = [];
        var i, len, feature;
        var savedSF = this.selectionStorage[layer.id];
        if (savedSF) {
            for (i=0, len = features.length; i<len; ++i) {
                feature = features[i];
                if (feature.cluster) {
                    // Not all features may be selected on a cluster
                    var clusterFeatures = feature.cluster;
                    for (var ii = 0 , llen = clusterFeatures.length; ii <llen; ii++) {
                        var cFeature = clusterFeatures[ii];
                        if (cFeature.fid) {
                            if (savedSF[cFeature.fid]) {
                                sFeatures.push(cFeature);
                            }
                        } else if (savedSF[cFeature.id]) {
                            sFeatures.push(cFeature);
                        }
                    }
                } else {
                    sFeatures.push(feature);
                }
            }
        }
        return sFeatures;
    },

    /**
     * Method: getFeatures
     */
    getFeatures: function (features){
        var sFeatures = [];
        var i, len, feature;
        for (i=0, len = features.length; i<len; ++i) {
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
     * Function: prepareTemplate
     * When the template is a string returns a prepared template, 
     *     otherwise returns it as is, see more in <addLayer>.
     * This function is used at creating a instance of the control and when 
     *     <addLayer> method is called. 
     *
     * Parameters: 
     * template - {String || Function}
     * 
     * Returns:
     * {String || Function} A internationalized template.
     */
    prepareTemplate: function (template) {
        if (typeof template == 'string') {
            template = template.replace(
                this.regExesShow,
                function (a, idName, subId) {
                    idName = idName || "id";
                    return "id=\"showPopup-${layer.id}-" + idName + "-${" + idName + "}-" + subId + "\"";
                }
            );
            template = template.replace(
                this.regExesAttributes,
                "${attributes."
            );
            return template.replace( // internationalize template.
                this.regExesI18n,
                function (a,key) {
                    return OpenLayers.i18n(key);
                }
            );
        } else {
            return template;
        }
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
    renderTemplate: function (template, context) {
        if (typeof template == 'string') {
            return OpenLayers.String.format(template, context)
        } else if (typeof template == 'function') {
            return template(context);
        } else {
            return "";
        }
    },
    
    CLASS_NAME: "OpenLayers.Control.FeaturePopups"
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
     *      false.
     *  popupdisplayed - Triggered after a popup is displayed.
     *  closedbybox - Triggered after close a popup using close box.
     */
    events: null,
    
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
    type: "",
    
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
     * Property: observeItems
     * {Boolean} If true, will be activated observers of the DOMElement of the 
     *     popup to trigger some events (mostly in list popups).
     */
    observeItems: false,
    
    /**
     * Property: related
     * Array({String}) Related <FeaturePopups.popupObjs> codes from <control>
     */
    related: [],
    
    /**
     * Property: relatedToClear
     * Array({String}) Related <FeaturePopups.popupObjs> codes from <control>
     *     to clear.
     */
    relatedToClear: [],
     
    /** Property: popupType
     * {String} Code of type of popup to manage: "div", "OL" or "custom"
     */
    popupType: "",
    
    /** 
     * Property: html 
     * {String} Cache HTML that shows the popup or "" when not.
     */
    html: "",
    
    /** 
     * Property: html 
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
     * type - {String} Type of popup manager: "list", "select", "listItem" or 
     *     "hover"
     * options - {Object} 
     *
     * Valid ptions:
     * eventListeners - {Object} Listeners to register at object creation.
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
     * related - Array({String}) Related <FeaturePopups.popupObjs> codes from 
     *     <control>
     * relatedToClear - Array({String}) Related <FeaturePopups.popupObjs> codes 
     *     from <control> to clear
     */
    initialize: function (control, type, options) {
        // Options
        OpenLayers.Util.extend(this, options);
        
        // Arguments
        this.control = control;
        this.type = type;
        
        // close box
        if (this.closeBox) {
            this.onCloseBoxMethod = OpenLayers.Function.bind(
                function(evt) {
                    if (this.unselectOnClose && control.controls.select) {
                        control.controls.select.unselectAll();
                    }
                    this.clear();
                    this.clearRelated();
                    OpenLayers.Event.stop(evt);
                    this.events.triggerEvent("closedbybox", {type: this.type});
                },
                this
            )
        }
        
        // Options
        var popupClass = this.popupClass;
        if (popupClass) {
            if (typeof popupClass == "string") {
                this.popupType = "div";
            } else if (popupClass.prototype.CLASS_NAME && 
                       OpenLayers.String.startsWith(
                            popupClass.prototype.CLASS_NAME, "OpenLayers.Popup")) {
                this.popupType = "OL";
            } else if (typeof popupClass == "function") {
                this.popupType = "custom";
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
        this.events = new OpenLayers.Events(this);
        this.eventListeners && this.events.on(this.eventListeners);
    },
    
    /**
     * APIMethod: destroy
     */
    destroy: function () {
        this.clear();
        this.eventListeners && this.events.on(this.eventListeners);
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
     */
    showPopup: function (selection, lonLat, html) {
        if (html !== this.html || (html === "" && this.relatedHasHtml())) {
            this.clear();
            this.clearRelated();
            var popupClass = this.popupClass;
            if (popupClass && html) {
                var cont = this.events.triggerEvent("beforepopupdisplayed", {
                    type: this.type,
                    selection: selection,
                    popupClass: popupClass
                });
                if (cont !== false) {
                    // this alters "this.popup"
                    this.set(lonLat, html);
                }
            }
            if (this.popup) {
                this.observeItems && this.observeShowPopup(this.div);
                this.events.triggerEvent("popupdisplayed", {
                    type: this.type,
                    selection: selection, 
                    div: this.div, 
                    popup: this.popup
                });
            }
        }
    },

    /**
     * Method: clearRelated
     * Internal use only.
     */
    clearRelated: function () {
        var popupObjs = this.control.popupObjs,
            related;
        for (var i = 0, len = this.relatedToClear.length; i <len; i++) {
            related = popupObjs[this.relatedToClear[i]];
            related && related.clear();
        }
    },
    
    /**
     * Property: relatedHasHtml
     * {Function} Function to check if there are any related popupObjs with html.
     *
     * Returns:
     * {Boolean} True if any related has html != "".
     */
    relatedHasHtml : function() {
        var popupObjs = this.control.popupObjs,
            related;
        for (var i = 0, len = this.related.length; i <len; i++) {
            related = popupObjs[this.related[i]];
            if (related && related.html !== "") {
                return true;
            }
        }
        return false;
    },
    
    /**
     * Method: observeShowPopup
     * Internal use only.
     *
     * Parameters:
     * div - {DOMElement}
     */
    observeShowPopup: function (div) {
        for (var i = 0, len = div.childNodes.length; i < len; i++) {
            var child = div.childNodes[i];
            if (child.id && OpenLayers.String.startsWith(child.id, 
                                              "showPopup-OpenLayers.Layer.")) {
                OpenLayers.Event.observe(child, "touchend", 
                    OpenLayers.Function.bindAsEventListener(this.showListItem, this.control));
                OpenLayers.Event.observe(child, "click", 
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
    showListItem: function (evt) {
        var elem = OpenLayers.Event.element(evt);
        if (elem.id) {
            var ids = elem.id.split("-");
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
    removeChildren: function (div) {
        var child;
        while (child = div.firstChild) {
            if (child.id && OpenLayers.String.startsWith(child.id, 
                                              "showPopup-OpenLayers.Layer.")) {
                OpenLayers.Event.stopObservingElement(child);
            }
            this.removeChildren(child); 
            div.removeChild(child);
        }
    },

    /**
     * Method: set
     * Sets the popup.
     */
    set: function (lonLat, html) {
        var div, popup,
            control = this.control;
        switch (this.popupType) {
        case "div":
            div = document.getElementById(this.popupClass);
            if (div) {
                div.innerHTML = html;
                this.div = div;
                this.html = html;
                this.popup = true;
            }
            break;
        case "OL":
            control = this.control;
            popup = new this.popupClass(
                control.id + "_" + this.type, 
                lonLat,
                new OpenLayers.Size(100,100),
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
            popup.autoSize = true;
            OpenLayers.Element.addClass(popup.contentDiv, 
                                   control.displayClass + "_" + this.type);
            // A trick to take into account new displayClass in popup autoSize.
            popup.contentDisplayClass = popup.contentDiv.className;
            control.map.addPopup(popup);

            this.div = popup.contentDiv;
            this.html = html;
            this.popup = popup;
            this.moveListener && control.map.events.on(this.moveListener);
            break;
        case "custom":
            var returnObj = this.popupClass(
                           control.map, lonLat, html, this.onCloseBoxMethod, this);
            if (returnObj.div) {
                this.clearCustom = returnObj.destroy;
                this.div = returnObj.div;
                this.html = html;
                this.popup = true;
            }
            break;
        }
    },

    /**
     * Method: clear
     * Clear the popup if it is showing.
     */
    clear: function () {
        if (this.popup) {
            this.observeItems && this.removeChildren(this.div);
            switch (this.popupType) {
            case "OL":
                var control = this.control;
                if (control.map) {
                    control.map.removePopup(this.popup);
                }
                this.popup.destroy();
                this.moveListener && control.map.events.un(this.moveListener);
                break;
            case "custom":
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
        this.html = "";
    },
    

    CLASS_NAME: "OpenLayers.Control.FeaturePopups.Popup"
});
