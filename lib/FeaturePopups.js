/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
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
     *  - *beforefeaturehighlighted* Triggered before a feature is highlighted.
     *  - *featurehighlighted* Triggered when a feature is highlighted.
     *  - *featureunhighlighted* Triggered when a feature is unhighlighted.
     *  - *featureselected* Triggered after a feature is selected.  Listeners
     *      will receive an object with a *feature* property referencing the
     *      selected feature, and *selectionBox* true if 
     *      feature is selected using a selection box.
     *  - *featureunselected* Triggered after a feature is unselected.
     *      Listeners will receive an object with a *feature* property
     *      referencing the unselected feature.
     *  - *beforeselectionbox* Triggered before beginning the selection 
     *      features marked with a selecection box. 
     *  - *afterselectionbox* Triggered after the selection all features marked 
     *      with a selecection box. Listeners will receive *count* with the 
     *      number of selected features.
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
     * APIProperty: clickout
     * {Boolean} Close popup when clicking outside any feature,
     *     if <closeBox> is true default is false else is true.
     */
    clickout: false,
    
    /**
     * APIProperty: closeOnUnselect
     * {Boolean} Close popup when any feature is unselect,
     *     if <closeBox> is true default is false else is true.
     */
    closeOnUnselect: false,
    
    /**
     * APIProperty: closeOnFeaturesremoved
     * {Boolean} Close popup when some features are removed,
     */
    closeOnFeaturesremoved: false,
    
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
     * Default is OpenLayers.Popup.
     */
    popupHoverClass: null,
    
    /**
     * APIProperty: popupSelectClass
     * Default is OpenLayers.Popup.FramedCloud.
     */
    popupSelectClass: null,
    
    /**
     * APIProperty: popupListClass
     * Default is OpenLayers.Popup.FramedCloud.
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
    hoverClusterTemplate: "${OpenLayers.i18n('Cluster with ${cluster.length} features<br>on layer \"${layer.name}\"')}",
    
    /**
     * Property: regExesI18n
     * {RegEx} Used to internationalize templates.
     */
    regExesI18n: /\$\{OpenLayers.i18n\(["']?([\s\S]+?)["']?\)\}/g,
    regExesShow: /\$\{show\(()\)\}/g,
    
    /**
     * Property: boxStarted
     * {Boolean} Internal use only.
     */
    boxStarted: false,    

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
     * Constructor: OpenLayers.Control.FeaturePopups
     * TODO The control generates three types of popup: "hover", "select" and 
     *     "list". 
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
                closeOnUnselect: !this.closeBox,
                popupHoverClass: OpenLayers.Popup,
                popupSelectClass: OpenLayers.Popup.FramedCloud,
                popupListClass: OpenLayers.Popup.FramedCloud
            }, 
            options
        );
        OpenLayers.Control.prototype.initialize.apply(this, [options]);

        this.controls = {};
        if (this.popupHoverClass) {
            this.controls.hover = new OpenLayers.Control.SelectFeature([], {
                hover: true,
                highlightOnly: true,
                eventListeners: {
                    scope: this,
                    beforefeaturehighlighted: this.onBeforefeaturehighlighted,
                    featurehighlighted: this.onFeaturehighlighted,
                    featureunhighlighted: this.onFeatureunhighlighted
                }
            });
        }
        if (this.popupSelectClass) {
            if (this.selectionBox) {
                this.handlerBox = new OpenLayers.Handler.Box(
                    this, {
                        done: this.onSelectBox
                    }, {
                        boxDivClassName: "olHandlerBoxSelectFeature", 
                        keyMask: this.selectionBoxKeyMask
                    }
                ); 
            }
            this.controls.select = new OpenLayers.Control.SelectFeature([], {
                clickout: this.clickout
            });
            // TODO Declare
            if (this.closeBox) {
                this._closeSelect = OpenLayers.Function.bind(
                    function (evt) {
                        this.controls.select.unselectAll();
                        this.destroyPopupObj(this.popupObjs.select);
                        OpenLayers.Event.stop(evt);
                    },
                    this
                );
                this._closeOnlySelect = OpenLayers.Function.bind(
                    function (evt) {
                       this.destroyPopupObj(this.popupObjs.select);
                       OpenLayers.Event.stop(evt);
                    },
                    this
                );
                this._closeList = OpenLayers.Function.bind(
                    function (evt) {
                        this.controls.select.unselectAll();
                        this.destroyPopupObj(this.popupObjs.list);
                        OpenLayers.Event.stop(evt);
                    },
                    this
                );
            } else {
                this._closeSelect = null;
                this._closeOnlySelect = null;
                this._closeList = null;
            }
        }
        this.layerListFeaturesTemplate = this.translateTemplate(
                                               this.layerListFeaturesTemplate);
        this.hoverClusterTemplate = this.translateTemplate(
                                               this.hoverClusterTemplate);
        this.layerListeners = {
            scope: this,
            "featuresremoved": this.onFeaturesremoved,
            "visibilitychanged": this.showAllSelectedFeatures,
            "featureselected": this.onFeatureselected,
            "featureunselected": this.onFeatureunselected
        };
        this.popupObjs ={
            list: {type:"list", popupClass: this.popupListClass, popup: null, html: ""}, 
            hover: {type:"hover", popupClass: this.popupHoverClass, popup: null, html: ""}, 
            select: {type:"select", popupClass: this.popupSelectClass, popup: null, html: ""}
        };
        this.templates = {};
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
            this.destroyAllPopupObjs();
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
     * 
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} 
     * options - {Object} Optional
     *
     * Options:
     * hoverTemplate - {String || Function} template used on hover a feature
     * selectTemplate - {String || Function} template used on select a feature
     * itemTemplate - {String || Function} template used to show a feature as an item in a list, see also 
     */
    addLayer: function (layer, options) {
        options = OpenLayers.Util.extend({
                hoverTemplate: layer.hoverPopupTemplate,
                selectTemplate: layer.selectPopupTemplate,
                itemTemplate: layer.itemPopupTemplate
            },
            options
        );
        if ((options.hoverTemplate || options.selectTemplate) && 
                !this.templates[layer.id] && 
                layer instanceof OpenLayers.Layer.Vector) {
            options.hoverTemplate = this.translateTemplate(options.hoverTemplate);
            options.selectTemplate = this.translateTemplate(options.selectTemplate);
            options.itemTemplate = this.translateTemplate(options.itemTemplate);
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
     * feature - {<OpenLayers.Feature.Vector>} the selected feature.
     */
    onFeatureselected: function (evt) {
        var feature = evt.feature;
        var xy = evt.xy;
        // Trick to not show individual features when using a selection box.
        if (!this.boxStarted) {
            this.destroyAllPopupObjs();
            this.showSelectedFeature(feature, xy);
        }
        return this.events.triggerEvent("featureselected", {
            feature: feature, xy: xy, selectionBox: this.boxStarted
        });
    },
    
    /**
     * Method: onFeatureunselected
     * Called when the select feature control unselects a feature.
     *
     * Parameters:
     */
    onFeatureunselected: function (evt) {
        // Feature unselected, so then hover and select smart popups must be destroyed.
        if (this.closeOnUnselect) {
            this.destroyAllPopupObjs();
        }
        return this.events.triggerEvent("featureunselected", {
            feature: evt.feature
        });
    },
    
    /**
     * Method: onFeaturesremoved
     * Called when some features are removed.
     *
     * Parameters:
     */
    onFeaturesremoved: function (evt) {
        if (this.closeOnFeaturesremoved) {
            this.showAllSelectedFeatures();
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
        if (this.events.triggerEvent("beforeselectionbox") !== false) {
            // Trick to not show individual features when using a selection box.
            this.boxStarted = true;
            OpenLayers.Control.SelectFeature.prototype.selectBox.apply(
                                                  this.controls.select, arguments);
            this.boxStarted = false;
            this.destroyAllPopupObjs();
            var count = this.showAllSelectedFeatures();
            this.events.triggerEvent("afterselectionbox", {count: count});
        }
    },
    
    /**
     * Method: onBeforefeaturehighlighted
     */
    onBeforefeaturehighlighted: function(evt) {
        return this.events.triggerEvent("beforefeaturehighlighted", {
            feature: evt.feature
        });
    },
    
    /**
     * Method: onFeaturehighlighted
     * Internal use only.
     */
    onFeaturehighlighted: function (evt) {
        // Can not detect onLeaving because was covered by a select popup, so must be destroyed.
        var popupObjHover = this.popupObjs.hover;
        this.destroyPopupObj(popupObjHover);
        var feature = evt.feature;
        var template = this.templates[feature.layer.id].hoverTemplate;
        var lonLat = feature.geometry.getBounds().getCenterLonLat();
        //var lonLat = this.map.getLonLatFromPixel(evt.xy); 
        if (template && this.popupHoverClass) {
            if (feature.cluster) {
                var response = false;
                if (feature.cluster.length == 1){
                    // show cluster as a single feature.
                    this.showPopup(
                        popupObjHover,
                        lonLat, 
                        this.renderTemplate(
                            template, 
                            this.completeFeature(
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
        return this.events.triggerEvent("featurehighlighted", {
            feature: feature
        });
    },
    
    /**
     * Method: onFeatureunhighlighted
     */
    onFeatureunhighlighted: function (evt) {
        this.destroyPopupObj(this.popupObjs.hover);
        return this.events.triggerEvent("featureunhighlighted", {
            feature: evt.feature
        });
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
        var i, len, feature;
        for (i=0, len = features.length; i<len; ++i) {
            feature = features[i];
            if (feature.cluster && feature.cluster.length) {
                var resultCluster;
                resultCluster = this.renderListFeaturesTemplate(
                                     template, layer, feature.cluster, bounds);
                result.html += resultCluster.html;
                result.count += resultCluster.count;
            } else {
                bounds.extend(feature.geometry.getBounds());
                if (!feature.layer) {
                    feature = this.completeFeature(feature, layer);
                }
                result.html += this.renderTemplate(
                    template, 
                    feature
                ) + "\n";
                result.count++;
            }
        }
        return result;
    },
    
    /**
     * function: completeFeature
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} the feature.
     * layer - <OpenLayers.Layer.Vector>}
     *
     * Returns:
     * {Object} Context of the feature including the layer.
     */
    completeFeature: function (feature, layer) {
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
                       this.completeFeature(feature.cluster[0],feature.layer));
            }
            if (feature.cluster.length >= 1 && response === false) {
                var bounds = new OpenLayers.Bounds();
                html = this.renderLayerTemplate(
                                       feature.layer, feature.cluster, bounds);
                this.showSelectPopup(
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
                this.showSelectPopup(
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
     * APIMethod: showFeatureById
     *
     * Parameters:
     * layerId - {String} id of the layer of selected feature.
     * featureId - {String} id of the selected feature.
     */
    showFeatureById: function (layerId, featureId) {
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
                            if (feature.id == featureId) {
                                feature = this.completeFeature(feature, layer);
                                break;
                            }
                        }
                    }
                    if (feature.id == featureId) {
                        var popupObj = this.popupObjs.select;
                        this.destroyPopupObj(popupObj);
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
                this.showSelectPopup(
                    this.popupObjs.list,
                    bounds.getCenterLonLat(),
                    html,
                    this._closeList
                );
            } else {
                this.destroyAllPopupObjs();
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
        var template = this.layerListFeaturesTemplate;
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
     * Method: showSelectPopup
     * Internal use only.
     *
     * Parameters:
     */
    showSelectPopup: function (popupObj, lotLat, html, closeMethod) {
        // Only show popups that are not on display:
        //      showAllSelectedFeatures is called when the visibility of a layer 
        //      changes, but this can produce the same html. Do not want move 
        //      map if popup is the same.
        if (popupObj.html !== html) {
            this.destroyAllPopupObjs();
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
        if (!popupClass) {
            popupObj.popup =  null;
            popupObj.html = "";
            return;
        }
        var popup = null;
        if (html) {
            if (typeof popupClass == 'string') {
                var div = document.getElementById(popupClass);
                if (div) {
                    div.innerHTML = html;
                    popup = popupClass;
                }
            } else {
                popup = new popupClass(
                    this.id + "_" + popupObj.type, 
                    lotLat,
                    new OpenLayers.Size(100,100),
                    html
                );
                if (closeMethod) {
                    // The API of the popups is not homogeneous, closeBox may 
                    //      be the fifth or sixth argument, it depends!
                    // So forces closeBox using other ways.
                    popup.addCloseBox(closeMethod);
                    popup.closeDiv.style.zIndex = 1;
                }
                popup.autoSize = true;
                OpenLayers.Element.addClass(popup.contentDiv, 
                                          this.displayClass + "_" + popupObj.type);
                this.map.addPopup(popup);
            }
        } else {
            return null;
        }
        popupObj.popup = popup;
        popupObj.html = popup ? html : "";
    },
    
    /**
     * Method: destroyAllPopupObjs
     * Internal use only.
     */
    destroyAllPopupObjs: function () {
        this.destroyPopupObj(this.popupObjs.hover);
        this.destroyPopupObj(this.popupObjs.select);
        this.destroyPopupObj(this.popupObjs.list);
    },
    
    /**
     * Method: destroyPopup
     * Internal use only.
     */
    destroyPopupObj: function (popupObj) {
        var popup = popupObj.popup;
        if (popup) {
            if (typeof popup == 'string') {
                var div = document.getElementById(popup);
                if (div) {
                    div.innerHTML = "";
                }
            } else {
                if (popup.id) { // The popup may have been destroyed by another process
                    if (this.map) {
                        this.map.removePopup(popup);
                    }
                    popup.destroy(); 
                }
            }
            popupObj.popup = null;
            popupObj.html = "";
        }
    },

    /**
     * Function: translateTemplate
     * When the template is a string returns a internationalized template, 
     *     otherwise returns it as is.
     * Templates containing patterns as ${OpenLayers.i18n("key")} are 
     *     internationalized by this function using <OpenLayers.i18n> function.
     * This function is used at creating a instance of the control and using 
     *     <addLayer> method. 
     *
     * Parameters: 
     * template - {String || Function}
     * 
     * Returns:
     * {String || Function} A internationalized template.
     */
    translateTemplate: function (template) {
        if (typeof template == 'string') {
            template = template.replace(
                this.regExesShow,
                "onclick =\"showPopup('${layer.id}','${id}');return false\""
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
 * APIFunction: getTemplate
 */
OpenLayers.Control.FeaturePopups.getTemplate = function (url) {
    var response = OpenLayers.Request.GET({url:url, async:false});
    if (response.responseText) {
        return response.responseText;
    } else {
        // If error loads text error as template
        return response.status + "-" + response.statusText; 
    }
};
