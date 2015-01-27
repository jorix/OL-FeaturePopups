/* Copyright (c) 2006-2015 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

 /**
 * @requires OpenLayers/Util.js
 * @requires OpenLayers/Popup.js
 * @requires OpenLayers/Popup/FramedCloud.js
 */

/*
This source contains adjustments on OL popups for proper calculation of the 
autosize. For more details see "../README.md"

Patches included:
    pending to review by OL team:
        https://github.com/openlayers/openlayers/pull/507 Get right size when
            force height or width.
        https://github.com/openlayers/openlayers/pull/485 Get right scrollbar
            width.
        https://github.com/openlayers/openlayers/pull/533 Using IE no parent
            is a object!
        https://github.com/openlayers/openlayers/pull/544 Extra padding.
        https://github.com/openlayers/openlayers/pull/565 Fractional size
            using IE9.
        https://github.com/openlayers/openlayers/pull/566 Take into account
            scroll bar to calculate min/max size.
        https://github.com/openlayers/openlayers/pull/613 FramedCloud Popup:
            adjust the insertion point.
    fixed in 2.12:
        https://github.com/openlayers/openlayers/pull/505
    other patches included but are pending publication as "Pull Rquest" on OL:
        * Chrome+ABP does not consider the size of images
            (https://github.com/openlayers/openlayers/issues/595).
        * Consider the border on `contentDisplayClass`.
        * Margin should be considered when padding on `contentDisplayClass`
            is zero.

Patched functions:
    OpenLayers.Util.getRenderedDimensions
    OpenLayers.Util.getScrollbarWidth
    OpenLayers.Util.getW3cBoxModel   <-- new!
    OpenLayers.Popup.prototype.getContentDivPadding 
    OpenLayers.Popup.prototype.setSize
    OpenLayers.Popup.prototype.updateSize
    OpenLayers.Popup.FramedCloud.prototype.positionBlocks (object)
*/

// ** OpenLayers.Util **
/**
 * Method: getRenderedDimensions
 * Renders the contentHTML offscreen to determine actual dimensions for
 *     popup sizing. As we need layout to determine dimensions the content
 *     is rendered -9999px to the left and absolute to ensure the 
 *     scrollbars do not flicker
 *     
 * Parameters:
 * contentHTML
 * size - {<OpenLayers.Size>} If either the 'w' or 'h' properties is 
 *     specified, we fix that dimension of the div to be measured. This is 
 *     useful in the case where we have a limit in one dimension and must 
 *     therefore meaure the flow in the other dimension.
 * options - {Object}
 *
 * Allowed Options:
 *     displayClass - {String} Optional parameter.  A CSS class name(s) string
 *         to provide the CSS context of the rendered content.
 *     containerElement - {DOMElement} Optional parameter. Insert the HTML to 
 *         this node instead of the body root when calculating dimensions. 
 * 
 * Returns:
 * {<OpenLayers.Size>}
 */
