Proposal for a new control: FeaturePopups for OpenLayers
========================================================

**FeaturePopups** wraps the management of popups and SelectFeature control of [OpenLayers](http://openlayers.org).

The branch that is considered stable is: [1-FeaturePopups](https://github.com/jorix/OL-FeaturePopups/tree/1-FeaturePopups)

Branch **gh-pages** may be not stable (is equivalent to *master*), there are no major changes expected in this branch and starts the process of consolidation.

Please, open a **issue** if you have questions or problems using this control.
 
Operation:
---------
Assign templates to the layers is the only requirement for the popups can be displayed. 

Example:

```javascript
    ...
    var myLayer = new OpenLayers.Layer.Vector("My layer", {...}); 
    ...
    var fpControl = new OpenLayers.Control.FeaturePopups();
    fpControl.addLayer(mylayer, {
        templates: {
            single: "<h2>${.name}</h2>${.description}"
            // .name is attributes.name on features, and so on.
        }
    });
    map.addControl(fpControl);
    ...
```

The control shows two types of selection popups: **single feature** or **features list** (with two or more features). And in a list popup can be seen each feature in a single popup.

Also supports hover popups simultaneously with the selection. In the case of a cluster (with more than one feature) can display all items oor only display the number of items.

Examples:
---------
**Adaptation of OpenLayers examples to use `FeaturePopups`**:

 * [georss-flickr-FP.html](http://jorix.github.com/OL-FeaturePopups/examples/georss-flickr-FP.html) (template)
 * [strategy-cluster-FP.html](http://jorix.github.com/OL-FeaturePopups/examples/strategy-cluster-FP.html) (uses event listener "popupdisplayed" and remove Jugl.js)
 * [sundials-FP.html](http://jorix.github.com/OL-FeaturePopups/examples/sundials-FP.html) (all templates and selection box)
 
**Grids to show feature attributes using `FeaturePopups`**:

 * [grid-jqGrid-features.html](http://jorix.github.com/OL-FeaturePopups/examples/grid-jqGrid-features.html) (uses jqGrid to show features and selection)
 * [grid-jqGrid-selection.html](http://jorix.github.com/OL-FeaturePopups/examples/grid-jqGrid-selection.html) (uses jqGrid to show selection)
 * [grid-SlickGrid-features.html](http://jorix.github.com/OL-FeaturePopups/examples/grid-SlickGrid-features.html) (uses SlickGrid to show features and selection)
 * [grid-SlickGrid-selection.html](http://jorix.github.com/OL-FeaturePopups/examples/grid-SlickGrid-selection.html) (uses SlickGrid to show selection)
 
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
 * Safe selection: Features remain selected even though zoom or pan (on Cluster and BBOX strategies) are performed.
 * Triggers appropriate events when changing the selection or a layer features (to prevent flickering or other nuisances events are triggered only if there has been an effective change)
 * By default: 
    * Multi selection is enabled, 
    * *hover popups* follows the cursor
    * *select popups* are shown where the cursor is pressed.
 * Ability to customize the operation of the control.
 
Compatibility notes (with previous version "1-FeaturePopups"):
-------------------------------------------------------------
 * The layers can no longer be added implicitly, it is necessary to use the `addLayer` method or `layers` option of the constructor.
 * The templates are grouped into the object "templates" in options of `addLayer` method.
 * The scope of events has changed during development, now if you want to access to the control should be used `evt.object.control` instead of `evt.object`.
 
Pending:
--------
 * Applying patches to adjust the automatic size problems of the OL-popups.
 * Review examples of the grids.
