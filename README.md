Proposal for a new control for OpenLayers: FeaturePopups
========================================================

**FeaturePopups** wraps the management of popups and SelectFeature control of [OpenLayers](http://openlayers.org).

Please, open a **issue** if you have questions or problems using this control.
 
Operation:
---------
Assign templates to the layers is the only requirement to display popups. 

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

The control shows two types of selection popups: **single feature** or **features list** (with two or more features). Into a list of features can be seen each feature in a single popup.

It also supports hover popups (both kinds *single feature* and *features list*) simultaneously with the selection 

Examples:
---------
**Using the control and templates to display popups**:

 * Multi layer, multi selection and uses *Strategy.Cluster*: [feature-popups.html](http://jorix.github.com/OL-FeaturePopups/examples/feature-popups.html)
 * Same as above but the lists of features are displayed outside the map div: [feature-popups-external.html](http://jorix.github.com/OL-FeaturePopups/examples/feature-popups-external.html)

**Grids to show feature attributes using `FeaturePopups`**:

 * [grid-jqGrid-features.html](http://jorix.github.com/OL-FeaturePopups/examples/grid-jqGrid-features.html) (uses jqGrid to show features and highlight the selection)
 * [grid-jqGrid-selection.html](http://jorix.github.com/OL-FeaturePopups/examples/grid-jqGrid-selection.html) (uses jqGrid to show the selection)
 * [grid-SlickGrid-features.html](http://jorix.github.com/OL-FeaturePopups/examples/grid-SlickGrid-features.html) (uses SlickGrid to show features and highlight the selection)
 * [grid-SlickGrid-selection.html](http://jorix.github.com/OL-FeaturePopups/examples/grid-SlickGrid-selection.html) (uses SlickGrid to show the selection)
 
**Adaptation of OpenLayers examples to use `FeaturePopups`**:

 * [georss-flickr-FP.html](http://jorix.github.com/OL-FeaturePopups/examples/georss-flickr-FP.html) (custom templates instead of *onSelect* function, code simpler)
 * [highlight-feature-FP.html](http://jorix.github.com/OL-FeaturePopups/examples/highlight-feature-FP.html) (two controls in one!)
 * [strategy-cluster-FP.html](http://jorix.github.com/OL-FeaturePopups/examples/strategy-cluster-FP.html) (don't use "Jugl.js" and uses "popupdisplayed" event instead of "featureselected")
 * [sundials-FP.html](http://jorix.github.com/OL-FeaturePopups/examples/sundials-FP.html) (custom templates instead of *onFeatureXxxxx* functions, code simpler)
 
**Adaptation of GeoExt examples to use `FeaturePopups` and GeoExt popups**: 

 * [popup-auto-position-FP.html](http://jorix.github.com/OL-FeaturePopups/examples-geoext/popup-auto-position-FP.html) (uses custom popups)

Features:
--------
 * Prepare the contents of the popup using templates.
    * Templates as strings or functions.
    * Allows internationalization of the labels in templates.
 * Show popups by selection (click) or hover from multiple vector layers.
 * Multiple selection using box and show list of features selected into an popup.
 * Proper popups on clustered features (OpenLayers.Strategy.Cluster)
 * Safe selection: Features remain selected even after zooming or moving the map (using Cluster and BBOX strategies)
 * Safe selection also allows that `clickout` not fails after a zoom (using Cluster or BBOX strategies)
 * Triggers appropriate events when changing the selection or a layer features (to prevent flickering or other nuisances, events are triggered only if there has been an effective change)
 * By default: 
    * Multi selection is enabled, 
    * *hover popups* follows the cursor (to prevent flickering)
    * *select popups* are shown where the cursor is pressed.
 * Ability to customize the operation of the control.
 * Allow simultaneously display "list" and "itemList" popups without much overlap.

Documentation:
--------------
 * [API for users](http://jorix.github.com/OL-FeaturePopups/doc/FeaturePopups/api)
 * For developers [all elements](http://jorix.github.com/OL-FeaturePopups/doc/FeaturePopups/all)

Adjustments on OL popups for proper calculation of the autosize
---------------------------------------------------------------
Have been proposed to OpenLayers team a set of patches to fix some autosize issues. These patches are grouped all in a code to can use these patches also in releases 2.11 and 2.12, see: [lib/patches_OL-popup-autosize.js]

The problems were fixed:
  * Remove extra padding: [autoSize-padding-dev.html][autoSize-padding-dev]
  * Narrow content when displaying scroll bar: [popups-overflow-dev.html](http://jorix.github.com/OL-FeaturePopups/OL-Popup-issues/popups-overflow-dev.html)
  * Adjust the insertion point using FramedCloud popup: [popups-FramedCloud-insertion-point.html](http://jorix.github.com/OL-FeaturePopups/OL-Popup-issues/popups-FramedCloud-insertion-point.html)
  * Avoid breaking the "OpenLayers.String.format" execution [#OL-631](https://github.com/openlayers/openlayers/pull/631)

Patches to fix other problems not yet proposed to OL, but applied in this code:
  * Chrome+ABP does not consider the size of images: [popups-img-chrome-dev.html](http://jorix.github.com/OL-FeaturePopups/OL-Popup-issues/popups-img-chrome-dev.html)
  * Consider the border on `contentDisplayClass`: [autoSize-padding-dev.html][autoSize-padding-dev]
  * Margin should be considered when padding on `contentDisplayClass` is zero: [popups-margin-dev.html](http://jorix.github.com/OL-FeaturePopups/OL-Popup-issues/popups-margin-dev.html)

[autoSize-padding-dev]: http://jorix.github.com/OL-FeaturePopups/OL-Popup-issues/autoSize-padding-dev.html
[lib/patches_OL-popup-autosize.js]: https://github.com/jorix/OL-FeaturePopups/blob/gh-pages/lib/patches_OL-popup-autosize.js
 
Versions:
--------
 * **v1.0.0** It is considered a stable version.

Compatibility with OpenLayers releases:
---------------------------------------
The `FeaturePopups` v0.9.0 or higer works correctly with releases 2.11 and 2.12 and whith development version. This also includes patches for OL grouped in [lib/patches_OL-popup-autosize.js].
 
Compatibility notes with old version "v0.2.0":
---------------------------------------------
 * The layers can no longer be added implicitly, it is necessary to use the `addLayer` method or `layers` option of the constructor.
 * The templates are grouped into the object "templates" in options of `addLayer` method.
 * The scope of events of `FeaturePopups.Popup` and `FeaturePopups.Layer` has changed during development, now if you want to access to the control should be used `evt.object.control` instead of `evt.object`.
 
