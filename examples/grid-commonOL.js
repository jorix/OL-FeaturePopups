/**
 * A specific format for parsing Flickr API JSON responses.
 */
OpenLayers.Format.Flickr = OpenLayers.Class(OpenLayers.Format, {
    read: function(obj) {
        if (obj.stat === 'fail') {
            throw new Error(
                ['Flickr failure response (',
                 obj.code,
                 '): ',
                 obj.message].join(''));
        }
        if (!obj || !obj.photos ||
           !OpenLayers.Util.isArray(obj.photos.photo)) {
            throw new Error(
                'Unexpected Flickr response');
        }
        var photos = obj.photos.photo, photo,
            x, y, point,
            feature, features = [];
        for (var i = 0, l = photos.length; i < l; i++) {
            photo = photos[i];
            x = photo.longitude;
            y = photo.latitude;
            point = new OpenLayers.Geometry.Point(x, y);
            feature = new OpenLayers.Feature.Vector(point, {
                title: photo.title,
                img_url: photo.url_s,
                size: photo.width_s + 'x' + photo.height_s
            });
            features.push(feature);
        }
        return features;
    }
});

/**
 * The vectorial layer
 */
var vLayer = new OpenLayers.Layer.Vector('Photos', {
    projection: 'EPSG:4326',
    strategies: [
        new OpenLayers.Strategy.Fixed(),
        new OpenLayers.Strategy.Cluster()
    ],
    protocol: new OpenLayers.Protocol.Script({
        url: 'http://api.flickr.com/services/rest',
        params: {
            api_key: '18351da2113513f3ba4eef6b99b4dcb6',
            format: 'json',
            method: 'flickr.photos.search',
            extras: 'geo,url_s',
            per_page: 100,
            page: 1,
            bbox: [-180, -90, 180, 90]
        },
        callbackKey: 'jsoncallback',
        format: new OpenLayers.Format.Flickr()
    }),
    styleMap: new OpenLayers.StyleMap({
        'default': new OpenLayers.Style({
                pointRadius: '${radius}',
                fillColor: '#ffcc66',
                fillOpacity: 0.8,
                strokeColor: '#cc6633',
                strokeWidth: 2,
                strokeOpacity: 0.8
            }, {
                context: {
                    radius: function(feature) {
                        return Math.min(feature.attributes.count * .5, 7) + 3;
                    }
                }
        }),
        'select': {
            fillColor: '#8aeeef',
            strokeColor: '#32a8a9'
        },
        'temporary': {
            strokeColor: '#32a8a9'
        }
    })
});

/**
 * The map
 */
var map = new OpenLayers.Map('map', {
    layers: [new OpenLayers.Layer.OSM(), vLayer]
});
map.setCenter(new OpenLayers.LonLat(0, 0), 1);
map.addControl(new OpenLayers.Control.LayerSwitcher());
