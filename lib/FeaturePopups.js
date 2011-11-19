/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control/SelectFeature.js
 * @requires OpenLayers/Popup.js
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
     *  - *beforefeaturehighlighted* Triggered before a feature is highlighted
     *  - *featurehighlighted* Triggered when a feature is highlighted
     *  - *featureunhighlighted* Triggered when a feature is unhighlighted
     *  - *featureselected* Triggered when a feature is selected
     *  - *featureunselected* Triggered when a feature is unselected
     *  - *beforefeaturesselected*
     *  - *afterfeaturesselected*
     */

    /**
     * APIProperty: autoActivate
     * {Boolean} Activate the control when it is added to a map. Default is
     *     true.
     */
    autoActivate: true,
    listLayersTemplate: "{{listLayersHtml}}",
    listLayerItemsTemplate: "<h2>{{name}} - {{itemsCount}}</h2><ul>{{listLayerItemsHtml}}</ul>",

    
    /**
     * APIProperty: box
     * {Boolean} Allow feature selection by drawing a box.
     */
    box: false,
    
    /**
     * APIProperty: hover
     * {Boolean} Shows popup on mouse over feature and hides popup on mouse
     *      out. If true, this ignores <closeBox> and <clickout> options. 
     *      Default is false.
     */
    hover: false,
    
    /**
     * APIProperty: closeBox 
     * {Boolean} Whether to display a close box inside the popup, default is
     *     false.
     */
    closeBox: false,
    
    /**
     * APIProperty: clickout
     * {Boolean} Close popup when clicking outside any feature,
     *     default is true, if <closeBox> is true default is false.
     */
    clickout: true,
    
    /**
     * APIProperty: popupSelectClass
     * Default is OpenLayers.Popup.FramedCloud.
     */
    popupSelectClass: null,
        
    /**
     * APIProperty: popupHoverClass
     * Default is OpenLayers.Popup.
     */
    popupHoverClass: null,
    
    /**
     * Property: hoverPopup
     * Internal use only.
     */
    hoverPopup: null,

    /**
     * Property: hoverPopupLayerId
     * Id of last layer used in <hoverPopup>.
     */
    hoverPopupLayerId: "",
    
    /**
     * Property: selectPopup
     * Internal use only.
     */
    selectPopup: null,
    
    /**
     * Property: selectPopupLayerId
     * Id of last layer used in <selectPopup>.
     */
    selectPopupLayerId: "",
     
    /**
     * Property: hoverControl
     * {<OpenLayers.Control.SelectFeature>} Internal use only.
     */
    hoverControl: null,
    
    /**
     * Property: selectControl
     * {<OpenLayers.Control.SelectFeature>} Internal use only.
     */
    selectControl: null,
    
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
     * options - {Object} 
     *
     * Options:
     * hover
     */
    initialize: function (options) {
        options = OpenLayers.Util.extend({
                clickout: !options.closeBox,
                popupHoverClass: OpenLayers.Popup,
                popupSelectClass: OpenLayers.Popup.FramedCloud
            }, 
            options
        );
        OpenLayers.Control.prototype.initialize.apply(this, [options]);

        if (this.popupHoverClass) {
            this.hoverControl = new OpenLayers.Control.SelectFeature([], {
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
            if (this.box) {
                this.handlerBox = new OpenLayers.Handler.Box(
                    this, {
                        done: this.selectBox
                    }, {
                        boxDivClassName: "olHandlerBoxSelectFeature", 
                        keyMask: OpenLayers.Handler.MOD_CTRL
                    }
                ); 
            }
            this.selectControl = new OpenLayers.Control.SelectFeature([], {
                clickout: this.clickout,
                scope: this,
                onSelect: this.selectFeature,
                onUnselect: this.unselectFeature
            });
        }
        this.templates = {};
        this.layers = [];
        this.map && this.setMap(this.map);
    },

    /**
     * APIMethod: destroy
     */
    destroy: function () {
        this.deactivate();
        this.popupSelectClass = null;
        this.popupHoverClass = null;
        this.templates = null;
        this.layers = null;
        this.handlerBox && this.handlerBox.destroy();
        this.selectControl && this.selectControl.destroy();
        this.hoverControl && this.hoverControl.destroy();
        this.handlerBox = null;
        this.selectControl = null;
        this.hoverControl = null;
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },
    
    /**
     * APIMethod: activate
     */
    activate: function () {
        var i, len;
        if (!this.active) { // Add the layers before activating improves performance.
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
                if (layer.map) {
                    layer.events.on({
                        scope: this,
                        "beforefeaturesremoved": this.onFeaturesRemoved
                    });
                }
            }
            if (this.hoverControl) {
                this.hoverControl.setLayer(this.layers);
                this.hoverControl.activate();
            }
            this.handlerBox && this.handlerBox.activate();
            if (this.selectControl) {
                this.selectControl.setLayer(this.layers);
                this.selectControl.activate();
            }
            return true;
        } else {
            return false;
        }
    },

    /**
     * APIMethod: deactivate
     */
    deactivate: function () {
        if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
            this.map.events.un({
                scope: this,
                "addlayer": this.onAddLayer,
                "removelayer": this.onRemoveLayer
            });
            for (var i = 0, len = this.layers.length; i < len; i++) {
                this.layers[i].events.un({
                    scope: this,
                    "beforefeaturesremoved": this.onFeaturesRemoved
                });
            }
            if (this.hoverControl) {
                this.hoverControl.deactivate();
                this.destroyHoverPopup();
            }
            this.handlerBox && this.handlerBox.deactivate();
            if (this.selectControl) {
                this.selectControl.deactivate();
                this.destroyListPopup();
                this.destroySelectPopup();
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
        this.hoverControl && map.addControl(this.hoverControl);
        this.selectControl && map.addControl(this.selectControl);
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
     * Method: onFeaturesRemoved
     * Internal use only.
     */
    onFeaturesRemoved: function (evt) {
        var features = evt.features;
        var layerId = features.length ? features[0].layer.id : "no";
        if (this.hoverPopup) {
            if (layerId == this.hoverPopupLayerId) {
                this.destroyHoverPopup();
            }
        }
        this.destroyListPopup();
        if (this.selectPopup) {
            if (layerId == this.selectPopupLayerId) {
                this.destroySelectPopup();
            }
        }
    },
    
    /**
     * APIMethod: addLayer
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} 
     * popupTemplate - {String} This argument is optional if the layer has the 
     *     property selectPopupTemplate or hoverPopupTemplate (depending on 
     *     whether <hover> property is false or true respectively).
     */
    addLayer: function (layer, options) {
        options = OpenLayers.Util.extend({
                hoverPopupTemplate: layer.hoverPopupTemplate,
                selectPopupTemplate: layer.selectPopupTemplate,
                itemPopupTemplate: layer.itemPopupTemplate
            },
            options
        );
        if ((options.hoverPopupTemplate || options.selectPopupTemplate) && 
                !this.templates[layer.id] && 
                layer instanceof OpenLayers.Layer.Vector) {
            options.hoverPopupTemplate = this.translateTemplate(options.hoverPopupTemplate);
            options.selectPopupTemplate = this.translateTemplate(options.selectPopupTemplate);
            options.itemPopupTemplate = this.translateTemplate(options.itemPopupTemplate);
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
        layer.events.on({
            scope: this,
            "beforefeaturesremoved": this.onFeaturesRemoved
        });
        this.hoverControl && this.hoverControl.setLayer(this.layers);
        this.selectControl && this.selectControl.setLayer(this.layers);
    },
    
    /**
     * APIMethod: removeLayer
     */    
    removeLayer: function (layer) {
        if (this.templates[layer.id]) {
            delete this.templates[layer.id];
            OpenLayers.Util.removeItem(this.layers, layer);
            if (this.active) {
                this.hoverControl && this.hoverControl.setLayer(this.layers);
                this.selectControl && this.selectControl.setLayer(this.layers);
                layer.events.un({
                    scope: this,
                    "beforefeaturesremoved": this.onFeaturesRemoved
                });
            }
        }
    },
    
    /**
     * Method: selectFeature
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} the selected feature.
     */
    selectFeature: function (feature) {
        if (this.selectBoxStarted) {
            if (!this.multipleStarted) {
                this.events.triggerEvent("beforefeaturesselected", {});
                this.firtsFeature = feature;
            }
            this.multipleStarted++;
        } else {
            this.destroyHoverPopup();
            this.destroyListPopup();
            this.showFeatureSelected(feature);
        }
        return this.events.triggerEvent("featureselected", {
            feature: feature, multiple: this.multipleStarted
        });
    },
    
    /**
     * Method: selectBox
     * Callback from the handlerBox set up when <box> selection is true
     *     on.
     *
     * Parameters:
     * position - {<OpenLayers.Bounds> || <OpenLayers.Pixel> }  
     */
    selectBox: function(position) {
        this.multipleStarted = 0;
        this.firtsFeature = null;
        this.selectBoxStarted = true;
        OpenLayers.Control.SelectFeature.prototype.selectBox.apply(
                this.selectControl, arguments);
        this.selectBoxStarted = false;
        if (this.multipleStarted == 1) {
            this.destroyHoverPopup();
            this.destroyListPopup();
            this.showFeatureSelected(this.firtsFeature);
        } else if (this.multipleStarted) {
            this.destroyHoverPopup();
            this.destroyListPopup();
            this.destroySelectPopup();
            var bounds;
            var layers = this.selectControl.layers || [this.selectControl.layer];
            var l, len, layer, sFeatures, html = "";
            var sFeaturesCount = 0;
            for (l=0, len=layers.length; l<len; ++l) {
                layer = layers[l];
                sFeatures = layer.selectedFeatures;
                if (sFeatures.length) {
                    var layerId = layer.id;
                    var itemTemplate = this.templates[layerId].itemPopupTemplate;
                    if (itemTemplate) {
                        var i, len2, feature, itemsHtml = "";
                        for (i=0, len2 = sFeatures.length; i<len2; ++i) {
                            feature = sFeatures[i];
                            if (bounds) {
                                bounds.extend(feature.geometry.getBounds());
                            } else {
                                bounds = feature.geometry.getBounds().clone();
                            }
                            itemsHtml += this.renderTemplate(
                                itemTemplate, 
                                feature
                            ) + "\n";
                        }
                        if (itemsHtml) { 
                            html += this.renderTemplate(
                                this.listLayerItemsTemplate, 
                                {
                                    name: layer.name, 
                                    attribution: layer.attribution, 
                                    itemsCount: sFeatures.length, 
                                    listLayerItemsHtml: itemsHtml
                                }
                            ) + "\n";
                        }
                    }
                }
            }
            if (html) {
                html = this.renderTemplate(
                        this.listLayersTemplate,{listLayersHtml: html});
                this.listPopup = this.showPopup(
                    this.popupSelectClass,
                    this.id + "_list",
                    bounds.getCenterLonLat(),
                    html,
                    this.closeBox
                );
            }
            this.events.triggerEvent("afterfeaturesselected", {html: html});
        }
    },
    
    /**
     * Method: unselectFeature
     * Called when the select feature control unselects a feature.
     *
     * Parameters:
     */
    unselectFeature: function (feature) {
        // Feature unselected, so then hover and select smart popups must be destroyed.
        this.destroyHoverPopup();
        this.destroyListPopup();
        this.destroySelectPopup();
        return this.events.triggerEvent("featureunselected", {
            feature: feature
        });
    },
    
    /**
     * Method: onHover
     * Internal use only.
     */
    onFeaturehighlighted: function (evt) {
        // Can not detect onLeaving because was covered by a select popup, so must be destroyed.
        this.destroyHoverPopup();
        var feature = evt.feature;
        var layerId = feature.layer.id;
        var template = this.templates[layerId].hoverPopupTemplate;
        if (template && this.popupHoverClass) {
            this.hoverPopupLayerId = layerId;
            this.hoverPopup = this.showFeaturePopup(
                template,
                feature,
                this.popupHoverClass,
                this.id + "_hover", 
                false
            );
        }
        return this.events.triggerEvent("featurehighlighted", {
            feature: feature
        });
    },
    
    /**
     * Method: onLeaving
     */
    onFeatureunhighlighted: function (evt) {
        this.destroyHoverPopup();
        return this.events.triggerEvent("featureunhighlighted", {
            feature: evt.feature
        });
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
     * Method: showFeatureSelected
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} the selected feature.
     */
    showFeatureSelected: function (feature) {
        this.destroySelectPopup();
        var layerId = feature.layer.id;
        var template = this.templates[layerId].selectPopupTemplate;
        if (template && this.popupSelectClass) {
            this.selectPopupLayerId = layerId;
            this.selectPopup = this.showFeaturePopup(
                template,
                feature,
                this.popupSelectClass,
                this.id + "_select",
                this.closeBox
            );
        }
    },

    /**
     * APIMethod: showFeatureSelectedById
     *
     * Parameters:
     * featureId - {String} id of the selected feature.
     */
    showFeatureSelectedById: function (featureId) {
        var layers = this.selectControl.layers || [this.selectControl.layer];
        var l, len, layer, sFeatures;
        for (l=0, len=layers.length; l<len; ++l) {
            layer = layers[l];
            sFeatures = layer.selectedFeatures;
            if (sFeatures.length) {
                var layerId = layer.id;
                var i, len2, feature;
                for (i=0, len2 = sFeatures.length; i<len2; ++i) {
                    feature = sFeatures[i];
                    if (feature.id == featureId) {
                        return this.showFeatureSelected(feature);
                    }
                }
            }
        }
    },

    /**
     * Method: showFeaturePopup
     * Internal use only.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>}
     */
    showFeaturePopup: function (template, feature, popupClass, popupId, closeBox) {
        return this.showPopup(
            popupClass, 
            popupId, 
            feature.geometry.getBounds().getCenterLonLat(), 
            this.renderTemplate(template, feature),
            closeBox
        );
    },
    
    /**
     * Method: showPopup
     * Internal use only.
     *
     * Parameters:
     */
    showPopup: function (popupClass, popupId, lotLat, html, closeBox) {
        if (!popupClass) {
            return null;
        }
        if (html) {
            var popup = new popupClass(
                popupId, 
                lotLat,
                new OpenLayers.Size(100,100),
                html
            );
            // The API of the popups is not homogeneous, closeBox may be the fifth or sixth argument, it depends!
            // So forces closeBox using other ways.
            if (closeBox) { 
                var me = this;
                popup.addCloseBox(function () {
                    // unselect to can select itself after close by closeBox.
                    me.selectControl.unselectAll();
                });
                popup.closeDiv.style.zIndex = 1;
            }
            popup.autoSize = true;
            this.map.addPopup(popup);
            return popup;
        } else {
            return null;
        }
    },
    
        /**
     * Method: destroyHoverPopup
     * Internal use only.
     */
    destroyHoverPopup: function () {
        this.destroyPopup(this.hoverPopup);
        this.hoverPopupLayerId = "";
        this.hoverPopup = null;
    },
    
    /**
     * Method: destroySelectPopup
     * Internal use only.
     */
    destroySelectPopup: function () {
        this.destroyPopup(this.selectPopup);
        this.selectPopupLayerId = ""; 
        this.selectPopup = null;
    },

    /**
     * Method: destroyListPopup
     * Internal use only.
     */
    destroyListPopup: function () {
        this.destroyPopup(this.listPopup);
        this.listPopup = null;
    },
    
    /**
     * Method: destroyPopup
     * Internal use only.
     */
    destroyPopup: function (popup) {
        if (popup) {
            if (popup.id) { // The popup may have been destroyed by another process
                if (this.map) {
                    this.map.removePopup(popup);
                }
                popup.destroy(); 
            }
        }
    },

    /**
     * Function: translateTemplate
     *
     * Parameters: 
     * template - {String} || {Function} 
     */
    translateTemplate: function (template) {
        if (typeof template == 'string') {
            template = template.replace( // internationalize template.
                // pattern: ...{{OpenLayers.i18n("keyword")}}...
                /\{\{OpenLayers.i18n\(["']?([\s\S]+?)["']?\)\}\}/g,
                function (a,key) {
                    return OpenLayers.i18n(key);
                }
            );
            return this.compileTemplate(template);
        } else {
            return template;
        }
    },
    
    /**
     * APIFunction: compileTemplate
     *
     * Parameters:
     */
    compileTemplate: function (template) {
        return template;
    },
    
    /**
     * APIMethod: renderTemplate
     * Internal use only.
     *
     * Parameters:
     */
    renderTemplate: function (template, data) {
        var html;
        if (typeof template == 'string') {
            if (data.attributes) {
                data = data.attributes;
            }
            html = template.replace(
                /\{\{([\s\S]+?)\}\}/g, 
                function (a,name) {
                    return data[name] || "";
                }
            );
        } else if (typeof template == 'function') {
            html = template(data);
        }
        return html;
    },
    
    CLASS_NAME: "OpenLayers.Control.FeaturePopups"
});

/**
 * APIFunction: getTemplate
 */
OpenLayers.Control.FeaturePopups.getTemplate = function (url) {
    var response = OpenLayers.Request.GET({url:url, async:false});
    var html;
    if (response.responseText) {
        html = response.responseText;
    } else {
        // If error loads text error as template
        html = response.status + "-" + response.statusText; 
    }
    return html;
};
    