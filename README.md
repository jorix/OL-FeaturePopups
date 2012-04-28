Proposal for a new control: FeaturePopups for OpenLayers
========================================================

**FeaturePopups** wraps the management of popups and SelectFeature control of [OpenLayers](http://openlayers.org).

The branch that is considered stable is: [1-FeaturePopups](https://github.com/jorix/OL-FeaturePopups/tree/1-FeaturePopups)

New goals:
----------
 * Multi selection, **done**!
 * Safe selection **done**!: when it is used eg zoom-in and later zoom-out (on Cluster and BBOX strategies)
 * Can display data when a layer is loaded **done**.
 * Force *hover popups* to follow the cursor **done**!.
 * Shows *select popups* where the cursor is pressed (except for a single point) **done**!
 * Unify behaviors **done**! Must use new "mode" "selectOptions" "hoverOptions" and "boxSelectionOptions" properties to support multiple behaviors. 
 * Common interface for popups **done**!
 * Better manage auto-size on OpenLayers popups.
 * Sort the features by fid or id **done**, especially when they are clustered.

Branch **gh-pages** may be not stable (is equivalent to *master*)
 
Operation:
---------
No need to interact with the control only must be added to the map.

Assign templates to the layers is the only requirement for the popups can be displayed. 

Example:

```javascript
    ...
    map.addLayer(
        new OpenLayers.Layer.Vector("My layer", {
            selectPopupTemplate: "<h2>${.name}</h2>${.description}"
        })
    ); // .name is attributes.name on features, and so on.
    ...
    map.addControl(new OpenLayers.Control.FeaturePopups());
    ...
```

The control shows two types of selection popups: **single feature** or **features list** (with two or more features). And in a list popup can be seen each feature in a single popup.

Currently hover popups are simpler, shows data of a single feature or in the case of a cluster (with more than one feature) indicates only the number of elements and layer name.

Examples:
---------
**Adaptation of OpenLayers examples to use `FeaturePopups`**:

 * [georss-flickr-FP.html](http://jorix.github.com/OL-FeaturePopups/examples/georss-flickr-FP.html) (template)
 * [strategy-cluster-FP.html](http://jorix.github.com/OL-FeaturePopups/examples/strategy-cluster-FP.html) (uses event listener "popupdisplayed" and remove Jugl.js)
 * [sundials-FP.html](http://jorix.github.com/OL-FeaturePopups/examples/sundials-FP.html) (all templates and selection box)
 
**Grids to show feature attributes using `FeaturePopups`**:

 * [grid-jqGrid-features.html](http://jorix.github.com/OL-FeaturePopups/examples/grid-jqGrid-features.html) (uses jqGrid to show features and selection)
 * [grid-jqGrid-selection.html](http://jorix.github.com/OL-FeaturePopups/examples/grid-jqGrid-selection.html) (uses jqGrid to show selection)
 
**Adaptation of GeoExt examples to use `FeaturePopups` and GeoExt popups**: 

 * [popup-auto-position-FP.html](http://jorix.github.com/OL-FeaturePopups/examples-geoext/popup-auto-position-FP.html) (custom popups)

**Complex usage of popup templates**:

 * Selection box: [feature-popups.html](http://jorix.github.com/OL-FeaturePopups/examples/feature-popups.html)
 * Data from a list of features outside the map div [feature-popups-external.html](http://jorix.github.com/OL-FeaturePopups/examples/feature-popups-external.html)

Features:
--------
 * Prepare the contents of the popup using templates.
    * Templates as strings or functions.
    * Allows internationalization of the labels in templates.
 * Show popups by selection (click) or hover from multiple vector layers.
 * Multiple selection using box and show list of features selected into an popup.
 * Proper popups on clustered features (OpenLayers.Strategy.Cluster)

The beginnings
--------------
This development began with the request [olsocial](http://osgeo-org.1560.n6.nabble.com/HTML-template-popup-manager-td3889159.html) 
of Javier Carrasco, but has gone far beyond its initial request.
