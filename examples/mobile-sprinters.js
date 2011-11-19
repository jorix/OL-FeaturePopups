// Sprinters features
// ------------------
function getSprintersFeatures() {
    var features = {
        "type": "FeatureCollection",
        "features": [
            { "type": "Feature", "geometry": {"type": "Point", "coordinates": [1332700, 7906300]},
                "properties": {"Name": "Igor Tihonov", "Country":"Sweden", "City":"Gothenburg"}},
            { "type": "Feature", "geometry": {"type": "Point", "coordinates": [790300, 6573900]},
                "properties": {"Name": "Marc Jansen", "Country":"Germany", "City":"Bonn"}},
            { "type": "Feature", "geometry": {"type": "Point", "coordinates": [568600, 6817300]},
                "properties": {"Name": "Bart van den Eijnden", "Country":"Netherlands", "City":"Utrecht"}},
            { "type": "Feature", "geometry": {"type": "Point", "coordinates": [-7909900, 5215100]},
                "properties": {"Name": "Christopher Schmidt", "Country":"United States of America", "City":"Boston"}},
            { "type": "Feature", "geometry": {"type": "Point", "coordinates": [-937400, 5093200]},
                "properties": {"Name": "Jorge Gustavo Rocha", "Country":"Portugal", "City":"Braga"}},
            { "type": "Feature", "geometry": {"type": "Point", "coordinates": [-355300, 7547800]},
                "properties": {"Name": "Jennie Fletcher ", "Country":"Scotland", "City":"Edinburgh"}},
            { "type": "Feature", "geometry": {"type": "Point", "coordinates": [657068.53608487, 5712321.2472725]},
                "properties": {"Name": "Bruno Binet ", "Country":"France", "City":"Chambéry"}},
            { "type": "Feature", "geometry": {"type": "Point", "coordinates": [667250.8958124, 5668048.6072737]},
                "properties": {"Name": "Eric Lemoine", "Country":"France", "City":"Theys"}},
            { "type": "Feature", "geometry": {"type": "Point", "coordinates": [653518.03606319, 5721118.5122914]},
                "properties": {"Name": "Antoine Abt", "Country":"France", "City":"La Motte Servolex"}},
            { "type": "Feature", "geometry": {"type": "Point", "coordinates": [657985.78042416, 5711862.6251028]},
                "properties": {"Name": "Pierre Giraud", "Country":"France", "City":"Chambéry"}},
            { "type": "Feature", "geometry": {"type": "Point", "coordinates": [742941.93818208, 5861818.9477535]},
                "properties": {"Name": "Stéphane Brunner", "Country":"Switzerland", "City":"Paudex"}},
            { "type": "Feature", "geometry": {"type": "Point", "coordinates": [736082.61064069, 5908165.4649505]},
                "properties": {"Name": "Frédéric Junod", "Country":"Switzerland", "City":"Montagny-près-Yverdon"}},
            { "type": "Feature", "geometry": {"type": "Point", "coordinates": [771595.97057525, 5912284.7041793]},
                "properties": {"Name": "Cédric Moullet", "Country":"Switzerland", "City":"Payerne"}},
            { "type": "Feature", "geometry": {"type": "Point", "coordinates": [744205.23922364, 5861277.319748]},
                "properties": {"Name": "Benoit Quartier", "Country":"Switzerland", "City":"Lutry"}},
            { "type": "Feature", "geometry": {"type": "Point", "coordinates": [1717430.147101, 5954568.7127565]},
                "properties": {"Name": "Andreas Hocevar", "Country":"Austria", "City":"Graz"}},
            { "type": "Feature", "geometry": {"type": "Point", "coordinates": [-12362007.067301,5729082.2365672]},
                "properties": {"Name": "Tim Schaub", "Country":"United States of America", "City":"Bozeman"}}
        ]
    };
    var reader = new OpenLayers.Format.GeoJSON();
    return reader.read(features);
}

