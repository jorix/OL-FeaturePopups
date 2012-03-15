Proposal for a new control: FeaturePopups for OpenLayers
========================================================

**FeaturePopups** wraps the management of popups and SelectFeature control of [OpenLayers](http://openlayers.org).

The branch that is considered stable is: [1-FeaturePopups](https://github.com/jorix/OL-FeaturePopups/tree/1-FeaturePopups)

New goals:
----------
 * Multi selection.
 * Safe selection: when it is used eg zoom-in and later zoom-out (on Cluster and BBOX strategies)
 * Can display data when a layer is loaded.
 * Force *hover popups* to follow the cursor.
 * Shows *select popups* where the cursor is pressed.
 * Common interface for popups.

The branch **gh-pages** may not be stable (is equivalent to *master*)
 
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
--------
 * Adaptation of OpenLayers example to use `FeaturePopups`: [sundials.html](http://jorix.github.com/OL-FeaturePopups/examples/sundials.html)
 * Adaptation to show the advantage of using `fid` in the lists when using the strategy BBOX [georss-flickr.html](http://jorix.github.com/OL-FeaturePopups/examples/georss-flickr.html)
 * Adaptation of [olsocial](http://gis.prodevelop.es/olsocial/) to use `FeaturePopups`: [olsocial.html](http://jorix.github.com/OL-FeaturePopups/examples/olsocial.html)
 * Use complex: [feature-popups.html](http://jorix.github.com/OL-FeaturePopups/examples/feature-popups.html)
 * Use complex with lists outside the map div [feature-popups-external.html](http://jorix.github.com/OL-FeaturePopups/examples/feature-popups-external.html)

Features:
--------
 * Prepare the contents of the popup using templates.
    * Templates as strings or functions.
    * Allows internationalization of the labels in templates.
 * Show popups by selection (click) or hover from multiple vector layers.
 * Multiple selection using box and show list of features selected into an popup.
 * Proper popups on clustered features (OpenLayers.Strategy.Cluster)
 
TODO:
----
 * Write tests.
 * Documenting more.
 * Study improvements in `onFeaturesremoved` method?
 * Better manage auto-size on OpenLayers popups?
 
The beginnings
--------------
This development began with the request [olsocial](http://osgeo-org.1560.n6.nabble.com/HTML-template-popup-manager-td3889159.html) 
of Javier Carrasco, but has gone far beyond its initial request.
