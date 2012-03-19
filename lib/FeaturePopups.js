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
 * 
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.FeaturePopups = OpenLayers.Class(OpenLayers.Control, {

    /**
     * Supported event types:
     *  - *reselectionstart* Triggered before re-selection starts
     *  - *reselectionend* Triggered after re-selection ends
     */
     
    /**
     * APIProperty: autoActivate
     * {Boolean} Activate the control when it is added to a map. Default is
     *     true.
     */
    autoActivate: true,
    
    /**
     * APIProperty: hover
     * {Boolean} Shows popup on mouse over feature and hides popup on mouse
     *      out. Hover popups are not affected by <closeBox> and <clickout> 
     *      options. Default is false.
     */
    hover: false,
    
    /**
     * APIProperty: closeBox 
     * {Boolean} Whether to display a close box inside the popup, default is
     *     false.
     */
    closeBox: true,
    
    /**
     * Property: multipleKey
     * {String|null} Allows multiple selection by touching a feature while 
     *     pressing a key ('altKey', 'shiftKey' or '*' always). 
     *     Default is 'shiftKey'.
     */
    multipleKey: 'shiftKey',
    
    /**
     * Property: toggleKey
     * {String|null} Allows toggle selection by touching a feature while 
     *     pressing a key ('altKey', 'shiftKey' or '*' always).
     *     Default is 'shiftKey'.
     */
    toggleKey: 'shiftKey',
    
    /**
     * APIProperty: clickout
     * {Boolean} Close popup when clicking outside any feature,
     *     if <closeBox> = true default is false else is true.
     */
    clickout: false,
    
    /**
     * APIProperty: refreshAction
     * {<OpenLayers.Control.FeaturePopups.ACTION_TYPE>} Refresh popups mode when 
     *     some features are removed and re-add, for example when using strategies 
     *     as BBOX. Default is <OpenLayers.Control.FeaturePopups.ACTION_TYPE.SAFE>.
     */
    refreshAction: null,
    
    /**
     * Property: refreshDelay
     * {Number} Number of accepted milliseconds between removing and re-add 
     *     features (useful when using strategies such as BBOX), after this time 
     *     has expired is forced a refresh.
     */
    refreshDelay: 300,
    
    /**
     * Property: delayedRefresh
     * {Number} Timeout id of forced a refresh.
     */
    delayedRefresh: null,
    
    /**
     * APIProperty: selectionBox
     * {Boolean} Allow feature selection by drawing a box. Default is false.
     */
    selectionBox: false,
    
    /**
     * APIProperty: selectionBoxKeyMask
     * {Integer} Selection box only occurs if the keyMask matches the 
     *     combination of keys down. Use bitwise operators and one or more of
     *     the <OpenLayers.Handler> constants to construct a keyMask. Only used 
     *     when <selectionBox> is true.
     * NOTE: When MOD_CTRL is used the context menu is desabled.
     * Default is <OpenLayers.Handler.MOD_CTRL>.
     */
    selectionBoxKeyMask: OpenLayers.Handler.MOD_CTRL,

    /**
     * APIProperty: popupHoverClass
     * Default is <OpenLayers.Popup.Anchored>.
     */
    popupHoverClass: null,
    
    /**
     * APIProperty: popupHoverAnchor
     * Can reserve a space for the cursor as well the cursor does not touch the 
     *      hover popup. Default is 
     * (code)
     * {size: new OpenLayers.Size(15, 19), offset: new OpenLayers.Pixel(-1, -1)}
     * (code)
     */
    popupHoverAnchor: null,
    
    /**
     * APIProperty: popupSelectClass
     * Default is <OpenLayers.Popup.FramedCloud>.
     */
    popupSelectClass: null,
    
    /**
     * APIProperty: popupListClass
     * Default is <OpenLayers.Popup.FramedCloud>.
     */
    popupListClass: null,
    
    /**
     * APIProperty: layerListFeaturesTemplate
     * Default is "<h2>${layer.name} - ${count}</h2><ul>${html}</ul>"
     */
    layerListFeaturesTemplate: "<h2>${layer.name} - ${count}</h2><ul>${html}</ul>",

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
     * Property: templates
     * {Object} stores templates of this control's layers, internal use only.
     */
    templates: null,
        
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
     * {Boolean} True if <refreshAction> = 
     *                  OpenLayers.Control.FeaturePopups.ACTION_TYPE.SAFE.
     */
    safeSelection: false,
    
    /**
     * Property: delayedRefreshLayers
     * {Object} To store the current layers to refresh.
     */
    delayedRefreshLayers: null,
    
    /**
     * Constructor: OpenLayers.Control.FeaturePopups
     * The control generates three types of popup: "hover", "select" and 
     *     "list", see <addLayer>. 
     * Each popup has a displayClass according to their type: 
     *     "[displayClass]_hover" ,"[displayClass]_select" and 
     *     "[displayClass]_list" respectively.
     * 
     * options - {Object} 
     */
    initialize: function (options) {
        if (options && options.closeBox !==  undefined) {
            this.closeBox = options.closeBox;
        }
        options = OpenLayers.Util.extend({
                clickout: !this.closeBox,
                popupHoverClass: OpenLayers.Popup.Anchored,
                popupHoverAnchor: {
                    size: new OpenLayers.Size(15, 19),
                    offset: new OpenLayers.Pixel(-1, -1)
                },
                popupSelectClass: OpenLayers.Popup.FramedCloud,
                popupListClass: OpenLayers.Popup.FramedCloud,
                refreshAction: OpenLayers.Control.FeaturePopups.ACTION_TYPE.SAFE
            }, 
            options
        );
        OpenLayers.Control.prototype.initialize.apply(this, [options]);

        this.safeSelection = (this.refreshAction ===
                            OpenLayers.Control.FeaturePopups.ACTION_TYPE.SAFE);
        
        this.controls = {};
        if (this.popupHoverClass) {
            this.controls.hover = new OpenLayers.Control.SelectFeature([], {
                hover: true,
                highlightOnly: true,
                eventListeners: {
                    scope: this,
                    featurehighlighted: this.onFeaturehighlighted,
                    featureunhighlighted: this.onFeatureunhighlighted
                }
            });
        }
        if (this.popupSelectClass) {
            this.controls.select = new OpenLayers.Control.SelectFeature([], {
                clickout: this.clickout,
                toggleKey: (this.toggleKey==='*'?null:this.toggleKey),
                toggle: (this.toggleKey==='*'),
                multipleKey: (this.multipleKey==='*'?null:this.multipleKey),
                multiple: (this.multipleKey==='*')
            });
            if (this.selectionBox) {
                // Handler for the trick to manage selection box.
                this.handlerBox = new OpenLayers.Handler.Box(
                    this, {
                        done: this.onSelectBox
                    }, {
                        boxDivClassName: "olHandlerBoxSelectFeature", 
                        keyMask: this.selectionBoxKeyMask
                    }
                ); 
            }
            // Trick to refresh popups when click a feature of a multiple selection.
            var self = this;
            this.controls.select.unselectAll = OpenLayers.Function.bind(
                function (options) {
                    var safeSelection = (!self.refreshSelection && self.safeSelection);
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
                },
                this.controls.select
            );
            
            // TODO Declare: _closeSelect, _closeOnlySelect, _closeList, _showPopup
            if (this.closeBox) {
                this._closeSelect = OpenLayers.Function.bind(
                    function (evt) {
                        this.controls.select.unselectAll();
                        this.closePopupObj(this.popupObjs.select);
                        OpenLayers.Event.stop(evt);
                    },
                    this
                );
                this._closeOnlySelect = OpenLayers.Function.bind(
                    function (evt) {
                       this.closePopupObj(this.popupObjs.select);
                       OpenLayers.Event.stop(evt);
                    },
                    this
                );
                this._closeList = OpenLayers.Function.bind(
                    function (evt) {
                        this.controls.select.unselectAll();
                        this.closePopupObj(this.popupObjs.list);
                        OpenLayers.Event.stop(evt);
                    },
                    this
                );
            } else {
                this._closeSelect = null;
                this._closeOnlySelect = null;
                this._closeList = null;
            }
            this._showPopup = OpenLayers.Function.bindAsEventListener(
                function (evt) {
                    var elem = OpenLayers.Event.element(evt);
                    if (elem.id) {
                        var ids = elem.id.split("-");
                        if (ids.length >= 3) {
                            this.showSingleFeatureById(ids[1], ids[3], ids[2]);
                        }
                    }
                },
                this
            );
        }
        this.hoverClusterTemplate = this.prepareTemplate(
                                               this.hoverClusterTemplate);
        this.layerListeners = {
            scope: this,
            "visibilitychanged": this.showAllSelectedFeatures,
            "featureselected": this.onFeatureselected,
            "featureunselected": this.onFeatureunselected
        };
        switch (this.refreshAction) {
        case OpenLayers.Control.FeaturePopups.ACTION_TYPE.SAFE:
            this.layerListeners["beforefeaturesremoved"] = this.onBeforefeaturesremoved;
            this.layerListeners["featuresadded"] = this.onFeaturesadded;
            break;
        case OpenLayers.Control.FeaturePopups.ACTION_TYPE.REMOVE:
            this.layerListeners["featuresremoved"] = this.onFeaturesremoved;
            break;
        }

        this.popupObjs ={
            list: {type:"list", popupClass: this.popupListClass, popup: null, html: ""}, 
            hover: {
                type:"hover", 
                popupClass: this.popupHoverClass, 
                anchor: this.popupHoverAnchor,
                popup: null, 
                moveListener: {
                    scope: this,
                    mousemove: function(evt) {
                        var hPopup = this.popupObjs.hover.popup;
                        if (hPopup && hPopup.moveTo) {
                            var lonLat = this.map.getLonLatFromPixel(evt.xy);
                            hPopup.moveTo(this.map.getLayerPxFromLonLat(lonLat));
                        }
                    }
                },
                html: ""
            }, 
            
            select: {type:"select", popupClass: this.popupSelectClass, popup: null, html: ""}
        };
        this.templates = {};
        this.selectionStorage = {};
        this.delayedRefreshLayers = {};
        this.layers = [];
        this.map && this.setMap(this.map);
    },

    /**
     * APIMethod: destroy
     */
    destroy: function () {
        this.deactivate();
        this.layerListeners = null;
        this.popupObjs = null;
        this.templates = null;
        this.layers = null;
        this.handlerBox && this.handlerBox.destroy();
        this.handlerBox = null;
        this._closeSelect = null;
        this._closeOnlySelect = null;
        this._closeList = null;
        this.controls.select && this.controls.select.destroy();
        this.controls.hover && this.controls.hover.destroy();
        this.controls = null;
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },
    
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
        var i, len;
        if (!this.active && this.events) { // Add the layers before activating improves performance.
            for (i = 0, len = this.map.layers.length; i < len; i++) {
                this.addLayer(this.map.layers[i]);
            }
        }
        if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
            this.map.events.on({
                scope: this,
                "addlayer": this.onAddLayer,
                "removelayer": this.onRemoveLayer
            });
            for (i = 0, len = this.layers.length; i < len; i++) {
                var layer = this.layers[i];
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
            this.closeAllPopupObjs();
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
        if (this. selectionBox && 
                this.selectionBoxKeyMask == OpenLayers.Handler.MOD_CTRL) {
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
        if (this.templates[layer.id]) {
            // Set layers in the control when added to the map after activating this control.
            this.setLayer(layer);
        } else {
            this.addLayer(layer);
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
     * Not added layers to the control that do not have assigned any template, 
     *     either as properties or as addLayer options (see below) 
     * In a layer can also specify a "listPopupTemplate" (default is 
     *     <layerListFeaturesTemplate>), this template is ignored if not 
     *     specified in conjunction with "itemPopupTemplate".
     *
     * To force the addition of a layer that has already been added (maybe 
     *     automatically), first must be removed using <removeLayer>.
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
     *     defaul is <layerListFeaturesTemplate>.
     *
     * If specified some template as layer property and as options has priority 
     *     the options template.
     */
    addLayer: function (layer, options) {
        options = OpenLayers.Util.extend({
                hoverTemplate: layer.hoverPopupTemplate,
                selectTemplate: layer.selectPopupTemplate,
                itemTemplate: layer.itemPopupTemplate,
                listTemplate: layer.listPopupTemplate || this.layerListFeaturesTemplate
            },
            options
        );
        if ((options.hoverTemplate || options.selectTemplate) && 
                !this.templates[layer.id] && 
                layer instanceof OpenLayers.Layer.Vector) {
            options.hoverTemplate = this.prepareTemplate(options.hoverTemplate);
            options.selectTemplate = this.prepareTemplate(options.selectTemplate);
            options.itemTemplate = this.prepareTemplate(options.itemTemplate);
            this.templates[layer.id] = options;
            this.layers.push(layer);
            if (this.active && layer.map) {
                this.setLayer(layer);
            }
        }
    },
    /**
     * Method: setLayer
     */
    setLayer: function (layer) {
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
        if (this.templates[layerId]) {
            delete this.templates[layerId];
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
        if (!this.refreshSelection && this.safeSelection) {
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
        this.showAllSelectedFeatures();
    },

    /**
     * Method: onBeforefeaturesremoved
     * Called before some features are removed, only used when value of 
     *   <refreshAction> is <OpenLayers.Control.FeaturePopups.ACTION_TYPE>.SAFE.
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
     * Called when some features are added, only used when value of 
     *   <refreshAction> is <OpenLayers.Control.FeaturePopups.ACTION_TYPE>.SAFE.
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
            this.events.triggerEvent("reselectionstart", {layer: layer});
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
                            if(savedSF[cFeature.fid]) {
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
            this.events.triggerEvent("reselectionend", {layer: layer}); 
            delete this.delayedRefreshLayers[layerId];
            if (this.isEmptyObject(this.delayedRefreshLayers)) {
                this.showAllSelectedFeatures();
            }
        }
    },

    /**
     * Method: onFeaturesremoved
     * Called when some features are removed, only used when 
     *     <refreshAction> = <OpenLayers.Control.FeaturePopups.ACTION_TYPE.REMOVE>
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
        this.closeAllPopupObjs();
        this.showAllSelectedFeatures();
    },
    
    /**
     * Method: onFeaturehighlighted
     * Internal use only.
     */
    onFeaturehighlighted: function (evt) {
        // Can not detect onLeaving because was covered by a select popup, so must be destroyed.
        var popupObjHover = this.popupObjs.hover;
        this.closePopupObj(popupObjHover);
        var feature = evt.feature;
        var template = this.templates[feature.layer.id].hoverTemplate;
        if (template && this.popupHoverClass) {
            var lonlat;
            var xy = null,
                hFeature = this.controls.hover.handlers.feature;
            if (evt.feature === hFeature.feature) {
                xy = hFeature.evt.xy;
            }
            if (xy) {
                lonLat = this.map.getLonLatFromPixel(xy); 
                this.map.events.on(this.popupObjs.hover.moveListener);
            } else {
                lonLat = feature.geometry.getBounds().getCenterLonLat();
            }
            if (feature.cluster) {
                var response = false;
                if (feature.cluster.length == 1){
                    // show cluster as a single feature.
                    this.showPopup(
                        popupObjHover,
                        lonLat, 
                        this.renderTemplate(
                            template, 
                            this.cloneDummyFeature(
                                             feature.cluster[0], feature.layer)
                        ),
                        null
                    );
                    response = !!popupObjHover.popup;
                } 
                if (feature.cluster.length >= 1 && response === false) {
                    this.showPopup(
                        popupObjHover, 
                        lonLat, 
                        this.renderTemplate(this.hoverClusterTemplate, feature),
                        null
                    );
                }
            } else {
                this.showPopup(
                    popupObjHover,
                    lonLat, 
                    this.renderTemplate(template, feature),
                    null
                );
            }
        }
    },
    
    /**
     * Method: onFeatureunhighlighted
     */
    onFeatureunhighlighted: function (evt) {
        this.closePopupObj(this.popupObjs.hover);
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
     * Method: showSelectedFeature
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} the feature.
     */
    showSelectedFeature: function (feature) {
        var response = false;
        var html;
        if (feature.cluster) {
            if (feature.cluster.length == 1){
                // Try to show the cluster as a single feature.
                response = this.showSelectedFeature(
                     this.cloneDummyFeature(feature.cluster[0], feature.layer));
            }
            if (feature.cluster.length >= 1 && response === false) {
                var bounds = new OpenLayers.Bounds();
                html = this.renderLayerTemplate(
                                       feature.layer, [feature], bounds);
                this.showFeaturesPopup(
                    this.popupObjs.list,
                    bounds.getCenterLonLat(),
                    html,
                    this._closeList
                );
                response = !!this.popupObjs.list.popup;
            }
        } else if (this.popupSelectClass) {
            var template = this.templates[feature.layer.id].selectTemplate;
            if (template) {
                html = this.renderTemplate(template, feature)
                this.showFeaturesPopup(
                    this.popupObjs.select, 
                    feature.geometry.getBounds().getCenterLonLat(), 
                    html,
                    this._closeSelect
                );
            }
            response = !!this.popupObjs.select.popup;
        }
        return response;
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
        if (!this.popupSelectClass) {
            return false;
        }
        var layers = this.controls.select.layers || [this.controls.select.layer];
        var i, len, layer;
        for (i=0, len=layers.length; i<len; i++) {
            layer = layers[i];
            if (layerId == layer.id) {
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
                    if (feature[idName] == featureId && !feature.cluster) {
                    // Don't try to show a cluster as a single feature, 
                    //      selectTemplate does not support it.
                        var popupObj = this.popupObjs.select;
                        this.closePopupObj(popupObj);
                        var template = this.templates[layerId].selectTemplate;
                        if (template) {
                            var html = this.renderTemplate(template, feature)
                            this.showPopup(
                                popupObj, 
                                feature.geometry.getBounds().getCenterLonLat(), 
                                html, 
                                this._closeOnlySelect
                            );
                        }
                        return true;
                    }
                }
                return false;
            }
        }
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
        var layers = this.controls.select.layers || [this.controls.select.layer];
        var i, len, layer, sFeatures, feature0, 
            bounds = new OpenLayers.Bounds(),
            count = 0,
            html = "";
        for (i=0, len=layers.length; i<len; i++) {
            layer = layers[i];
            if (layer.visibility) {
                sFeatures = layer.selectedFeatures;
                if (sFeatures.length) {
                    count += sFeatures.length;
                    feature0 = sFeatures[0];
                    html += this.renderLayerTemplate(layer, sFeatures, bounds);
                }
            }
        }
        var response = false;
        if (count == 1) {
            // Try to show the only feature as a single feature.
            response = this.showSelectedFeature(feature0);
        } 
        if (!response) {
            if (html) {
                this.showFeaturesPopup(
                    this.popupObjs.list,
                    bounds.getCenterLonLat(),
                    html,
                    this._closeList
                );
            } else {
                this.closeAllPopupObjs();
            }
        }
        return count;
    },
    
    /**
     * Method: renderLayerTemplate
     * Called when the select feature control unselects a feature.
     *
     * Parameters:
     */
    renderLayerTemplate: function (layer, features, bounds) {
        var html = "";
        var template = this.templates[layer.id].listTemplate;
        if (template) {
            var r = this.renderListFeaturesTemplate(
                this.templates[layer.id].itemTemplate,
                layer,
                features,
                bounds
            );
            if (r.html) {
                html = this.renderTemplate(
                    template, {layer: layer, count: r.count, html: r.html}
                ) + "\n";
            }
        } 
        return html;
    },
    
    /**
     * Method: renderListFeaturesTemplate
     * Called when the select feature control unselects a feature.
     *
     * Parameters:
     */
    renderListFeaturesTemplate: function (template, layer, features, bounds) {
        var result = {
            html: "",
            count: 0
        };
        var savedSF;
        if (this.safeSelection) {
            savedSF = this.selectionStorage[layer.id];
        }
        if (!this.safeSelection || savedSF) {
            var i, len, feature;
            for (i=0, len = features.length; i<len; ++i) {
                feature = features[i];
                if (feature.cluster) {
                    var sFeatures;
                    if (this.safeSelection) {
                    // Not all features may be selected on a cluster
                        sFeatures = [];
                        var clusterFeatures = feature.cluster;
                        for (var ii = 0 , llen = clusterFeatures.length; ii <llen; ii++) {
                            var cFeature = clusterFeatures[ii];
                            if (cFeature.fid) {
                                if(savedSF[cFeature.fid]) {
                                    sFeatures.push(cFeature);
                                }
                            } else if (savedSF[cFeature.id]) {
                                sFeatures.push(cFeature);
                            }
                        }
                    } else {
                        sFeatures = feature.cluster;
                    }
                    var resultCluster = this.renderListFeaturesTemplate(
                                         template, layer, sFeatures, bounds);
                    result.html += resultCluster.html;
                    result.count += resultCluster.count;
                } else {
                    bounds.extend(feature.geometry.getBounds());
                    if (!feature.layer) {
                        feature = this.cloneDummyFeature(feature, layer);
                    }
                    result.html += this.renderTemplate(
                        template, 
                        feature
                    ) + "\n";
                    result.count++;
                }
            }
        }
        return result;
    },
    
    /**
     * Method: showFeaturesPopup
     * Internal use only.
     *
     * Parameters:
     */
    showFeaturesPopup: function (popupObj, lotLat, html, closeMethod) {
        // Only show popups that are not on display:
        //      showAllSelectedFeatures is called when the visibility of a layer 
        //      changes, but this can produce the same html. Do not want move 
        //      map if popup is the same.
        if (popupObj.html !== html) {
            this.closeAllPopupObjs();
            this.showPopup(popupObj, lotLat, html, closeMethod);
        }
    },
    
    /**
     * Method: showPopup
     * Internal use only.
     *
     * Parameters:
     */
    showPopup: function (popupObj, lotLat, html, closeMethod) {
        var popupClass = popupObj.popupClass;
        var div = null; 
        var popup = null;
        if (popupClass && html) {
            if (typeof popupClass == 'string') {
            // popupClass as a id of an HTMLElement
                div = document.getElementById(popupClass);
                if (div) {
                    div.innerHTML = html;
                    popup = popupClass;
                }
            } else {
            // popupClass as a OpenLayers.Popup class.
                popup = new popupClass(
                    this.id + "_" + popupObj.type, 
                    lotLat,
                    new OpenLayers.Size(100,100),
                    html
                );
                if (popupObj.anchor) {
                    popup.anchor = popupObj.anchor;
                }
                if (closeMethod) {
                    // The API of the popups is not homogeneous, closeBox may 
                    //      be the fifth or sixth argument, it depends!
                    // So forces closeBox using other ways.
                    popup.addCloseBox(closeMethod);
                    popup.closeDiv.style.zIndex = 1;
                }
                popup.autoSize = true;
                div = popup.contentDiv;
                OpenLayers.Element.addClass(popup.contentDiv, 
                                       this.displayClass + "_" + popupObj.type);
                // A trick to take into account new displayClass in popup autoSize.
                popup.contentDisplayClass = popup.contentDiv.className;

                this.map.addPopup(popup);
            }
        }
        if (popup) {
            if (popupObj.type === "list") {
                this.observeShowPopup(div)
            }
            popupObj.popup = popup;
            popupObj.div = div;
            popupObj.html = html;
        } else {
            popupObj.popup =  null;
            popupObj.div = null;
            popupObj.html = "";
        }
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
                    OpenLayers.Function.bindAsEventListener(this._showPopup, this));
                OpenLayers.Event.observe(child, "click", 
                    OpenLayers.Function.bindAsEventListener(this._showPopup, this));
            } else {
                this.observeShowPopup(child);
            }
        }
    },
    
    /**
     * Method: removeChildren
     * Internal use only.
     *
     * Parameters:
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
     * Method: closeAllPopupObjs
     * Internal use only.
     */
    closeAllPopupObjs: function () {
        this.closePopupObj(this.popupObjs.hover);
        this.closePopupObj(this.popupObjs.select);
        this.closePopupObj(this.popupObjs.list);
    },
    
    /**
     * Method: destroyPopup
     * Internal use only.
     */
    closePopupObj: function (popupObj) {
        var popup = popupObj.popup;
        if (popup) {
            popupObj.moveListener && this.map.events.un(popupObj.moveListener);
            if (popupObj.type === "list") {
                this.removeChildren(popupObj.div);
            }
            if (popup instanceof OpenLayers.Popup){
                if (this.map) {
                    this.map.removePopup(popup);
                }
                popup.destroy(); 
            }
            popupObj.div = null;
            popupObj.popup = null;
            popupObj.html = "";
        }
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
 * Enumeration: OpenLayers.Control.FeaturePopups.ACTION_TYPE
 * {Number}
 */
OpenLayers.Control.FeaturePopups.ACTION_TYPE = { 
    NONE: 1,
    REMOVE: 3,
    SAFE: 4
};