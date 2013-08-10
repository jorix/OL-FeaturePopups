Changelog
=========

Development code that is considered stable in the is in the *gh-pages* branch (note that *master* branch does not exist)


On development
--------------

(open for suggestions)


[v1.0.0](https://github.com/jorix/OL-FeaturePopups/releases/tag/v1.0.0)
-----------------------------------------------------------------------

#### Improvements
 * Allow use context in template by new featureContext option on addLayes method: #8
 * Right use of popup event arguments: #4 & #6
 * Don't overlap list popup with a item popup: #3

#### Changes
 * Not used cursor location in the popups from the clusters: #7
 * New method *clear* to clear selecction and popups.

#### Bug fixes
 * No popup is generated if no template (single or item): #11
 * Allow abort display a popup from a cluster with one element: #9
 * Remove click inheritance between cluster popup and child popup: #5


[v0.10.0](https://github.com/jorix/OL-FeaturePopups/releases/tag/v0.10.0)
-----------------------------------------------------------------------

#### Changes
 * Refactor: two new internal classes FeaturePopups.Popup & FeaturePopups.Layer


[v0.9.0](https://github.com/jorix/OL-FeaturePopups/releases/tag/v0.9.0)
-----------------------------------------------------------------------

#### Changes
 * The first parameter of some functions becomes the layer instead of its id (*xxxSelectionById*, *getSelectionIds* & *showSingleFeatureById*)
 * The functions mentioned in previous paragraph have been moved to *FeaturePopupsExtend.js*


[v0.2.0](https://github.com/jorix/OL-FeaturePopups/releases/tag/v0.2.0)
-----------------------------------------------------------------------

#### Changes
 * The layers can no longer be added implicitly, it is necessary to use the `addLayer` method or `layers` option of the constructor.
 * The templates are grouped into the object "templates" in options of `addLayer` method.
 * The scope of events of `FeaturePopups.Popup` and `FeaturePopups.Layer` has changed during development, now if you want to access to the control should be used `evt.object.control` instead of `evt.object`.
 

