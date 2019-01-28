import _widgetBase from 'MxWidgetBase';
import declare from 'dojoBaseDeclare';
import * as widgetConf from '../conf/widget.config.json';
import {
    get as domAttrGet,
    set as domAttrSet
} from 'dojo/dom-attr';
import {
    create as domCreate,
    place as domPlace,
    empty as domEmpty
} from 'dojo/dom-construct';

import {
    hitch
} from 'dojo/_base/lang';


//import dependencies
import $ from "jquery";
require('imports-loader?jQuery=jquery!../node_modules/jquery-jcrop/js/jquery.Jcrop');
require('imports-loader?jQuery=jquery!../node_modules/jquery-jcrop/js/jquery.color');
import './style/style.scss';
import "../node_modules/jquery-jcrop/css/Jcrop.gif";
import "../node_modules/jquery-jcrop/css/jquery.Jcrop.min.css";


export default declare(`${widgetConf.name}.widget.${widgetConf.name}`, [_widgetBase], {

    // INTERNAL
    _mxObj: null,
    context: null,
    imgNode: null,
    fileID: null,
    aspectR: 0,
    scaleRatio: 1,

    _c: null,
    _cropApi: null,


    postCreate() {
        console.debug(`${this.id} >> postCreate`);
        domAttrSet(this.domNode, "tabIndex", -1);
    },


    update(contextObject, callback) {
        console.debug(`${this.id} >> update`);
        if (contextObject) {
            this._mxObj = contextObject;
            this._renderCropper();
            this._addSubscriptions();
        } else {
            this._handleError(`${widgetConf.name} should be initiated in a nonempty context object.`);
        }
        if (callback && typeof callback === "function") {
            callback();
        }
    },

    _addSubscriptions() {
        console.debug(`${this.id} >> _addSubscriptions`);
        this.unsubscribeAll();
        this.subscribe({
            guid: this._mxObj.getGuid(),
            callback: hitch(this, () => {
                console.debug(`${this.id} >> subscription has been set successfully`);
                this.reloadImage();
            })
        });
    },

    _renderCropper() {
        console.debug(`${this.id} >> _renderCropper`);
        this.fileID = this._mxObj.get('FileID');
        this._constructImageHelper();
    },

    reloadImage: function () {
        logger.debug('cropper.widget.cropper reloadImage');
        this.scaleRatio = 1;
        this._constructImageHelper();
    },

    _constructImageHelper() {
        console.debug(`${this.id} >> _constructImageHelper`);
        var src = '/file?fileID=' + this.fileID + '&' + (+new Date()).toString(36);

        if (this.imgNode === null) {
            domEmpty(this.domNode);
            this.imgNode = domCreate('img', {
                'src': src
            }); // New date to kill caching

            domStyle.set(this.imgNode, {
                'left': '-50000px',
                'position': 'absolute'
            });

            this.imgNode.onload = lang.hitch(this, this.loadCrop);
            this.domNode.appendChild(this.imgNode);
        } else {
            console.log('set');
            domAttr.set(this.imgNode, 'src', src);
            if (this._cropApi) {
                this._cropApi.setImage(src);
            }
        }
    },

    loadCrop: function () {
        logger.debug('cropper.widget.cropper loadCrop');
        var aspectArr = this._mxObj.get(this.aspectRatio).split(':');

        if (aspectArr === null) {
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
                    'width': this.cropwidth + 'px',
                    'height': this.scaleRatio * this.imgNode.offsetHeight + 'px'
                });
            } else {
                this.scaleRatio = this.cropheight / this.imgNode.offsetHeight;
                domStyle.set(this.imgNode, {
                    'width': this.scaleRatio * this.imgNode.offsetWidth + 'px',
                    'height': this.cropheight + 'px'
                });
            }
        }

        if (this.scaleRatio === 0) {
            this.scaleRatio = 1;
        }

        domStyle.set(this.imgNode, 'left', '0px');
        var setSelectArr = [];
        var existingAttrs = [];
        existingAttrs.push(this._mxObj.get('crop_x1'));
        existingAttrs.push(this._mxObj.get('crop_y1'));
        existingAttrs.push(this._mxObj.get('crop_x2'));
        existingAttrs.push(this._mxObj.get('crop_y2'));

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
                onSelect: lang.hitch(this, this.cropOnSelect),
                bgColor: 'black',
                bgOpacity: 0.4,
                setSelect: setSelectArr,
                aspectRatio: this.aspectR
            }, function () {
                _this._cropApi = this;
                console.log(this);
            });
        } catch (e) {
            logger.warn("Errors while loading JCrop:" + e);
        }
    },

    cropOnSelect: function (c) {
        logger.debug('cropper.widget.cropper cropOnSelect', c);
        this.changeObj(c);
    },

    _changedCrop: function (c) {
        if (
            this._c === null ||
            (this._c.x !== c.x || this._c.x2 !== c.x2 ||
                this._c.y !== c.y || this._c.y2 !== c.y2 ||
                this._c.h !== c.h || this._c.w !== c.w)
        ) {
            this._c = c;
            return true;
        }
        return false;
    },

    changeObj: function (c) {
        logger.debug('cropper.widget.cropper changeObj', this.scaleRatio);
        if (this._mxObj && c.x < 10000 && c.x2 < 10000 && c.y < 10000 && c.y2 < 10000 && this.scaleRatio > 0) {
            this._mxObj.set('crop_x1', Math.round(c.x / this.scaleRatio));
            this._mxObj.set('crop_x2', Math.round(c.x2 / this.scaleRatio));
            this._mxObj.set('crop_y1', Math.round(c.y / this.scaleRatio));
            this._mxObj.set('crop_y2', Math.round(c.y2 / this.scaleRatio));
            this._mxObj.set('crop_height', Math.round(c.h / this.scaleRatio));
            this._mxObj.set('crop_width', Math.round(c.w / this.scaleRatio));
            if (this._changedCrop(c)) {
                mx.data.commit({
                    mxobj: this._mxObj,
                    callback: function () {
                        logger.debug('cropper.widget.cropper changeObj.commit');
                    }
                }, this);
            }
        }
    },

    objectUpdateNotification: function () {
        logger.debug('cropper.widget.cropper objectUpdateNotification');
        if (this._mxObj !== null) {
            this.reloadImage();
        }
    },

    objChanged: function (objId) {
        logger.debug('cropper.widget.cropper objChanged');
        mx.data.get({
            guid: objId,
            callback: lang.hitch(this, this.objectUpdateNotification)
        }, this);
    },

    uninitialize: function () {
        logger.debug('cropper.widget.cropper uninitialize');
        this.unsubscribeAll();
    },
    _handleError(errorMessage) {
        domEmpty(this.domNode);
        const errorMessageNode = domCreate("div", {
            class: "alert alert-danger",
            innerText: errorMessage
        });
        domPlace(errorMessageNode, this.domNode);
    }

});