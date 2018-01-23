/* Copyright 2011-2018 by Xavier Mamano http://github.com/jorix/OL-FeaturePopups
 * Published under MIT license. */

/**
 * @requires FeaturePopups.js
 */

/**
 * Class: OpenLayers.Control.FeaturePopups
 * Extend of FeaturePopups control
 */
OpenLayers.Util.extend(OpenLayers.Control.FeaturePopups.prototype, {
    /**
     * APIMethod: showSingleFeatureById
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} The layer of selected feature.
     * featureId - {String} id of the feature, see featureContext at <addLayer>.
     */
    showSingleFeatureById: function(layer, featureId) {
        var layerObj = this.getLayerObj(layer);
        if (layerObj) {
            layerObj.showSingleFeatureById(featureId);
        } else {
            var popupObj = this.popupObjs.listItem;
            popupObj && popupObj.clear();
        }
    },

    /**
     * APIMethod: addSelectionByIds
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} The layer of features to select.
     * featureIds - Array({String}) List of feature ids to be
     *     added to selection.
     * silent - {Boolean} Supress "selectionchanged" event triggering. Default
     *     is false.
     */
    addSelectionByIds: function(layer, featureIds, silent) {
        var layerObj = this.getLayerObj(layer);
        layerObj && layerObj.addSelectionByIds(featureIds, silent);
    },

    /**
     * APIMethod: setSelectionByIds
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} The layer of features to select.
     * featureIds - Array({String}) List of feature ids to set as select.
     * silent - {Boolean} Supress "selectionchanged" event triggering. Default
     *     is false.
     */
    setSelectionByIds: function(layer, featureIds, silent) {
        var layerObj = this.getLayerObj(layer);
        layerObj && layerObj.setSelectionByIds(featureIds, silent);
    },

    /**
     * APIMethod: removeSelectionByIds
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} The layer of selected features.
     * featureIds - Array({String}) List of feature ids to be
     *     removed to selection.
     * silent - {Boolean} Supress "selectionchanged" event triggering. Default
     *     is false.
     */
    removeSelectionByIds: function(layer, featureIds, silent) {
        var layerObj = this.getLayerObj(layer);
        layerObj && layerObj.removeSelectionByIds(featureIds, silent);
    },

    /**
     * APIFunction: getSelectionIds
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} The layer of selected features.
     */
    getSelectionIds: function(layer) {
        var layerObj = this.getLayerObj(layer);
        if (layerObj) {
            return layerObj.getSelectionIds();
        } else {
            return [];
        }
    }
});


/**
 * Class: OpenLayers.Control.FeaturePopups.Layer
 * Extend of FeaturePopups.Layer component of FeaturePopups control
 */
OpenLayers.Util.extend(OpenLayers.Control.FeaturePopups.Layer.prototype, {

    /**
     * APIMethod: addSelectionByIds
     *
     * Parameters:
     * featureIds - {Array(String)} List of feature ids to be
     *     added to selection.
     * silent - {Boolean} Supress "selectionchanged" event triggering. Default
     *     is false.
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
     * silent - {Boolean} Supress "selectionchanged" event triggering. Default
     *     is false.
     */
    setSelectionByIds: function(featureIds, silent) {
        this.selection = {};
        this.addSelectionByIds(featureIds, silent);
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
            if (feature.cluster) {
                for (var ii = 0, lenlen = feature.cluster.length;
                                                            ii < lenlen; ii++) {
                    if (savedSF[this.getFeatureId(feature.cluster[ii])]) {
                        selected = true;
                        break;
                    }
                }
            } else if (savedSF[this.getFeatureId(feature)]) {
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
     * silent - {Boolean} Supress "selectionchanged" event triggering. Default
     *     is false.
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
            if (feature.cluster) {
                for (var ii = 0, lenlen = feature.cluster.length;
                                                            ii < lenlen; ii++) {
                    if (savedSF[this.getFeatureId(feature.cluster[ii])]) {
                        selected = true;
                        break;
                    }
                }
            } else if (savedSF[this.getFeatureId(feature)]) {
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
                    ids.push(this.getFeatureId(features[i]));
                }
            }
        }
        return ids;
    }
});