OpenLayers.Util.getRenderedDimensions = function(contentHTML, size, options) {
    
    var w, h;
    
    // create temp container div with restricted size
    var container = document.createElement("div");
    container.style.visibility = "hidden";
        
    var containerElement = (options && options.containerElement) 
        ? options.containerElement : document.body;
    
    // Opera and IE7 can't handle a node with position:aboslute if it inherits
    // position:absolute from a parent.
    var parentHasPositionAbsolute = false;
    var superContainer = null;
    var parent = containerElement;
    while (parent && parent.tagName.toLowerCase()!="body") {
        var parentPosition = OpenLayers.Element.getStyle(parent, "position");
        if(parentPosition == "absolute") {
            parentHasPositionAbsolute = true;
            break;
        } else if (parentPosition && parentPosition != "static") {
            break;
        }
        parent = parent.parentNode;
    }
    if(parentHasPositionAbsolute && (containerElement.clientHeight === 0 || 
                                     containerElement.clientWidth === 0) ){
        superContainer = document.createElement("div");
        superContainer.style.visibility = "hidden";
        superContainer.style.position = "absolute";
        superContainer.style.overflow = "visible";
        superContainer.style.width = document.body.clientWidth + "px";
        superContainer.style.height = document.body.clientHeight + "px";
        superContainer.appendChild(container);
    }
    container.style.position = "absolute";

    //fix a dimension, if specified.
    if (size) {
        if (size.w) {
            w = size.w;
            container.style.width = w + "px";
        } else if (size.h) {
            h = size.h;
            container.style.height = h + "px";
        }
        container.style.overflow = "hidden";
    }

    //add css classes, if specified
    if (options && options.displayClass) {
        container.className = options.displayClass;
    }
    
    // create temp content div and assign content
    var content = document.createElement("div");
    var noMargin = '<div style="margin:0px; clear:both; padding:0;' +
       ' height:1px; width:1px; line-height:1px; background-color:#000"></div>';
    content.innerHTML = noMargin + contentHTML + noMargin; 
    
    // we need overflow visible when calculating the size
    content.style.overflow = "visible";
    if (content.childNodes) {
        for (var i=0, l=content.childNodes.length; i<l; i++) {
            if (!content.childNodes[i].style) continue;
            content.childNodes[i].style.overflow = "visible";
        }
    }
    
    // add content to restricted container 
    container.appendChild(content);
    
    // append container to body for rendering
    if (superContainer) {
        containerElement.appendChild(superContainer);
    } else {
        containerElement.appendChild(container);
    }

    // fix img dimensions: chrome bug
    var images = content.getElementsByTagName("img");
    for (var i = 0, len = images.length; i < len; i++) {
        var img = images[i],
            aux;
        if (img.naturalWidth && img.naturalHeight &&
                                                 (!img.width || !img.height)) {
            if (!img.width && !img.height) {
                img.height = img.naturalHeight;
                img.width = img.naturalWidth;
            } else if (img.width) {
                img.height = Math.round(img.naturalHeight *
                                  (parseInt(img.width, 10) / img.naturalWidth));
            } else if (img.height) {
                img.width = Math.round(img.naturalWidth *
                                (parseInt(img.height, 10) / img.naturalHeight));
            }
        }
    }
    
    // calculate scroll width of content and add corners and shadow width
    if (!w) {
        w = Math.ceil(parseFloat(OpenLayers.Element.getStyle(content,"width")));
        if (!w) {
            w = parseInt(content.scrollWidth);
        }
        // update container width to allow height to adjust
        container.style.width = w + "px";
    }        
    // capture height and add shadow and corner image widths
    if (!h) {
        h = Math.ceil(parseFloat(
                               OpenLayers.Element.getStyle(content, "height")));
        if (!h){
            h = parseInt(content.scrollHeight);
        }
        h -= 2; // Remove 1px * 2 of noMargin
    }

    // remove elements
    container.removeChild(content);
    if (superContainer) {
        superContainer.removeChild(container);
        containerElement.removeChild(superContainer);
    } else {
        containerElement.removeChild(container);
    }
    
    return new OpenLayers.Size(w, h);
};

/**
 * APIFunction: getScrollbarWidth
 * This function has been modified by the OpenLayers from the original version,
 *     written by Matthew Eernisse and released under the Apache 2 
 *     license here:
 * 
 *     http://www.fleegix.org/articles/2006/05/30/getting-the-scrollbar-width-in-pixels
 * 
 *     It has been modified simply to cache its value, since it is physically 
 *     impossible that this code could ever run in more than one browser at 
 *     once. 
 * 
 * Returns:
 * {Integer}
 */
