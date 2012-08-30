/* Copyright 2012 Xavier Mamano, http://github.com/jorix/OL-FeaturePopups
 * Published under MIT license. All rights reserved. */

/** 
 * Loads selected OpenLayers release as instructed in URL parameters.
 *
 * THIS CODE IS ONLY INTENDED TO HELP MAKE TESTS AND DEBUGGING.
 *
 * URL parameters:
 *  - release: ["dev", "2.12" ... "2.9"]
 *  - lib: Use lib for debug (true if lib=\w+)
 *  - patch: Use aditional patch "patches_OL-popup-autosize.js" (true if patch=\w+)
 *
 * Parameters:
 * options - {Object} 
 *
 * Valid options:
 * defaults - {Object} To determine the default values if no URL parameters 
 *      (release, lib, patch).
 * patches - Array({String}) List of sources patch.
 */
function releaseEnvironment (options) {
    options = options || {};
    var defaults = options.defaults || {};
    
    // private vars
    var iHref = window.location.href.split("#")[0].split("?")[0],
        iSearch = window.location.search,
        // Default js values
        iRelease = defaults.release? defaults.release: "dev",
        iPatch = !!defaults.patch,
        iPatches = options.patches,
        iLib = !!defaults.lib,
        // Work
        iTitleText,
        iSufTitle, 
        iUrlCanonical;
    // releases
    var releases = {
        "dev":  "http://www.openlayers.org/dev",
        "2.12": "http://dev.openlayers.org/releases/OpenLayers-2.12",
        "2.11": "http://dev.openlayers.org/releases/OpenLayers-2.11",
        "2.10": "http://dev.openlayers.org/releases/OpenLayers-2.10",
        "2.9":  "http://dev.openlayers.org/releases/OpenLayers-2.9"
    };
    
    // Parse URL parameters
    if (iSearch) {
        var regRelease =    /&*release=([\w\.]+)&?.*/i,
            regPatch =      /&*patch=(\w+)&?.*/i,
            regLib =        /&*lib=(\w+)&?.*/i,
            res;
        res = regRelease.exec(iSearch);
        iRelease = res ? res[1] : "dev";
        iPatch = !!regPatch.exec(iSearch);
        iLib = !!regLib.exec(iSearch);
    }
    iRelease = releases[iRelease]? iRelease: "dev";
    iSufTitle = iRelease + 
                (iLib? "(lib)": "") + 
                (iPatch ? " + patch": "");
    iUrlCanonical = 
        [
            [
                iHref, [
                    "release=", iRelease,
                    (iLib? "&lib=y": ""),
                    (iPatch? "&patch=y": "")
                ].join("")
            ].join("?"),
            location.hash
        ].join("");

    // set title
    var wrk;
    try {
        wrk = document.getElementsByTagName("TITLE")[0];
        iTitleText = wrk.innerHTML + ' "' + iSufTitle + '"';
        wrk.innerHTML = iTitleText;
    } catch(err) {
    }
    
    /** 
     * Method: writeScripts
     * Write the scripts of the selected OL release.
     */
    this.writeScripts = function(formDivId){
        var urlOL = releases[iRelease];
        
        var scripts = [
            '<!-- Release environtment: "' + iSufTitle + '", URL canonical: "' + iUrlCanonical + '" -->',
            '<link rel="stylesheet" href="' + urlOL + '/theme/default/style.css" type="text/css">',
            '<link rel="stylesheet" href="' + urlOL + '/examples/style.css" type="text/css">'
        ];  
        if (iLib) {
            scripts.push('<script src="' + urlOL + '/lib/OpenLayers.js"></script>');
        } else {
            scripts.push('<script src="' + urlOL + '/OpenLayers.js"></script>');
        }
        if (iPatch && iPatches) {
            for (var i = 0, len = iPatches.length; i < len; i++) {
                scripts.push('<script src="' + iPatches[i] + '"></script>');
            }
        }
        document.write(scripts.join("\n"));
    }
    
    /** 
     * Method: writeSelectionForm
     * Write the selection release form.
     * 
     * Parameters:
     * formDivId - {String} Id of the element that will contain the form.
     */
    this.writeSelectionForm = function(formDivId, titleDivId) {
        var wrk;
        if (titleDivId) {
            wrk = document.getElementById(titleDivId);
            if (wrk) {
                if (iTitleText) {
                    wrk.innerHTML = iTitleText;
                } else {
                    wrk.innerHTML += ' "' + iSufTitle + '"';
                }
            }
        }
        
        // Create form
        var form = document.createElement("form");
        form.innerHTML = '<input type="submit" value =" Try ">&nbsp; Release: ';
        
        // Declare form controls
        var fSelect, fLib, fPatch;
        // Select release
        var fSelect = document.createElement("select");
        for (var r in releases) {
            wrk = document.createElement("option");
            wrk.value = r;
            wrk.innerHTML = r;
            if (r === iRelease) {wrk.selected = "selected";}
            fSelect.appendChild(wrk);
        }
        form.appendChild(fSelect);
        // chekcs
        var addChk = function (form, name, title, checked) {
            var element = document.createElement("input");
            element.type ="checkbox";
            element.id = "form_" + name;
            element.name = "form_" + name; 
            element.value= "on"; //IE ?
            form.appendChild(document.createTextNode(" \u00a0 "));
            var wrk = document.createElement("label");
            wrk.appendChild(element);
            wrk.appendChild(document.createTextNode(title));
            form.appendChild(wrk);
            // IE9 ussing compatibility mode requires set to checked after adding chk to the form :-(
            if (checked) {
                element.checked = "checked";
                //element.defaultChecked = true; // for IE6: becomes checked but then left uncheck.
            }
            return element;
        }
        fLib = addChk(  form, "lib",   "use lib",   iLib);
        if (iPatches) {
            fPatch = addChk(form, "patch", "add patch", iPatch);
        }
        // link
        wrk = document.createElement("a");
        wrk.href = iUrlCanonical;
        wrk.innerHTML = iSufTitle;
        form.appendChild(document.createTextNode(" \u00a0 Link: "));
        form.appendChild(wrk);
        
        form.onsubmit = function(){
            window.location.assign(
                [
                    [
                        iHref, [
                            "release=", fSelect.value,
                            (fLib.checked? "&lib=y": ""),
                            (fPatch && fPatch.checked? "&patch=y": "")
                        ].join("")
                    ].join("?"),
                    location.hash
                ].join("")
            );
            return false;
        };
        // Add form to div
        var formDiv = document.getElementById(formDivId);
        formDiv.appendChild(form);
    };

}