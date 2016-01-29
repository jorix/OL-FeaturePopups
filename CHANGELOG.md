Changelog
=========

Development code that is considered stable in the is in the *gh-pages* branch (note that *master* branch does not exist)


On development
--------------

(open for suggestions)


[v1.1.3](https://github.com/jorix/OL-FeaturePopups/releases/tag/v1.1.3)
-----------------------------------------------------------------------

#### Bug fixes
 * #26: Strange errors with removeLayer
 * #29: On click link don't shows a single popup

 
[v1.1.2](https://github.com/jorix/OL-FeaturePopups/releases/tag/v1.1.2)
-----------------------------------------------------------------------

#### Bug fixes
 * Respect the maxSize if specified by *popupClass* that fixes bug: #23

#### Changes
 * Better determine if a *popupClass* of a *popupOption* key is compatible with *OpenLayers.Popup*.


[v1.1.1](https://github.com/jorix/OL-FeaturePopups/releases/tag/v1.1.1)
-----------------------------------------------------------------------

#### Bug fixes
 * Make a correct unselection of a layer that fixes bugs: #18 & #19


[v1.1.0](https://github.com/jorix/OL-FeaturePopups/releases/tag/v1.1.0)
-----------------------------------------------------------------------

#### Improvements
 * Is available the *pupupOptions* on addLayer options to allow display the list popup separate from other layers.

#### Compatibility notes
 * Methods *xxxSelectionByIds* (add, set or remove), *showSingleFeatureById* and *getSelectionIds* are moved to a separate code named *FeaturePopupsExtend.js*.
 * First parameters *xxxSelectionByIds*, *showSingleFeatureById* and *getSelectionIds* functions becomes the layer instead of its id.
 * *unselectOnClose* of *OpenLayers.Control.FeaturePopups.Popup* is replaced by *unselectFunction*.


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

#### Compatibility notes
 * The first parameter of some functions becomes the layer instead of its id (*xxxSelectionById*, *getSelectionIds* & *showSingleFeatureById*)
 * The functions mentioned in previous paragraph have been moved to *FeaturePopupsExtend.js*


[v0.2.0](https://github.com/jorix/OL-FeaturePopups/releases/tag/v0.2.0)
-----------------------------------------------------------------------

#### Compatibility notes
 * The layers can no longer be added implicitly, it is necessary to use the `addLayer` method or `layers` option of the constructor.
 * The templates are grouped into the object "templates" in options of `addLayer` method.
 * The scope of events of `FeaturePopups.Popup` and `FeaturePopups.Layer` has changed during development, now if you want to access to the control should be used `evt.object.control` instead of `evt.object`.
 