OpenLayers.Util.getScrollbarWidth = function() {
    
    var scrollbarWidth = OpenLayers.Util._scrollbarWidth;
    
    if (scrollbarWidth == null) {
        var scr = null;
        var inn = null;
        var wNoScroll = 0;
        var wScroll = 0;
    
        // Outer scrolling div
        scr = document.createElement('div');
        scr.style.position = 'absolute';
        scr.style.top = '-1000px';
        scr.style.left = '-1000px';
        scr.style.width = '100px';
        scr.style.height = '50px';
        // Start with no scrollbar
        scr.style.overflow = 'hidden';
    
        // Inner content div
        inn = document.createElement('div');
        inn.style.width = '100%';
        inn.style.height = '200px';
    
        // Put the inner div in the scrolling div
        scr.appendChild(inn);
        // Append the scrolling div to the doc
        document.body.appendChild(scr);
    
        // Width of the inner div sans scrollbar
        wNoScroll = inn.offsetWidth;
    
        // Add the scrollbar
        scr.style.overflow = 'auto';
        scr.style.overflowY = 'scroll';
        scr.style.overflowX = 'hidden';
        // Width of the inner div width scrollbar
        wScroll = scr.clientWidth;
    
        // Remove the scrolling div from the doc
        document.body.removeChild(document.body.lastChild);
    
        // Pixel width of the scroller
        OpenLayers.Util._scrollbarWidth = (wNoScroll - wScroll);
        scrollbarWidth = OpenLayers.Util._scrollbarWidth;
    }

    return scrollbarWidth;
};

/**
 * APIFunction: getW3cBoxModel
 * Determine the box model. If returns true, then browser uses the w3c box,
 *      otherwise, the browser uses the traditional box model.
 * 
 * Returns:
 * {Boolean}
 */
OpenLayers.Util.getW3cBoxModel = function() {
    var w3cBoxModel = OpenLayers.Util._w3cBoxModel;
    
    if (w3cBoxModel == null) {
        // Determine the box model. If the testDiv's clientWidth is 3, then
        // the borders are outside and we are dealing with the w3c box
        // model. Otherwise, the browser uses the traditional box model and
        // the borders are inside the box bounds, leaving us with a
        // clientWidth of 1.
        var testDiv = document.createElement("div");
        //testDiv.style.visibility = "hidden";
        testDiv.style.position = "absolute";
        testDiv.style.border = "1px solid black";
        testDiv.style.width = "3px";
        document.body.appendChild(testDiv);
        w3cBoxModel = testDiv.clientWidth == 3;
        document.body.removeChild(testDiv);
    }
    return w3cBoxModel;
};

// ** OpenLayers.Popup **
/**
 * Method: getContentDivPadding
 * Glorious, oh glorious hack in order to determine the css 'padding' of 
 *     the contentDiv. IE/Opera return null here unless we actually add the 
 *     popup's main 'div' element (which contains contentDiv) to the DOM. 
 *     So we make it invisible and then add it to the document temporarily. 
 *
 *     Once we've taken the padding readings we need, we then remove it 
 *     from the DOM (it will actually get added to the DOM in 
 *     Map.js's addPopup)
 *
 * Returns:
 * {<OpenLayers.Bounds>}
 */
