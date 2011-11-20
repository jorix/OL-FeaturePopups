Proposal for a new control: FeaturePopups for OpenLayers
========================================================

This control wraps the management of popups and SelectFeature control of [OpenLayers](http://openlayers.org).

Features:
--------
 * Prepare the contents of the popup using templates.
    * Templates as strings or functions.
    * Allows external templates renderers.
 * Show popups by selection or hover from multiple vector layers.
 * Allows to register listeners on the events of selection and hover (Advanced)
 * Multiple selection using box and show list of features selecteds into popup.
 * Allows to register listeners on the events of selection and hover.
 
TODO:
----
 * Write tests.
 * Documenting.
 * More constructor options?
 * Show a popup of a single feature from  a popup of a list of features.
 * Show popups of a clustered features as a list features.
 
The beginnings
--------------
This development began with the request [olsocial](http://osgeo-org.1803224.n2.nabble.com/HTML-template-popup-manager-tc6948565.html) 
of Javier Carrasco, but has gone far beyond its initial request.
