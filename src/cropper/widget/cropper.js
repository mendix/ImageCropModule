/*jslint white:true, nomen: true, plusplus: true */
/*global mx, define, require, browser, devel, console, setTimeout */
/*mendix */

/**
	Image Cropper
	========================
    Part of the Image Crop Module
    ========================
	@copyright : Mendix bv
	@license   : Apache License, Version 2.0, January 2004
*/
define([
    'dojo/_base/declare',
    'mxui/widget/_WidgetBase',
    'dijit/_TemplatedMixin',

    'mxui/dom',
    'dojo/dom-style',
    'dojo/_base/array',
    'dojo/_base/lang',

    'dojo/text!cropper/widget/templates/cropper.html',
    'cropper/lib/jquery_bundle',
], function (declare, _WidgetBase, _TemplatedMixin, dom, domStyle, dojoArray, lang, widgetTemplate, _jQuery) {
    'use strict';

    var $ = _jQuery.noConflict(true);

    return declare('cropper.widget.cropper', [_WidgetBase, _TemplatedMixin], {

        templateString: widgetTemplate,

        // INTERNAL
        _mxObj: null,
        context : null,
        imgNode : null,
        imgObj : null,
        fileID : null,
        aspectR : 0,
        scaleRatio : 1,
        _hasStarted : false,

        _cropApi: null,

        startup: function () {
            //logger.level(logger.DEBUG); // Uncomment to debug
            logger.debug('cropper.widget.cropper startup');
            if(this._hasStarted) {
                return;
            }

            this._hasStarted = true;
            this.domNode['tabIndex'] = -1;
        },

        update: function (obj, callback) {
            logger.debug('cropper.widget.cropper update', obj);
            if (this._handles && this._handles.length && this._handles.length > 0) {
                dojoArray.forEach(this._handles, function (handle) {
                    mx.data.unsubscribe(handle);
                });
            }
            this._handles = [];

            this._mxObj = obj;
            this._renderCropper();

            this._addSubscriptions();
            if (typeof callback !== 'undefined') {
                callback();
            }
        },

        _addSubscriptions: function () {
            logger.debug('cropper.widget.cropper addSubscriptions');
            if (!this._mxObj) {
                return;
            }
            var subscription = mx.data.subscribe({
                guid : this._mxObj.getGuid(),
                callback : lang.hitch(this, this.reloadImage)
            });
            this._handles.push(subscription);
        },

        _renderCropper: function () {
            logger.debug('cropper.widget.cropper _renderCropper');
            if (!this._mxObj) {
                return;
            }
            this.imgObj = this._mxObj;
            this.fileID = this._mxObj.get('FileID');

            this.constructImageHelper();

            mx.data.subscribe({
                guid : this._mxObj.getGuid(),
                callback : this.objChanged
            });
        },

        reloadImage : function () {
            logger.debug('cropper.widget.cropper reloadImage');
            this.scaleRatio = 1;
            this.constructImageHelper();
        },

        constructImageHelper : function() {
            logger.debug('cropper.widget.cropper constructImageHelper');
            dojo.empty(this.domNode);

            this.imgNode = dom.create('img', {
                'src' : '/file?fileID=' + this.fileID + '&' + (+new Date).toString(36)
            }); // New date to kill caching

            domStyle.set(this.imgNode, {
                'left': '-50000px',
                'position' : 'absolute'
            });

            this.imgNode.onload = lang.hitch(this, this.loadCrop);
            this.domNode.appendChild(this.imgNode);
        },

        loadCrop : function () {
            logger.debug('cropper.widget.cropper loadCrop');
            var aspectArr = this.imgObj.get(this.aspectRatio).split(':');

            if (aspectArr == null) {
                aspectArr = "";
            }

            this.aspectR = 0;
            if (aspectArr.length === 2) {
                var a = parseInt(aspectArr[0], 10),
                    b = parseInt(aspectArr[1], 10);
                this.aspectR = (isNaN(a) ? 0 : a) / (isNaN(b) ? 1 : b);
            } else {
                var aR = parseInt(this.aspectRatio, 10);
                this.aspectR = isNaN(aR) ? 0 : aR;
            }

            //this.aspectR = (aspectArr.length === 2) ? parseInt(aspectArr[0], 10) / parseInt(aspectArr[1], 10) : parseInt(this.aspectRatio, 10);

            if (this.imgNode.offsetWidth > this.cropwidth || this.imgNode.offsetHeight > this.cropheight) {
                if (this.imgNode.offsetWidth >= this.imgNode.offsetHeight) {
                    this.scaleRatio = this.cropwidth / this.imgNode.offsetWidth;
                    if (this.scaleRatio === 0) {
                        this.scaleRatio = 1;
                    }
                    domStyle.set(this.imgNode, {
                        'width' : this.cropwidth+'px',
                        'height' : this.scaleRatio*this.imgNode.offsetHeight+'px'
                    });
                } else {
                    this.scaleRatio = this.cropheight / this.imgNode.offsetHeight;
                    domStyle.set(this.imgNode, {
                        'width' : this.scaleRatio*this.imgNode.offsetWidth+'px',
                        'height' : this.cropheight+'px'
                    });
                }
            }

            if (this.scaleRatio === 0) {
                this.scaleRatio = 1;
            }

            domStyle.set(this.imgNode, 'left', '0px');
            var setSelectArr = [];
            var existingAttrs = [];
            existingAttrs.push(this.imgObj.get('crop_x1'));
            existingAttrs.push(this.imgObj.get('crop_y1'));
            existingAttrs.push(this.imgObj.get('crop_x2'));
            existingAttrs.push(this.imgObj.get('crop_y2'));

            if (Math.max.apply(Math, existingAttrs) > 0) {
                setSelectArr = existingAttrs;
            } else if (this.startwidth > 0 && this.startheight > 0) {
                var width = Math.min(this.startwidth, this.imgNode.offsetWidth);
                var height = Math.min(this.startheight, this.imgNode.offsetHeight);
                setSelectArr.push(width);
                setSelectArr.push(height);
                setSelectArr.push(0);
                setSelectArr.push(0);
                this.changeObj(0, width, 0, height, height, width);
            } else {
                setSelectArr = undefined;
            }

            try {
                var _this = this;
                // this._cropApi.destroy();
                // this._cropApi = null;
                _jQuery(this.imgNode).Jcrop({
                    onSelect : lang.hitch(this, this.cropOnSelect),
                    bgColor: 'black',
                    bgOpacity: .4,
                    setSelect: setSelectArr,
                    aspectRatio: this.aspectR
                }, function () {
                    _this._cropApi = this;
                });
            }
            catch (e) {
                logger.warn("Errors while loading JCrop:" + e);
            }
        },

        cropOnSelect : function (c) {
            logger.debug('cropper.widget.cropper cropOnSelect', c);
            this.changeObj(c.x, c.x2, c.y, c.y2, c.h, c.w);
        },

        changeObj : function (x, x2, y, y2, h, w) {
            logger.debug('cropper.widget.cropper changeObj', this.scaleRatio);
            if (this.imgObj && x < 10000 && x2 < 10000 && y < 10000 && y2 < 10000 && this.scaleRatio > 0) {
                this.imgObj.set('crop_x1', Math.round(x/this.scaleRatio));
                this.imgObj.set('crop_x2', Math.round(x2/this.scaleRatio));
                this.imgObj.set('crop_y1', Math.round(y/this.scaleRatio));
                this.imgObj.set('crop_y2', Math.round(y2/this.scaleRatio));
                this.imgObj.set('crop_height', Math.round(h/this.scaleRatio));
                this.imgObj.set('crop_width', Math.round(w/this.scaleRatio));
                mx.data.save({
                    mxobj: this.imgObj,
                    callback: function () {
                        logger.debug('cropper.widget.cropper changeObj.save');
                    }
                });
            }
        },

        objectUpdateNotification : function () {
            logger.debug('cropper.widget.cropper objectUpdateNotification');
            if (this.imgObj !== null)
                this.reloadImage();
        },

        objChanged : function (objId) {
            logger.debug('cropper.widget.cropper objChanged');
            mx.data.get({
                guid : objId,
                callback : this.objectUpdateNotification
            }, this);
        },

        uninitialize: function () {
            logger.debug('cropper.widget.cropper uninitialize');
            if (this._handles.length > 0) {
                dojoArray.forEach(this._handles, function (handle) {
                    mx.data.unsubscribe(handle);
                });
            }
        }

    });
});