OpenLayers.Popup.prototype.getContentDivPadding = function() {
    //use cached value if we have it
    var contentDivPadding = this._contentDivPadding;
    if (!contentDivPadding) {

        if (this.div.parentNode == null || !OpenLayers.Util.isElement(this.div.parentNode)) {
            //make the div invisible and add it to the page        
            this.div.style.display = "none";
            document.body.appendChild(this.div);
        }
                
        //read the padding settings from css, put them in an OL.Bounds        
        contentDivPadding = new OpenLayers.Bounds(
            OpenLayers.Element.getStyle(this.contentDiv, "padding-left"),
            OpenLayers.Element.getStyle(this.contentDiv, "padding-bottom"),
            OpenLayers.Element.getStyle(this.contentDiv, "padding-right"),
            OpenLayers.Element.getStyle(this.contentDiv, "padding-top")
        );
        var contentDivBorder = new OpenLayers.Bounds(
            OpenLayers.Element.getStyle(this.contentDiv, "border-left-width"),
            OpenLayers.Element.getStyle(this.contentDiv, "border-bottom-width"),
            OpenLayers.Element.getStyle(this.contentDiv, "border-right-width"),
            OpenLayers.Element.getStyle(this.contentDiv, "border-top-width")
        );
        contentDivPadding.left += isNaN(contentDivBorder.left) ?
                                                    0 : contentDivBorder.left;
        contentDivPadding.bottom += isNaN(contentDivBorder.bottom) ?
                                                    0 : contentDivBorder.bottom;
        contentDivPadding.right += isNaN(contentDivBorder.right) ?
                                                    0 : contentDivBorder.right;
        contentDivPadding.top += isNaN(contentDivBorder.top) ?
                                                    0 : contentDivBorder.top;
        
        //cache the value
        this._contentDivPadding = contentDivPadding;

        if (this.div.parentNode == document.body) {
            //remove the div from the page and make it visible again
            document.body.removeChild(this.div);
            this.div.style.display = "";
        }
    }
    return contentDivPadding;
};
    
/**
 * Method: setSize
 * Used to adjust the size of the popup. 
 *
 * Parameters:
 * contentSize - {<OpenLayers.Size>} the new size for the popup's 
 *     contents div (in pixels).
 */
OpenLayers.Popup.prototype.setSize = function(contentSize) { 
    this.size = contentSize.clone(); 
    this.contentSize = contentSize;
    
    // if our contentDiv has a css 'padding' set on it by a stylesheet, we 
    //  must add that to the desired "size". 
    var contentDivPadding = this.getContentDivPadding();
    var wPaddingCont = contentDivPadding.left + contentDivPadding.right;
    var hPaddingCont = contentDivPadding.top + contentDivPadding.bottom;

    // take into account the popup's 'padding' property
    this.fixPadding();
    var wPaddingFix = this.padding.left + this.padding.right;
    var hPaddingFix = this.padding.top + this.padding.bottom;

    // make extra space for the close div
    if (this.closeDiv) {
        var closeDivWidth = parseInt(this.closeDiv.style.width);
        wPaddingFix += closeDivWidth + contentDivPadding.right;
    }

    //increase size of the main popup div to take into account the 
    // users's desired padding and close div.        
    this.size.w += wPaddingCont + wPaddingFix;
    this.size.h += hPaddingCont + hPaddingFix;

    if (this.div != null) {
        this.div.style.width = this.size.w + "px";
        this.div.style.height = this.size.h + "px";
    }
    if (this.contentDiv != null){
        if (OpenLayers.Util.getW3cBoxModel()) {
            this.contentDiv.style.width = contentSize.w + "px";
            this.contentDiv.style.height = contentSize.h + "px";
        } else {
            // now if our browser is IE & on quirks mode, we need to actually make the contents 
            // div itself bigger to take its own padding into effect. this makes 
            // me want to shoot someone, but so it goes.
            this.contentDiv.style.width = (contentSize.w + wPaddingCont) + "px";
            this.contentDiv.style.height = (contentSize.h + hPaddingCont) + "px";
        }
    }
};  

/**
 * APIMethod: updateSize
 * Auto size the popup so that it precisely fits its contents (as 
 *     determined by this.contentDiv.innerHTML). Popup size will, of
 *     course, be limited by the available space on the current map
 */
