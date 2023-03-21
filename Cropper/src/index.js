import _widgetBase from 'MxWidgetBase';
import declare from 'dojoBaseDeclare';
import * as widgetConf from '../conf/widget.config.json';
import {
    getImageUrlFromObject,
    isMxImageObject
} from "./helpers/utils";

//import dependencies
import $ from "jquery";
require('imports-loader?jQuery=jquery!../node_modules/jquery-jcrop/js/jquery.Jcrop');
require('imports-loader?jQuery=jquery!../node_modules/jquery-jcrop/js/jquery.color');
import './style/style.scss';
import "jquery-jcrop/css/Jcrop.gif";
import "jquery-jcrop/css/jquery.Jcrop.min.css";


export default declare(`${widgetConf.name}.widget.${widgetConf.name}`, [_widgetBase], {

    // INTERNAL
    _contextObject: null,
    imgNode: null,
    fileID: null,
    aspectR: 0,
    scaleRatio: 1,
    JCropAPI: null,

    postCreate() {
        $(this.domNode).addClass("jcrop-mx-widget");
        $(this.domNode).attr("tabIndex", -1);

        this.JCropAPI = null;
        this.addOnDestroy(() => {
            this.JCropAPI && this.JCropAPI.destroy && this.JCropAPI.destroy();
        });
    },

    update(contextObject, callback) {
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
        this.unsubscribeAll();
        this.subscribe({
            guid: this._contextObject.getGuid(),
            callback: $.proxy(() => {
                this._updateRendering();
            }, this)
        });
    },

    _updateRendering(callback) {
        var src = getImageUrlFromObject(this._contextObject);
        if (this.imgNode === null) {
            $(this.domNode).empty();
            this.imgNode = $("<img>").attr("src", src).css("display", "none");
            $(this.imgNode).appendTo(this.domNode);
        } else {
            $(this.imgNode).attr("src", src);
        }
        this._initJCrop(callback);
    },

    _initJCrop(callback) {
        if (this.JCropAPI !== null && this.JCropAPI.destroy) {
            // destroy current JCrop instance, in order to reset
            this.JCropAPI.destroy();
            this.JCropAPI = null;
        }

        var widget = this;
        var cropOptions = this._getCroppingOptions();

        $(this.imgNode).Jcrop(cropOptions, function () {
            widget.JCropAPI = this;
            widget._executeCallback(callback);
        });
    },

    _handleError(errorMessage) {
        $(this.domNode).empty();
        $("<div>").addClass("alert alert-danger").text(errorMessage).appendTo(this.domNode);
    },

    _setCroppingCoordinates(coordinates) {
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
        var options = {};
        options.aspectRatio = this._getAspectRatio();
        options.bgColor = 'transparent';
        options.bgOpacity = 0.4;
        options.onSelect = $.proxy(this._setCroppingCoordinates, this);
        options.onChange = $.proxy(this._setCroppingCoordinates, this);
        options.onRelease = $.proxy(this._setCroppingCoordinates, this);
        options.setSelect = [0, 0, this.startwidth, this.startheight];
        options.boxWidth = this.cropwidth;
        options.boxHeight = this.cropheight;

        return options;
    },
    _getAspectRatio() {
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
