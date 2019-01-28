import _widgetBase from 'MxWidgetBase';
import declare from 'dojoBaseDeclare';
import * as widgetConf from '../conf/widget.config.json';
import {
    get as domAttrGet,
    set as domAttrSet
} from 'dojo/dom-attr';
import {
    get as domStyleGet,
    set as domStyleSet
} from 'dojo/dom-style';
import {
    create as domCreate,
    place as domPlace,
    empty as domEmpty
} from 'dojo/dom-construct';

import {
    hitch
} from 'dojo/_base/lang';
import {
    isMxImageObject
} from "./helpers/utils";

//import dependencies
import $ from "jquery";
require('imports-loader?jQuery=jquery!../node_modules/jquery-jcrop/js/jquery.Jcrop');
require('imports-loader?jQuery=jquery!../node_modules/jquery-jcrop/js/jquery.color');
import './style/style.scss';
import "../node_modules/jquery-jcrop/css/Jcrop.gif";
import "../node_modules/jquery-jcrop/css/jquery.Jcrop.min.css";


export default declare(`${widgetConf.name}.widget.${widgetConf.name}`, [_widgetBase], {

    // INTERNAL
    _contextObject: null,
    context: null,
    imgNode: null,
    fileID: null,
    aspectR: 0,
    scaleRatio: 1,

    _c: null,
    JCropAPI: null,


    postCreate() {
        console.debug(`${this.id} >> postCreate`);
        domAttrSet(this.domNode, "tabIndex", -1);
    },


    update(contextObject, callback) {
        console.debug(`${this.id} >> update`);
        if (contextObject && isMxImageObject(contextObject)) {
            this._contextObject = contextObject;
            this.fileID = this._contextObject.get('FileID');

            this._constructImageHelper();
            this._addSubscriptions();
        } else {
            this._handleError(`${widgetConf.name} should be initiated in a nonempty context object that inherits from 'System.Image' Entity.`);
        }
        if (callback && typeof callback === "function") {
            callback();
        }
    },

    _addSubscriptions() {
        console.debug(`${this.id} >> _addSubscriptions`);
        this.unsubscribeAll();
        this.subscribe({
            guid: this._contextObject.getGuid(),
            callback: hitch(this, () => {
                console.debug(`${this.id} >> subscription has been set successfully`);
                this._reloadImage();
            })
        });
    },


    _reloadImage: function () {
        console.debug(`${this.id} >> _reloadImage`);
        this.scaleRatio = 1;
        this._constructImageHelper();
    },

    _constructImageHelper() {
        console.debug(`${this.id} >> _constructImageHelper`);
        var src = '/file?fileID=' + this.fileID + '&' + (+new Date()).toString(36);
        if (this.imgNode === null) {
            console.debug(`${this.id} >> _startLoadingImage`);
            domEmpty(this.domNode);
            this.imgNode = domCreate('img', {
                src
            }); // New date to kill caching
            this.imgNode.onload = hitch(this, this._loadCrop);
            domPlace(this.imgNode, this.domNode);
        } else {
            console.debug(`${this.id} >> _reloadImage`);
            domAttrSet(this.imgNode, 'src', src);
            if (this.JCropAPI) {
                this.JCropAPI.setImage(src);
            }
        }
    },

    _loadCrop: function () {
        console.debug(`${this.id} >> _loadCrop`);
        var widgetSelfRef = this;
        $(this.imgNode).Jcrop({
            onSelect: hitch(this, this.cropOnSelect),
            bgColor: 'black',
            bgOpacity: 0.4,
            setSelect: [0, 0, this.startWidth, this.startHeight],
            aspectRatio: this.aspectR,
            boxWidth: this.cropwidth,
            boxHeight: this.cropheight,
        }, function () {
            console.debug(`${this.id} >> _getReferenceToJCropInstance`);
            widgetSelfRef.JCropAPI = this;
        });
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
        if (this._contextObject && c.x < 10000 && c.x2 < 10000 && c.y < 10000 && c.y2 < 10000 && this.scaleRatio > 0) {
            this._contextObject.set('crop_x1', Math.round(c.x / this.scaleRatio));
            this._contextObject.set('crop_x2', Math.round(c.x2 / this.scaleRatio));
            this._contextObject.set('crop_y1', Math.round(c.y / this.scaleRatio));
            this._contextObject.set('crop_y2', Math.round(c.y2 / this.scaleRatio));
            this._contextObject.set('crop_height', Math.round(c.h / this.scaleRatio));
            this._contextObject.set('crop_width', Math.round(c.w / this.scaleRatio));
            if (this._changedCrop(c)) {
                mx.data.commit({
                    mxobj: this._contextObject,
                    callback: function () {
                        logger.debug('cropper.widget.cropper changeObj.commit');
                    }
                }, this);
            }
        }
    },

    objectUpdateNotification: function () {
        logger.debug('cropper.widget.cropper objectUpdateNotification');
        if (this._contextObject !== null) {
            this._reloadImage();
        }
    },

    objChanged: function (objId) {
        logger.debug('cropper.widget.cropper objChanged');
        mx.data.get({
            guid: objId,
            callback: hitch(this, this.objectUpdateNotification)
        }, this);
    },

    uninitialize: function () {
        logger.debug('cropper.widget.cropper uninitialize');
        this.unsubscribeAll();
    },

    _getCroppingOptions() {
        console.debug(`${this.id} >> _getCroppingOptions`);
        var options = {};
        // options.aspectRatio = this._getAspectRation();
        options.bgColor = 'black';
        options.bgOpacity = 0.4;
        // options.onSelect = lang.hitch(this, this._setCroppingCoordinates);
        // options.onChange = lang.hitch(this, this._setCroppingCoordinates);
        // options.onRelease = lang.hitch(this, this._setCroppingCoordinates);
        // options.setSelect = [0, 0, this.startWidth, this.startHeight];
        options.boxWidth = this.cropwidth;
        options.boxHeight = this.cropheight;

        return options;
    },

    _handleError(errorMessage) {
        console.debug(`${this.id} >> _handleError`);
        domEmpty(this.domNode);
        const errorMessageNode = domCreate("div", {
            class: "alert alert-danger",
            innerText: errorMessage
        });
        domPlace(errorMessageNode, this.domNode);
    },


    _setCroppingCoordinates: function (coordinates) {
        console.debug(`${this.id} >> _setCroppingCoordinates`);
        if (coordinates) {
            this._contextObject.set('crop_x1', Math.round(coordinates.x));
            this._contextObject.set('crop_x2', Math.round(coordinates.x2));
            this._contextObject.set('crop_y1', Math.round(coordinates.y));
            this._contextObject.set('crop_y2', Math.round(coordinates.y2));
            this._contextObject.set('crop_height', Math.round(coordinates.h));
            this._contextObject.set('crop_width', Math.round(coordinates.w));
        }
    },

    _getCroppingOptions: function () {
        console.debug(`${this.id} >> _getCroppingOptions`);
        var options = {};
        options.aspectRatio = this._getAspectRation();
        options.bgColor = 'black';
        options.bgOpacity = 0.4;
        options.onSelect = hitch(this, this._setCroppingCoordinates);
        options.onChange = hitch(this, this._setCroppingCoordinates);
        options.onRelease = hitch(this, this._setCroppingCoordinates);
        options.setSelect = [0, 0, this.startWidth, this.startHeight];
        options.boxWidth = this.cropwidth;
        options.boxHeight = this.cropheight;

        return options;
    },

    _getAspectRation: function () {
        var aspectRatio = null,
            aspectRatioArr = null,
            givenWidth = null,
            givenHeight = null;
        if (this.keepOriginalAspectRatio) {
            aspectRatio = this._originalAspectRatio;
        } else {
            aspectRatioArr = this._contextObject.get(this.aspectRatio).split(':');
            givenWidth = parseInt(aspectRatioArr[0], 10);
            givenHeight = parseInt(aspectRatioArr[1], 10);
            aspectRatio = givenWidth / givenHeight;
        }

        return aspectRatio;
    }

});