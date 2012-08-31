/**
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/** api: example[popup]
 *  Feature Popup
 *  -------------
 *  Display a popup with feature information, which is positioned automatically.
 */

var mapPanel;

Ext.onReady(function() {

    var bogusText = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.';
    var bogusCount = 1;

    // create a vector layer, add features into it
    var vectorLayer = new OpenLayers.Layer.Vector('vector');
    vectorLayer.addFeatures([
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(-75, 45), {bogusCount: bogusCount++, bogusText: bogusText}
        ), new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(+75, -45), {bogusCount: bogusCount++, bogusText: bogusText}
        ), new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(+75, +45), {bogusCount: bogusCount++, bogusText: bogusText}
        ), new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(-75, -45), {bogusCount: bogusCount++, bogusText: bogusText}
        )]

    );

    // define "createPopup" function
    function createPopup(map, lonLat, html, onClose) {
        var popup = new GeoExt.Popup({
            title: 'My Popup',
            map: map,
            location: new OpenLayers.Geometry.Point(lonLat.lon, lonLat.lat),
            width: 200,
            html: html,
            maximizable: true,
            collapsible: true,
            anchorPosition: 'auto'
        });
        // unselect feature when the popup
        // is closed
        popup.on({
            close: onClose
        });
        popup.show();
        return {
            div: popup.getEl().dom,
            destroy: function() {popup.destroy()}
        };
    }

    // create Ext window including a map panel
    var mapwin = new Ext.Window({
        layout: 'fit',
        title: 'Map',
        closeAction: 'hide',
        width: 650,
        height: 356,
        x: 50,
        y: 100,
        items: {
            xtype: 'gx_mappanel',
            region: 'center',
            layers: [
                new OpenLayers.Layer.WMS(
                    'OpenLayers WMS',
                    'http://vmap0.tiles.osgeo.org/wms/vmap0',
                    {layers: 'basic'}),
                vectorLayer
            ]
        }
    });
    mapwin.show();

    mapPanel = mapwin.items.get(0);
    mapPanel.map.addControl(new OpenLayers.Control.FeaturePopups({
            popupSingleOptions: {popupClass: createPopup},
            popupListOptions: {popupClass: createPopup},
            popupListItemOptions: {popupClass: createPopup},
            layers: [[
                vectorLayer, {
                    templates: {
                        single: '<div>${.bogusCount} - ${.bogusText}</div>',
                        item: '<li><a href=\"#\" ${showPopup()}>${.bogusCount} - ${.bogusText}</a></li>'
                    }
                }
            ]]
        })
    );
});
