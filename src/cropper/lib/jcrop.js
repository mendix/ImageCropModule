/*
 * Jcrop injecter AMD module, which will provide 
 * and injecter funtion, which injects the plugin in the 
 * provided jQuery version 
 */
define([], function () {
    /*
     * This is an injecter function for JCrop jQuery plugin.
     * Injects Jcrop in the passed jQuery Instance. 
     */
    var _JCropPluginInjecter = function (jQuery) {

        jQuery.Jcrop = function (obj, opt) {
            var options = jQuery.extend({}, jQuery.Jcrop.defaults),
                docOffset,
                _ua = navigator.userAgent.toLowerCase(),
                is_msie = /msie/.test(_ua),
                ie6mode = /msie [1-6]\./.test(_ua);

            // Internal Methods {{{
            function px(n) {
                return Math.round(n) + 'px';
            }

            function cssClass(cl) {
                return options.baseClass + '-' + cl;
            }

            function supportsColorFade() {
                return jQuery.fx.step.hasOwnProperty('backgroundColor');
            }

            function getPos(obj) //{{{
            {
                var pos = jQuery(obj).offset();
                return [pos.left, pos.top];
            }
            //}}}
            function mouseAbs(e) //{{{
            {
                return [(e.pageX - docOffset[0]), (e.pageY - docOffset[1])];
            }
            //}}}
            function setOptions(opt) //{{{
            {
                if (typeof (opt) !== 'object') opt = {};
                options = jQuery.extend(options, opt);

                jQuery.each(['onChange', 'onSelect', 'onRelease', 'onDblClick'], function (i, e) {
                    if (typeof (options[e]) !== 'function') options[e] = function () {};
                });
            }
            //}}}
            function startDragMode(mode, pos, touch) //{{{
            {
                docOffset = getPos(jQueryimg);
                Tracker.setCursor(mode === 'move' ? mode : mode + '-resize');

                if (mode === 'move') {
                    return Tracker.activateHandlers(createMover(pos), doneSelect, touch);
                }

                var fc = Coords.getFixed();
                var opp = oppLockCorner(mode);
                var opc = Coords.getCorner(oppLockCorner(opp));

                Coords.setPressed(Coords.getCorner(opp));
                Coords.setCurrent(opc);

                Tracker.activateHandlers(dragmodeHandler(mode, fc), doneSelect, touch);
            }
            //}}}
            function dragmodeHandler(mode, f) //{{{
            {
                return function (pos) {
                    if (!options.aspectRatio) {
                        switch (mode) {
                            case 'e':
                                pos[1] = f.y2;
                                break;
                            case 'w':
                                pos[1] = f.y2;
                                break;
                            case 'n':
                                pos[0] = f.x2;
                                break;
                            case 's':
                                pos[0] = f.x2;
                                break;
                        }
                    } else {
                        switch (mode) {
                            case 'e':
                                pos[1] = f.y + 1;
                                break;
                            case 'w':
                                pos[1] = f.y + 1;
                                break;
                            case 'n':
                                pos[0] = f.x + 1;
                                break;
                            case 's':
                                pos[0] = f.x + 1;
                                break;
                        }
                    }
                    Coords.setCurrent(pos);
                    Selection.update();
                };
            }
            //}}}
            function createMover(pos) //{{{
            {
                var lloc = pos;
                KeyManager.watchKeys();

                return function (pos) {
                    Coords.moveOffset([pos[0] - lloc[0], pos[1] - lloc[1]]);
                    lloc = pos;

                    Selection.update();
                };
            }
            //}}}
            function oppLockCorner(ord) //{{{
            {
                switch (ord) {
                    case 'n':
                        return 'sw';
                    case 's':
                        return 'nw';
                    case 'e':
                        return 'nw';
                    case 'w':
                        return 'ne';
                    case 'ne':
                        return 'sw';
                    case 'nw':
                        return 'se';
                    case 'se':
                        return 'nw';
                    case 'sw':
                        return 'ne';
                }
            }
            //}}}
            function createDragger(ord) //{{{
            {
                return function (e) {
                    if (options.disabled) {
                        return false;
                    }
                    if ((ord === 'move') && !options.allowMove) {
                        return false;
                    }

                    // Fix position of crop area when dragged the very first time.
                    // Necessary when crop image is in a hidden element when page is loaded.
                    docOffset = getPos(jQueryimg);

                    btndown = true;
                    startDragMode(ord, mouseAbs(e));
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                };
            }
            //}}}
            function presize(jQueryobj, w, h) //{{{
            {
                var nw = jQueryobj.width(),
                    nh = jQueryobj.height();
                if ((nw > w) && w > 0) {
                    nw = w;
                    nh = (w / jQueryobj.width()) * jQueryobj.height();
                }
                if ((nh > h) && h > 0) {
                    nh = h;
                    nw = (h / jQueryobj.height()) * jQueryobj.width();
                }
                xscale = jQueryobj.width() / nw;
                yscale = jQueryobj.height() / nh;
                jQueryobj.width(nw).height(nh);
            }
            //}}}
            function unscale(c) //{{{
            {
                return {
                    x: c.x * xscale,
                    y: c.y * yscale,
                    x2: c.x2 * xscale,
                    y2: c.y2 * yscale,
                    w: c.w * xscale,
                    h: c.h * yscale
                };
            }
            //}}}
            function doneSelect(pos) //{{{
            {
                var c = Coords.getFixed();
                if ((c.w > options.minSelect[0]) && (c.h > options.minSelect[1])) {
                    Selection.enableHandles();
                    Selection.done();
                } else {
                    Selection.release();
                }
                Tracker.setCursor(options.allowSelect ? 'crosshair' : 'default');
            }
            //}}}
            function newSelection(e) //{{{
            {
                if (options.disabled) {
                    return;
                }
                if (!options.allowSelect) {
                    return;
                }
                btndown = true;
                docOffset = getPos(jQueryimg);
                Selection.disableHandles();
                Tracker.setCursor('crosshair');
                var pos = mouseAbs(e);
                Coords.setPressed(pos);
                Selection.update();
                Tracker.activateHandlers(selectDrag, doneSelect, e.type.substring(0, 5) === 'touch');
                KeyManager.watchKeys();

                e.stopPropagation();
                e.preventDefault();
                return false;
            }
            //}}}
            function selectDrag(pos) //{{{
            {
                Coords.setCurrent(pos);
                Selection.update();
            }
            //}}}
            function newTracker() //{{{
            {
                var trk = jQuery('<div></div>').addClass(cssClass('tracker'));
                if (is_msie) {
                    trk.css({
                        opacity: 0,
                        backgroundColor: 'white'
                    });
                }
                return trk;
            }
            //}}}

            // }}}
            // Initialization {{{
            // Sanitize some options {{{
            if (typeof (obj) !== 'object') {
                obj = jQuery(obj)[0];
            }
            if (typeof (opt) !== 'object') {
                opt = {};
            }
            // }}}
            setOptions(opt);
            // Initialize some jQuery objects {{{
            // The values are SET on the image(s) for the interface
            // If the original image has any of these set, they will be reset
            // However, if you destroy() the Jcrop instance the original image's
            // character in the DOM will be as you left it.
            var img_css = {
                border: 'none',
                visibility: 'visible',
                margin: 0,
                padding: 0,
                position: 'absolute',
                top: 0,
                left: 0
            };

            var jQueryorigimg = jQuery(obj),
                img_mode = true;

            if (obj.tagName == 'IMG') {
                // Fix size of crop image.
                // Necessary when crop image is within a hidden element when page is loaded.
                if (jQueryorigimg[0].width != 0 && jQueryorigimg[0].height != 0) {
                    // Obtain dimensions from contained img element.
                    jQueryorigimg.width(jQueryorigimg[0].width);
                    jQueryorigimg.height(jQueryorigimg[0].height);
                } else {
                    // Obtain dimensions from temporary image in case the original is not loaded yet (e.g. IE 7.0).
                    var tempImage = new Image();
                    tempImage.src = jQueryorigimg[0].src;
                    jQueryorigimg.width(tempImage.width);
                    jQueryorigimg.height(tempImage.height);
                }

                var jQueryimg = jQueryorigimg.clone().removeAttr('id').css(img_css).show();

                jQueryimg.width(jQueryorigimg.width());
                jQueryimg.height(jQueryorigimg.height());
                jQueryorigimg.after(jQueryimg).hide();

            } else {
                jQueryimg = jQueryorigimg.css(img_css).show();
                img_mode = false;
                if (options.shade === null) {
                    options.shade = true;
                }
            }

            presize(jQueryimg, options.boxWidth, options.boxHeight);

            var boundx = jQueryimg.width(),
                boundy = jQueryimg.height(),


                jQuerydiv = jQuery('<div />').width(boundx).height(boundy).addClass(cssClass('holder')).css({
                    position: 'relative',
                    backgroundColor: options.bgColor
                }).insertAfter(jQueryorigimg).append(jQueryimg);

            if (options.addClass) {
                jQuerydiv.addClass(options.addClass);
            }

            var jQueryimg2 = jQuery('<div />'),

                jQueryimg_holder = jQuery('<div />')
                .width('100%').height('100%').css({
                    zIndex: 310,
                    position: 'absolute',
                    overflow: 'hidden'
                }),

                jQueryhdl_holder = jQuery('<div />')
                .width('100%').height('100%').css('zIndex', 320),

                jQuerysel = jQuery('<div />')
                .css({
                    position: 'absolute',
                    zIndex: 600
                }).dblclick(function () {
                    var c = Coords.getFixed();
                    options.onDblClick.call(api, c);
                }).insertBefore(jQueryimg).append(jQueryimg_holder, jQueryhdl_holder);

            if (img_mode) {

                jQueryimg2 = jQuery('<img />')
                    .attr('src', jQueryimg.attr('src')).css(img_css).width(boundx).height(boundy),

                    jQueryimg_holder.append(jQueryimg2);

            }

            if (ie6mode) {
                jQuerysel.css({
                    overflowY: 'hidden'
                });
            }

            var bound = options.boundary;
            var jQuerytrk = newTracker().width(boundx + (bound * 2)).height(boundy + (bound * 2)).css({
                position: 'absolute',
                top: px(-bound),
                left: px(-bound),
                zIndex: 290
            }).mousedown(newSelection);

            /* }}} */
            // Set more variables {{{
            var bgcolor = options.bgColor,
                bgopacity = options.bgOpacity,
                xlimit, ylimit, xmin, ymin, xscale, yscale, enabled = true,
                btndown, animating, shift_down;

            docOffset = getPos(jQueryimg);
            // }}}
            // }}}
            // Internal Modules {{{
            // Touch Module {{{
            var Touch = (function () {
                // Touch support detection function adapted (under MIT License)
                // from code by Jeffrey Sambells - http://github.com/iamamused/
                function hasTouchSupport() {
                    var support = {},
                        events = ['touchstart', 'touchmove', 'touchend'],
                        el = document.createElement('div'),
                        i;

                    try {
                        for (i = 0; i < events.length; i++) {
                            var eventName = events[i];
                            eventName = 'on' + eventName;
                            var isSupported = (eventName in el);
                            if (!isSupported) {
                                el.setAttribute(eventName, 'return;');
                                isSupported = typeof el[eventName] == 'function';
                            }
                            support[events[i]] = isSupported;
                        }
                        return support.touchstart && support.touchend && support.touchmove;
                    } catch (err) {
                        return false;
                    }
                }

                function detectSupport() {
                    if ((options.touchSupport === true) || (options.touchSupport === false)) return options.touchSupport;
                    else return hasTouchSupport();
                }
                return {
                    createDragger: function (ord) {
                        return function (e) {
                            if (options.disabled) {
                                return false;
                            }
                            if ((ord === 'move') && !options.allowMove) {
                                return false;
                            }
                            docOffset = getPos(jQueryimg);
                            btndown = true;
                            startDragMode(ord, mouseAbs(Touch.cfilter(e)), true);
                            e.stopPropagation();
                            e.preventDefault();
                            return false;
                        };
                    },
                    newSelection: function (e) {
                        return newSelection(Touch.cfilter(e));
                    },
                    cfilter: function (e) {
                        e.pageX = e.originalEvent.changedTouches[0].pageX;
                        e.pageY = e.originalEvent.changedTouches[0].pageY;
                        return e;
                    },
                    isSupported: hasTouchSupport,
                    support: detectSupport()
                };
            }());
            // }}}
            // Coords Module {{{
            var Coords = (function () {
                var x1 = 0,
                    y1 = 0,
                    x2 = 0,
                    y2 = 0,
                    ox, oy;

                function setPressed(pos) //{{{
                {
                    pos = rebound(pos);
                    x2 = x1 = pos[0];
                    y2 = y1 = pos[1];
                }
                //}}}
                function setCurrent(pos) //{{{
                {
                    pos = rebound(pos);
                    ox = pos[0] - x2;
                    oy = pos[1] - y2;
                    x2 = pos[0];
                    y2 = pos[1];
                }
                //}}}
                function getOffset() //{{{
                {
                    return [ox, oy];
                }
                //}}}
                function moveOffset(offset) //{{{
                {
                    var ox = offset[0],
                        oy = offset[1];

                    if (0 > x1 + ox) {
                        ox -= ox + x1;
                    }
                    if (0 > y1 + oy) {
                        oy -= oy + y1;
                    }

                    if (boundy < y2 + oy) {
                        oy += boundy - (y2 + oy);
                    }
                    if (boundx < x2 + ox) {
                        ox += boundx - (x2 + ox);
                    }

                    x1 += ox;
                    x2 += ox;
                    y1 += oy;
                    y2 += oy;
                }
                //}}}
                function getCorner(ord) //{{{
                {
                    var c = getFixed();
                    switch (ord) {
                        case 'ne':
                            return [c.x2, c.y];
                        case 'nw':
                            return [c.x, c.y];
                        case 'se':
                            return [c.x2, c.y2];
                        case 'sw':
                            return [c.x, c.y2];
                    }
                }
                //}}}
                function getFixed() //{{{
                {
                    if (!options.aspectRatio) {
                        return getRect();
                    }
                    // This function could use some optimization I think...
                    var aspect = options.aspectRatio,
                        min_x = options.minSize[0] / xscale,


                        //min_y = options.minSize[1]/yscale,
                        max_x = options.maxSize[0] / xscale,
                        max_y = options.maxSize[1] / yscale,
                        rw = x2 - x1,
                        rh = y2 - y1,
                        rwa = Math.abs(rw),
                        rha = Math.abs(rh),
                        real_ratio = rwa / rha,
                        xx, yy, w, h;

                    if (max_x === 0) {
                        max_x = boundx * 10;
                    }
                    if (max_y === 0) {
                        max_y = boundy * 10;
                    }
                    if (real_ratio < aspect) {
                        yy = y2;
                        w = rha * aspect;
                        xx = rw < 0 ? x1 - w : w + x1;

                        if (xx < 0) {
                            xx = 0;
                            h = Math.abs((xx - x1) / aspect);
                            yy = rh < 0 ? y1 - h : h + y1;
                        } else if (xx > boundx) {
                            xx = boundx;
                            h = Math.abs((xx - x1) / aspect);
                            yy = rh < 0 ? y1 - h : h + y1;
                        }
                    } else {
                        xx = x2;
                        h = rwa / aspect;
                        yy = rh < 0 ? y1 - h : y1 + h;
                        if (yy < 0) {
                            yy = 0;
                            w = Math.abs((yy - y1) * aspect);
                            xx = rw < 0 ? x1 - w : w + x1;
                        } else if (yy > boundy) {
                            yy = boundy;
                            w = Math.abs(yy - y1) * aspect;
                            xx = rw < 0 ? x1 - w : w + x1;
                        }
                    }

                    // Magic %-)
                    if (xx > x1) { // right side
                        if (xx - x1 < min_x) {
                            xx = x1 + min_x;
                        } else if (xx - x1 > max_x) {
                            xx = x1 + max_x;
                        }
                        if (yy > y1) {
                            yy = y1 + (xx - x1) / aspect;
                        } else {
                            yy = y1 - (xx - x1) / aspect;
                        }
                    } else if (xx < x1) { // left side
                        if (x1 - xx < min_x) {
                            xx = x1 - min_x;
                        } else if (x1 - xx > max_x) {
                            xx = x1 - max_x;
                        }
                        if (yy > y1) {
                            yy = y1 + (x1 - xx) / aspect;
                        } else {
                            yy = y1 - (x1 - xx) / aspect;
                        }
                    }

                    if (xx < 0) {
                        x1 -= xx;
                        xx = 0;
                    } else if (xx > boundx) {
                        x1 -= xx - boundx;
                        xx = boundx;
                    }

                    if (yy < 0) {
                        y1 -= yy;
                        yy = 0;
                    } else if (yy > boundy) {
                        y1 -= yy - boundy;
                        yy = boundy;
                    }

                    return makeObj(flipCoords(x1, y1, xx, yy));
                }
                //}}}
                function rebound(p) //{{{
                {
                    if (p[0] < 0) p[0] = 0;
                    if (p[1] < 0) p[1] = 0;

                    if (p[0] > boundx) p[0] = boundx;
                    if (p[1] > boundy) p[1] = boundy;

                    return [Math.round(p[0]), Math.round(p[1])];
                }
                //}}}
                function flipCoords(x1, y1, x2, y2) //{{{
                {
                    var xa = x1,
                        xb = x2,
                        ya = y1,
                        yb = y2;
                    if (x2 < x1) {
                        xa = x2;
                        xb = x1;
                    }
                    if (y2 < y1) {
                        ya = y2;
                        yb = y1;
                    }
                    return [xa, ya, xb, yb];
                }
                //}}}
                function getRect() //{{{
                {
                    var xsize = x2 - x1,
                        ysize = y2 - y1,
                        delta;

                    if (xlimit && (Math.abs(xsize) > xlimit)) {
                        x2 = (xsize > 0) ? (x1 + xlimit) : (x1 - xlimit);
                    }
                    if (ylimit && (Math.abs(ysize) > ylimit)) {
                        y2 = (ysize > 0) ? (y1 + ylimit) : (y1 - ylimit);
                    }

                    if (ymin / yscale && (Math.abs(ysize) < ymin / yscale)) {
                        y2 = (ysize > 0) ? (y1 + ymin / yscale) : (y1 - ymin / yscale);
                    }
                    if (xmin / xscale && (Math.abs(xsize) < xmin / xscale)) {
                        x2 = (xsize > 0) ? (x1 + xmin / xscale) : (x1 - xmin / xscale);
                    }

                    if (x1 < 0) {
                        x2 -= x1;
                        x1 -= x1;
                    }
                    if (y1 < 0) {
                        y2 -= y1;
                        y1 -= y1;
                    }
                    if (x2 < 0) {
                        x1 -= x2;
                        x2 -= x2;
                    }
                    if (y2 < 0) {
                        y1 -= y2;
                        y2 -= y2;
                    }
                    if (x2 > boundx) {
                        delta = x2 - boundx;
                        x1 -= delta;
                        x2 -= delta;
                    }
                    if (y2 > boundy) {
                        delta = y2 - boundy;
                        y1 -= delta;
                        y2 -= delta;
                    }
                    if (x1 > boundx) {
                        delta = x1 - boundy;
                        y2 -= delta;
                        y1 -= delta;
                    }
                    if (y1 > boundy) {
                        delta = y1 - boundy;
                        y2 -= delta;
                        y1 -= delta;
                    }

                    return makeObj(flipCoords(x1, y1, x2, y2));
                }
                //}}}
                function makeObj(a) //{{{
                {
                    return {
                        x: a[0],
                        y: a[1],
                        x2: a[2],
                        y2: a[3],
                        w: a[2] - a[0],
                        h: a[3] - a[1]
                    };
                }
                //}}}

                return {
                    flipCoords: flipCoords,
                    setPressed: setPressed,
                    setCurrent: setCurrent,
                    getOffset: getOffset,
                    moveOffset: moveOffset,
                    getCorner: getCorner,
                    getFixed: getFixed
                };
            }());

            //}}}
            // Shade Module {{{
            var Shade = (function () {
                var enabled = false,
                    holder = jQuery('<div />').css({
                        position: 'absolute',
                        zIndex: 240,
                        opacity: 0
                    }),
                    shades = {
                        top: createShade(),
                        left: createShade().height(boundy),
                        right: createShade().height(boundy),
                        bottom: createShade()
                    };

                function resizeShades(w, h) {
                    shades.left.css({
                        height: px(h)
                    });
                    shades.right.css({
                        height: px(h)
                    });
                }

                function updateAuto() {
                    return updateShade(Coords.getFixed());
                }

                function updateShade(c) {
                    shades.top.css({
                        left: px(c.x),
                        width: px(c.w),
                        height: px(c.y)
                    });
                    shades.bottom.css({
                        top: px(c.y2),
                        left: px(c.x),
                        width: px(c.w),
                        height: px(boundy - c.y2)
                    });
                    shades.right.css({
                        left: px(c.x2),
                        width: px(boundx - c.x2)
                    });
                    shades.left.css({
                        width: px(c.x)
                    });
                }

                function createShade() {
                    return jQuery('<div />').css({
                        position: 'absolute',
                        backgroundColor: options.shadeColor || options.bgColor
                    }).appendTo(holder);
                }

                function enableShade() {
                    if (!enabled) {
                        enabled = true;
                        holder.insertBefore(jQueryimg);
                        updateAuto();
                        Selection.setBgOpacity(1, 0, 1);
                        jQueryimg2.hide();

                        setBgColor(options.shadeColor || options.bgColor, 1);
                        if (Selection.isAwake()) {
                            setOpacity(options.bgOpacity, 1);
                        } else setOpacity(1, 1);
                    }
                }

                function setBgColor(color, now) {
                    colorChangeMacro(getShades(), color, now);
                }

                function disableShade() {
                    if (enabled) {
                        holder.remove();
                        jQueryimg2.show();
                        enabled = false;
                        if (Selection.isAwake()) {
                            Selection.setBgOpacity(options.bgOpacity, 1, 1);
                        } else {
                            Selection.setBgOpacity(1, 1, 1);
                            Selection.disableHandles();
                        }
                        colorChangeMacro(jQuerydiv, 0, 1);
                    }
                }

                function setOpacity(opacity, now) {
                    if (enabled) {
                        if (options.bgFade && !now) {
                            holder.animate({
                                opacity: 1 - opacity
                            }, {
                                queue: false,
                                duration: options.fadeTime
                            });
                        } else holder.css({
                            opacity: 1 - opacity
                        });
                    }
                }

                function refreshAll() {
                    options.shade ? enableShade() : disableShade();
                    if (Selection.isAwake()) setOpacity(options.bgOpacity);
                }

                function getShades() {
                    return holder.children();
                }

                return {
                    update: updateAuto,
                    updateRaw: updateShade,
                    getShades: getShades,
                    setBgColor: setBgColor,
                    enable: enableShade,
                    disable: disableShade,
                    resize: resizeShades,
                    refresh: refreshAll,
                    opacity: setOpacity
                };
            }());
            // }}}
            // Selection Module {{{
            var Selection = (function () {
                var awake,
                    hdep = 370,
                    borders = {},
                    handle = {},
                    dragbar = {},
                    seehandles = false;

                // Private Methods
                function insertBorder(type) //{{{
                {
                    var jq = jQuery('<div />').css({
                        position: 'absolute',
                        opacity: options.borderOpacity
                    }).addClass(cssClass(type));
                    jQueryimg_holder.append(jq);
                    return jq;
                }
                //}}}
                function dragDiv(ord, zi) //{{{
                {
                    var jq = jQuery('<div />').mousedown(createDragger(ord)).css({
                        cursor: ord + '-resize',
                        position: 'absolute',
                        zIndex: zi
                    }).addClass('ord-' + ord);

                    if (Touch.support) {
                        jq.bind('touchstart.jcrop', Touch.createDragger(ord));
                    }

                    jQueryhdl_holder.append(jq);
                    return jq;
                }
                //}}}
                function insertHandle(ord) //{{{
                {
                    var hs = options.handleSize,

                        div = dragDiv(ord, hdep++).css({
                            opacity: options.handleOpacity
                        }).addClass(cssClass('handle'));

                    if (hs) {
                        div.width(hs).height(hs);
                    }

                    return div;
                }
                //}}}
                function insertDragbar(ord) //{{{
                {
                    return dragDiv(ord, hdep++).addClass('jcrop-dragbar');
                }
                //}}}
                function createDragbars(li) //{{{
                {
                    var i;
                    for (i = 0; i < li.length; i++) {
                        dragbar[li[i]] = insertDragbar(li[i]);
                    }
                }
                //}}}
                function createBorders(li) //{{{
                {
                    var cl, i;
                    for (i = 0; i < li.length; i++) {
                        switch (li[i]) {
                            case 'n':
                                cl = 'hline';
                                break;
                            case 's':
                                cl = 'hline bottom';
                                break;
                            case 'e':
                                cl = 'vline right';
                                break;
                            case 'w':
                                cl = 'vline';
                                break;
                        }
                        borders[li[i]] = insertBorder(cl);
                    }
                }
                //}}}
                function createHandles(li) //{{{
                {
                    var i;
                    for (i = 0; i < li.length; i++) {
                        handle[li[i]] = insertHandle(li[i]);
                    }
                }
                //}}}
                function moveto(x, y) //{{{
                {
                    if (!options.shade) {
                        jQueryimg2.css({
                            top: px(-y),
                            left: px(-x)
                        });
                    }
                    jQuerysel.css({
                        top: px(y),
                        left: px(x)
                    });
                }
                //}}}
                function resize(w, h) //{{{
                {
                    jQuerysel.width(Math.round(w)).height(Math.round(h));
                }
                //}}}
                function refresh() //{{{
                {
                    var c = Coords.getFixed();

                    Coords.setPressed([c.x, c.y]);
                    Coords.setCurrent([c.x2, c.y2]);

                    updateVisible();
                }
                //}}}

                // Internal Methods
                function updateVisible(select) //{{{
                {
                    if (awake) {
                        return update(select);
                    }
                }
                //}}}
                function update(select) //{{{
                {
                    var c = Coords.getFixed();

                    resize(c.w, c.h);
                    moveto(c.x, c.y);
                    if (options.shade) Shade.updateRaw(c);

                    awake || show();

                    if (select) {
                        options.onSelect.call(api, unscale(c));
                    } else {
                        options.onChange.call(api, unscale(c));
                    }
                }
                //}}}
                function setBgOpacity(opacity, force, now) //{{{
                {
                    if (!awake && !force) return;
                    if (options.bgFade && !now) {
                        jQueryimg.animate({
                            opacity: opacity
                        }, {
                            queue: false,
                            duration: options.fadeTime
                        });
                    } else {
                        jQueryimg.css('opacity', opacity);
                    }
                }
                //}}}
                function show() //{{{
                {
                    jQuerysel.show();

                    if (options.shade) Shade.opacity(bgopacity);
                    else setBgOpacity(bgopacity, true);

                    awake = true;
                }
                //}}}
                function release() //{{{
                {
                    disableHandles();
                    jQuerysel.hide();

                    if (options.shade) Shade.opacity(1);
                    else setBgOpacity(1);

                    awake = false;
                    options.onRelease.call(api);
                }
                //}}}
                function showHandles() //{{{
                {
                    if (seehandles) {
                        jQueryhdl_holder.show();
                    }
                }
                //}}}
                function enableHandles() //{{{
                {
                    seehandles = true;
                    if (options.allowResize) {
                        jQueryhdl_holder.show();
                        return true;
                    }
                }
                //}}}
                function disableHandles() //{{{
                {
                    seehandles = false;
                    jQueryhdl_holder.hide();
                }
                //}}}
                function animMode(v) //{{{
                {
                    if (v) {
                        animating = true;
                        disableHandles();
                    } else {
                        animating = false;
                        enableHandles();
                    }
                }
                //}}}
                function done() //{{{
                {
                    animMode(false);
                    refresh();
                }
                //}}}
                // Insert draggable elements {{{
                // Insert border divs for outline

                if (options.dragEdges && jQuery.isArray(options.createDragbars)) createDragbars(options.createDragbars);

                if (jQuery.isArray(options.createHandles)) createHandles(options.createHandles);

                if (options.drawBorders && jQuery.isArray(options.createBorders)) createBorders(options.createBorders);

                //}}}

                // This is a hack for iOS5 to support drag/move touch functionality
                jQuery(document).bind('touchstart.jcrop-ios', function (e) {
                    if (jQuery(e.currentTarget).hasClass('jcrop-tracker')) e.stopPropagation();
                });

                var jQuerytrack = newTracker().mousedown(createDragger('move')).css({
                    cursor: 'move',
                    position: 'absolute',
                    zIndex: 360
                });

                if (Touch.support) {
                    jQuerytrack.bind('touchstart.jcrop', Touch.createDragger('move'));
                }

                jQueryimg_holder.append(jQuerytrack);
                disableHandles();

                return {
                    updateVisible: updateVisible,
                    update: update,
                    release: release,
                    refresh: refresh,
                    isAwake: function () {
                        return awake;
                    },
                    setCursor: function (cursor) {
                        jQuerytrack.css('cursor', cursor);
                    },
                    enableHandles: enableHandles,
                    enableOnly: function () {
                        seehandles = true;
                    },
                    showHandles: showHandles,
                    disableHandles: disableHandles,
                    animMode: animMode,
                    setBgOpacity: setBgOpacity,
                    done: done
                };
            }());

            //}}}
            // Tracker Module {{{
            var Tracker = (function () {
                var onMove = function () {},
                    onDone = function () {},
                    trackDoc = options.trackDocument;

                function toFront(touch) //{{{
                {
                    jQuerytrk.css({
                        zIndex: 450
                    });

                    if (touch) jQuery(document)
                        .bind('touchmove.jcrop', trackTouchMove)
                        .bind('touchend.jcrop', trackTouchEnd);

                    else if (trackDoc) jQuery(document)
                        .bind('mousemove.jcrop', trackMove)
                        .bind('mouseup.jcrop', trackUp);
                }
                //}}}
                function toBack() //{{{
                {
                    jQuerytrk.css({
                        zIndex: 290
                    });
                    jQuery(document).unbind('.jcrop');
                }
                //}}}
                function trackMove(e) //{{{
                {
                    onMove(mouseAbs(e));
                    return false;
                }
                //}}}
                function trackUp(e) //{{{
                {
                    e.preventDefault();
                    e.stopPropagation();

                    if (btndown) {
                        btndown = false;

                        onDone(mouseAbs(e));

                        if (Selection.isAwake()) {
                            options.onSelect.call(api, unscale(Coords.getFixed()));
                        }

                        toBack();
                        onMove = function () {};
                        onDone = function () {};
                    }

                    return false;
                }
                //}}}
                function activateHandlers(move, done, touch) //{{{
                {
                    btndown = true;
                    onMove = move;
                    onDone = done;
                    toFront(touch);
                    return false;
                }
                //}}}
                function trackTouchMove(e) //{{{
                {
                    onMove(mouseAbs(Touch.cfilter(e)));
                    return false;
                }
                //}}}
                function trackTouchEnd(e) //{{{
                {
                    return trackUp(Touch.cfilter(e));
                }
                //}}}
                function setCursor(t) //{{{
                {
                    jQuerytrk.css('cursor', t);
                }
                //}}}

                if (!trackDoc) {
                    jQuerytrk.mousemove(trackMove).mouseup(trackUp).mouseout(trackUp);
                }

                jQueryimg.before(jQuerytrk);
                return {
                    activateHandlers: activateHandlers,
                    setCursor: setCursor
                };
            }());
            //}}}
            // KeyManager Module {{{
            var KeyManager = (function () {
                var jQuerykeymgr = jQuery('<input type="radio" />').css({
                        position: 'fixed',
                        left: '-120px',
                        width: '12px'
                    }).addClass('jcrop-keymgr'),

                    jQuerykeywrap = jQuery('<div />').css({
                        position: 'absolute',
                        overflow: 'hidden'
                    }).append(jQuerykeymgr);

                function watchKeys() //{{{
                {
                    if (options.keySupport) {
                        jQuerykeymgr.show();
                        jQuerykeymgr.focus();
                    }
                }
                //}}}
                function onBlur(e) //{{{
                {
                    jQuerykeymgr.hide();
                }
                //}}}
                function doNudge(e, x, y) //{{{
                {
                    if (options.allowMove) {
                        Coords.moveOffset([x, y]);
                        Selection.updateVisible(true);
                    }
                    e.preventDefault();
                    e.stopPropagation();
                }
                //}}}
                function parseKey(e) //{{{
                {
                    if (e.ctrlKey || e.metaKey) {
                        return true;
                    }
                    shift_down = e.shiftKey ? true : false;
                    var nudge = shift_down ? 10 : 1;

                    switch (e.keyCode) {
                        case 37:
                            doNudge(e, -nudge, 0);
                            break;
                        case 39:
                            doNudge(e, nudge, 0);
                            break;
                        case 38:
                            doNudge(e, 0, -nudge);
                            break;
                        case 40:
                            doNudge(e, 0, nudge);
                            break;
                        case 27:
                            if (options.allowSelect) Selection.release();
                            break;
                        case 9:
                            return true;
                    }

                    return false;
                }
                //}}}

                if (options.keySupport) {
                    jQuerykeymgr.keydown(parseKey).blur(onBlur);
                    if (ie6mode || !options.fixedSupport) {
                        jQuerykeymgr.css({
                            position: 'absolute',
                            left: '-20px'
                        });
                        jQuerykeywrap.append(jQuerykeymgr).insertBefore(jQueryimg);
                    } else {
                        jQuerykeymgr.insertBefore(jQueryimg);
                    }
                }


                return {
                    watchKeys: watchKeys
                };
            }());
            //}}}
            // }}}
            // API methods {{{
            function setClass(cname) //{{{
            {
                jQuerydiv.removeClass().addClass(cssClass('holder')).addClass(cname);
            }
            //}}}
            function animateTo(a, callback) //{{{
            {
                var x1 = a[0] / xscale,
                    y1 = a[1] / yscale,
                    x2 = a[2] / xscale,
                    y2 = a[3] / yscale;

                if (animating) {
                    return;
                }

                var animto = Coords.flipCoords(x1, y1, x2, y2),
                    c = Coords.getFixed(),
                    initcr = [c.x, c.y, c.x2, c.y2],
                    animat = initcr,
                    interv = options.animationDelay,
                    ix1 = animto[0] - initcr[0],
                    iy1 = animto[1] - initcr[1],
                    ix2 = animto[2] - initcr[2],
                    iy2 = animto[3] - initcr[3],
                    pcent = 0,
                    velocity = options.swingSpeed;

                x1 = animat[0];
                y1 = animat[1];
                x2 = animat[2];
                y2 = animat[3];

                Selection.animMode(true);
                var anim_timer;

                function queueAnimator() {
                    window.setTimeout(animator, interv);
                }
                var animator = (function () {
                    return function () {
                        pcent += (100 - pcent) / velocity;

                        animat[0] = Math.round(x1 + ((pcent / 100) * ix1));
                        animat[1] = Math.round(y1 + ((pcent / 100) * iy1));
                        animat[2] = Math.round(x2 + ((pcent / 100) * ix2));
                        animat[3] = Math.round(y2 + ((pcent / 100) * iy2));

                        if (pcent >= 99.8) {
                            pcent = 100;
                        }
                        if (pcent < 100) {
                            setSelectRaw(animat);
                            queueAnimator();
                        } else {
                            Selection.done();
                            Selection.animMode(false);
                            if (typeof (callback) === 'function') {
                                callback.call(api);
                            }
                        }
                    };
                }());
                queueAnimator();
            }
            //}}}
            function setSelect(rect) //{{{
            {
                setSelectRaw([rect[0] / xscale, rect[1] / yscale, rect[2] / xscale, rect[3] / yscale]);
                options.onSelect.call(api, unscale(Coords.getFixed()));
                Selection.enableHandles();
            }
            //}}}
            function setSelectRaw(l) //{{{
            {
                Coords.setPressed([l[0], l[1]]);
                Coords.setCurrent([l[2], l[3]]);
                Selection.update();
            }
            //}}}
            function tellSelect() //{{{
            {
                return unscale(Coords.getFixed());
            }
            //}}}
            function tellScaled() //{{{
            {
                return Coords.getFixed();
            }
            //}}}
            function setOptionsNew(opt) //{{{
            {
                setOptions(opt);
                interfaceUpdate();
            }
            //}}}
            function disableCrop() //{{{
            {
                options.disabled = true;
                Selection.disableHandles();
                Selection.setCursor('default');
                Tracker.setCursor('default');
            }
            //}}}
            function enableCrop() //{{{
            {
                options.disabled = false;
                interfaceUpdate();
            }
            //}}}
            function cancelCrop() //{{{
            {
                Selection.done();
                Tracker.activateHandlers(null, null);
            }
            //}}}
            function destroy() //{{{
            {
                jQuerydiv.remove();
                jQueryorigimg.show();
                jQueryorigimg.css('visibility', 'visible');
                jQuery(obj).removeData('Jcrop');
            }
            //}}}
            function setImage(src, callback) //{{{
            {
                Selection.release();
                disableCrop();
                var img = new Image();
                img.onload = function () {
                    var iw = img.width;
                    var ih = img.height;
                    var bw = options.boxWidth;
                    var bh = options.boxHeight;
                    jQueryimg.width(iw).height(ih);
                    jQueryimg.attr('src', src);
                    jQueryimg2.attr('src', src);
                    presize(jQueryimg, bw, bh);
                    boundx = jQueryimg.width();
                    boundy = jQueryimg.height();
                    jQueryimg2.width(boundx).height(boundy);
                    jQuerytrk.width(boundx + (bound * 2)).height(boundy + (bound * 2));
                    jQuerydiv.width(boundx).height(boundy);
                    Shade.resize(boundx, boundy);
                    enableCrop();

                    if (typeof (callback) === 'function') {
                        callback.call(api);
                    }
                };
                img.src = src;
            }
            //}}}
            function colorChangeMacro(jQueryobj, color, now) {
                var mycolor = color || options.bgColor;
                if (options.bgFade && supportsColorFade() && options.fadeTime && !now) {
                    jQueryobj.animate({
                        backgroundColor: mycolor
                    }, {
                        queue: false,
                        duration: options.fadeTime
                    });
                } else {
                    jQueryobj.css('backgroundColor', mycolor);
                }
            }

            function interfaceUpdate(alt) //{{{
            // This method tweaks the interface based on options object.
            // Called when options are changed and at end of initialization.
            {
                if (options.allowResize) {
                    if (alt) {
                        Selection.enableOnly();
                    } else {
                        Selection.enableHandles();
                    }
                } else {
                    Selection.disableHandles();
                }

                Tracker.setCursor(options.allowSelect ? 'crosshair' : 'default');
                Selection.setCursor(options.allowMove ? 'move' : 'default');

                if (options.hasOwnProperty('trueSize')) {
                    xscale = options.trueSize[0] / boundx;
                    yscale = options.trueSize[1] / boundy;
                }

                if (options.hasOwnProperty('setSelect')) {
                    setSelect(options.setSelect);
                    Selection.done();
                    delete(options.setSelect);
                }

                Shade.refresh();

                if (options.bgColor != bgcolor) {
                    colorChangeMacro(
                        options.shade ? Shade.getShades() : jQuerydiv,
                        options.shade ? (options.shadeColor || options.bgColor) : options.bgColor);
                    bgcolor = options.bgColor;
                }

                if (bgopacity != options.bgOpacity) {
                    bgopacity = options.bgOpacity;
                    if (options.shade) Shade.refresh();
                    else Selection.setBgOpacity(bgopacity);
                }

                xlimit = options.maxSize[0] || 0;
                ylimit = options.maxSize[1] || 0;
                xmin = options.minSize[0] || 0;
                ymin = options.minSize[1] || 0;

                if (options.hasOwnProperty('outerImage')) {
                    jQueryimg.attr('src', options.outerImage);
                    delete(options.outerImage);
                }

                Selection.refresh();
            }
            //}}}
            //}}}

            if (Touch.support) jQuerytrk.bind('touchstart.jcrop', Touch.newSelection);

            jQueryhdl_holder.hide();
            interfaceUpdate(true);

            var api = {
                setImage: setImage,
                animateTo: animateTo,
                setSelect: setSelect,
                setOptions: setOptionsNew,
                tellSelect: tellSelect,
                tellScaled: tellScaled,
                setClass: setClass,

                disable: disableCrop,
                enable: enableCrop,
                cancel: cancelCrop,
                release: Selection.release,
                destroy: destroy,

                focus: KeyManager.watchKeys,

                getBounds: function () {
                    return [boundx * xscale, boundy * yscale];
                },
                getWidgetSize: function () {
                    return [boundx, boundy];
                },
                getScaleFactor: function () {
                    return [xscale, yscale];
                },
                getOptions: function () {
                    // careful: internal values are returned
                    return options;
                },

                ui: {
                    holder: jQuerydiv,
                    selection: jQuerysel
                }
            };

            if (is_msie) jQuerydiv.bind('selectstart', function () {
                return false;
            });

            jQueryorigimg.data('Jcrop', api);
            return api;
        };
        jQuery.fn.Jcrop = function (options, callback) //{{{
        {
            var api;
            // Iterate over each object, attach Jcrop
            this.each(function () {
                // If we've already attached to this object
                if (jQuery(this).data('Jcrop')) {
                    // The API can be requested this way (undocumented)
                    if (options === 'api') return jQuery(this).data('Jcrop');
                    // Otherwise, we just reset the options...
                    else jQuery(this).data('Jcrop').setOptions(options);
                }
                // If we haven't been attached, preload and attach
                else {
                    if (this.tagName == 'IMG') jQuery.Jcrop.Loader(this, function () {
                        jQuery(this).css({
                            display: 'block',
                            visibility: 'hidden'
                        });
                        api = jQuery.Jcrop(this, options);
                        if (jQuery.isFunction(callback)) callback.call(api);
                    });
                    else {
                        jQuery(this).css({
                            display: 'block',
                            visibility: 'hidden'
                        });
                        api = jQuery.Jcrop(this, options);
                        if (jQuery.isFunction(callback)) callback.call(api);
                    }
                }
            });

            // Return "this" so the object is chainable (jQuery-style)
            return this;
        };
        //}}}
        // jQuery.Jcrop.Loader - basic image loader {{{

        jQuery.Jcrop.Loader = function (imgobj, success, error) {
            var jQueryimg = jQuery(imgobj),
                img = jQueryimg[0];

            function completeCheck() {
                if (img.complete) {
                    jQueryimg.unbind('.jcloader');
                    if (jQuery.isFunction(success)) success.call(img);
                } else window.setTimeout(completeCheck, 50);
            }

            jQueryimg.bind('load.jcloader', completeCheck)
                .bind('error.jcloader', function (e) {
                    jQueryimg.unbind('.jcloader');
                    if (jQuery.isFunction(error)) error.call(img);
                });

            if (img.complete && jQuery.isFunction(success)) {
                jQueryimg.unbind('.jcloader');
                success.call(img);
            }
        };

        //}}}
        // Global Defaults {{{
        jQuery.Jcrop.defaults = {

            // Basic Settings
            allowSelect: true,
            allowMove: true,
            allowResize: true,

            trackDocument: true,

            // Styling Options
            baseClass: 'jcrop',
            addClass: null,
            bgColor: 'black',
            bgOpacity: 0.6,
            bgFade: false,
            borderOpacity: 0.4,
            handleOpacity: 0.5,
            handleSize: null,

            aspectRatio: 0,
            keySupport: true,
            createHandles: ['n', 's', 'e', 'w', 'nw', 'ne', 'se', 'sw'],
            createDragbars: ['n', 's', 'e', 'w'],
            createBorders: ['n', 's', 'e', 'w'],
            drawBorders: true,
            dragEdges: true,
            fixedSupport: true,
            touchSupport: null,

            shade: null,

            boxWidth: 0,
            boxHeight: 0,
            boundary: 2,
            fadeTime: 400,
            animationDelay: 20,
            swingSpeed: 3,

            minSelect: [0, 0],
            maxSize: [0, 0],
            minSize: [0, 0],

            // Callbacks / Event Handlers
            onChange: function () {},
            onSelect: function () {},
            onDblClick: function () {},
            onRelease: function () {}
        };

        // }}}
    };

    return _JCropPluginInjecter;
});