OpenLayers.Popup.prototype.updateSize = function() {
    
    // determine actual render dimensions of the contents by putting its
    // contents into a fake contentDiv (for the CSS) and then measuring it
    // regardless padding of contentDisplayClass.
    var preparedHTML = "<div class='" + this.contentDisplayClass+ "'" + 
        " style='padding:0px; border-width:0px'>" + 
        this.contentDiv.innerHTML + 
        "</div>";

    var containerElement = (this.map) ? this.map.div : document.body;
    var realSize = OpenLayers.Util.getRenderedDimensions(
        preparedHTML, null, {
            displayClass: this.displayClass,
            containerElement: containerElement
        }
    );

    // is the "real" size of the div is safe to display in our map?
    var safeSize = this.getSafeContentSize(realSize);

    var newSize = null;
    if (safeSize.equals(realSize)) {
        //real size of content is small enough to fit on the map, 
        // so we use real size.
        newSize = realSize;
        // Chrome if images then can generate both scrollbars when not needed.
        this.contentDiv.style.overflowX = "hidden";
        this.contentDiv.style.overflowY = "hidden";
    } else {

        // make a new 'size' object with the clipped dimensions 
        // set or null if not clipped.
        var fixedSize = {
            w: (safeSize.w < realSize.w) ? safeSize.w : null,
            h: (safeSize.h < realSize.h) ? safeSize.h : null
        };
    
        if (fixedSize.w && fixedSize.h) {
            //content is too big in both directions, so we will use 
            // max popup size (safeSize), knowing well that it will 
            // overflow both ways.                
            newSize = safeSize;
        } else {
            //content is clipped in only one direction, so we need to 
            // run getRenderedDimensions() again with a fixed dimension
            var clippedSize = OpenLayers.Util.getRenderedDimensions(
                preparedHTML, fixedSize, {
                    displayClass: this.contentDisplayClass,
                    containerElement: containerElement
                }
            );
            
            //if the clipped size is still the same as the safeSize, 
            // that means that our content must be fixed in the 
            // offending direction. If overflow is 'auto', this means 
            // we are going to have a scrollbar for sure, so we must 
            // adjust for that.
            //
            var currentOverflow = OpenLayers.Element.getStyle(
                this.contentDiv, "overflow"
            );
            if ( (currentOverflow != "hidden") && 
                 (clippedSize.w <= safeSize.w && clippedSize.h <= safeSize.h) ) {
                var scrollBar = OpenLayers.Util.getScrollbarWidth();
                var contentDivPadding = this.getContentDivPadding();
                if (fixedSize.w) {
                    if (clippedSize.h + scrollBar >= safeSize.h) {
                        if (this.maxSize && clippedSize.h + scrollBar +
                                    contentDivPadding.top + 
                                    contentDivPadding.bottom > this.maxSize.h) {
                            clippedSize.h = this.maxSize.h -
                                (contentDivPadding.top + contentDivPadding.bottom);
                        } else {
                            clippedSize.h += scrollBar;
                        }
                    }
                } else {
                    if (clippedSize.w + scrollBar >= safeSize.w) {
                        if (this.maxSize && clippedSize.w + scrollBar +
                                    contentDivPadding.left + 
                                    contentDivPadding.right > this.maxSize.w) {
                            clippedSize.w = this.maxSize.w -
                                (contentDivPadding.left + contentDivPadding.right);
                        } else {
                            clippedSize.w += scrollBar;
                        }
                    }
                }
            }
            
            newSize = this.getSafeContentSize(clippedSize);
        }
    }                        
    this.setSize(newSize);     
};   

// ** OpenLayers.Popup.FramedCloud **
/**
 * Property: positionBlocks
 * {Object} Hash of differen position blocks, keyed by relativePosition
 *     two-character code string (ie "tl", "tr", "bl", "br")
 */
(function(){
    var fc_pb = OpenLayers.Popup.FramedCloud.prototype.positionBlocks;
    fc_pb.tl.blocks[4].position = new OpenLayers.Pixel(0, -687);
    fc_pb.tr.offset =  new OpenLayers.Pixel(-44, 0);
    fc_pb.tr.blocks[3].size = new OpenLayers.Size(22, 18);
    fc_pb.tr.blocks[3].position = new OpenLayers.Pixel(-1238, -632);
    fc_pb.bl.offset = new OpenLayers.Pixel(44, 0);
})();
