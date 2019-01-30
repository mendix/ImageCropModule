import _widgetBase from 'MxWidgetBase';
import declare from 'dojoBaseDeclare';
import * as widgetConf from '../conf/widget.config.json';
import {
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
    imgNode: null,
    fileID: null,
    aspectR: 0,
    scaleRatio: 1,
    JCropAPI: null,

    postCreate() {
        logger.debug(`${this.id} >> postCreate`);
        $(this.domNode).addClass("jcrop-mx-widget");
        domAttrSet(this.domNode, "tabIndex", -1);
    },

    update(contextObject, callback) {
        logger.debug(`${this.id} >> update`);

        if (contextObject && isMxImageObject(contextObject)) {
            this._contextObject = contextObject;
            this.fileID = this._contextObject.get('FileID');
            this._updateRendering(callback);
            this._addSubscriptions();
        } else {
            this._handleError(`${widgetConf.name} should be initiated in a nonempty context object that inherits from 'System.Image' Entity.`);
            this._executeCallback(callback);
        }
    },

    _addSubscriptions() {
        logger.debug(`${this.id} >> _addSubscriptions`);
        this.unsubscribeAll();
        this.subscribe({
            guid: this._contextObject.getGuid(),
            callback: hitch(this, () => {
                logger.debug(`${this.id} >> subscription has been set successfully`);
                this._updateRendering();
            })
        });
    },

    _updateRendering(callback) {
        logger.debug(`${this.id} >> _updateRendering`);
        var src = '/file?fileID=' + this.fileID + '&' + (+new Date()).toString(36);
        if (this.imgNode === null) {
            domEmpty(this.domNode);
            this.imgNode = domCreate('img', {
                src
            });
            domPlace(this.imgNode, this.domNode);
        } else {
            domAttrSet(this.imgNode, 'src', src);
        }
        this._initJCrop(callback);
    },

    _initJCrop(callback) {
        logger.debug(`${this.id} >> _initJCrop`);
        if (this.JCropAPI) {
            // destroy current JCrop instance, in order to reset
            this.JCropAPI.destroy();
        }
        var widget = this;
        var cropOptions = this._getCroppingOptions();

        $(this.imgNode).Jcrop(cropOptions, function () {
            logger.debug(`${widgetSelfRef.id} >> _getReferenceToJCropInstance`);
            widget.JCropAPI = this;
            widget._executeCallback(callback);
        });
    },

    uninitialize() {
        logger.debug('cropper.widget.cropper uninitialize');
        this.unsubscribeAll();
    },

    _handleError(errorMessage) {
        logger.debug(`${this.id} >> _handleError`);
        domEmpty(this.domNode);
        const errorMessageNode = domCreate("div", {
            class: "alert alert-danger",
            innerText: errorMessage
        });
        domPlace(errorMessageNode, this.domNode);
    },

    _setCroppingCoordinates(coordinates) {
        logger.debug(`${this.id} >> _setCroppingCoordinates`);
        if (coordinates) {
            this._contextObject.set('crop_x1', Math.round(coordinates.x));
            this._contextObject.set('crop_x2', Math.round(coordinates.x2));
            this._contextObject.set('crop_y1', Math.round(coordinates.y));
            this._contextObject.set('crop_y2', Math.round(coordinates.y2));
            this._contextObject.set('crop_height', Math.round(coordinates.h));
            this._contextObject.set('crop_width', Math.round(coordinates.w));
        }

    },
    _getCroppingOptions() {
        logger.debug(`${this.id} >> _getCroppingOptions`);
        var options = {};
        options.aspectRatio = this._getAspectRatio();
        options.bgColor = 'black';
        options.bgOpacity = 0.4;
        options.onSelect = hitch(this, this._setCroppingCoordinates);
        options.onChange = hitch(this, this._setCroppingCoordinates);
        options.onRelease = hitch(this, this._setCroppingCoordinates);
        options.setSelect = [0, 0, this.startwidth, this.startheight];
        options.boxWidth = this.cropwidth;
        options.boxHeight = this.cropheight;

        return options;
    },
    _getAspectRatio() {
        logger.debug(`${this.id} >> _getAspectRatio`);
        var aspectRatio = null,
            aspectRatioArr = null,
            givenWidth = null,
            givenHeight = null;
        aspectRatioArr = this._contextObject.get(this.aspectRatio).split(':');
        givenWidth = parseInt(aspectRatioArr[0], 10);
        givenHeight = parseInt(aspectRatioArr[1], 10);
        aspectRatio = givenWidth / givenHeight;
        return aspectRatio;
    },
    _executeCallback(callback) {
        if (callback && typeof callback === "function") {
            callback();
        }
    }

});