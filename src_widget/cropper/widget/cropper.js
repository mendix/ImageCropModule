dojo.provide("cropper.widget.cropper");
mendix.dom.insertCss(mx.moduleUrl('cropper') + 'widget/lib/jquery_Jcrop_min.css');
mendix.dom.insertCss(mx.moduleUrl('cropper') + 'widget/cropper.css');

mxui.widget.declare('cropper.widget.cropper', {
	addons       : [],
    inputargs: {
        
		cropwidth : 300,
		cropheight : 300,
		startwidth : 100,
		startheight : 100,
		aspectRatio : ''
        
    },
	
	//IMPLEMENTATION
	context : null,
	imgNode : null,
	imgObj : null,
	fileID : null,
	aspectR : 0,
	scaleRatio : 1,
	_hasStarted : false,

	startup : function(){
		if (this._hasStarted)
			return;

		this._hasStarted = true;
		this.domNode['tabIndex'] = -1;
		
        try {
            if (typeof(jQuery) == "undefined")
                dojo.require("cropper.widget.lib.jquery_min");
            
            if (typeof(jQuery.Jcrop) == "undefined")
                dojo.require("cropper.widget.lib.jquery_Jcrop_min");
        }
        catch (e) {
            logger.warn("Errors while loading JCrop:" + e);
        }
		this.actRendered();
	},
    
    update : function(obj, callback){
		this.subscribe({
			guid : obj.getGuid(),
			callback : dojo.hitch(this, this.reloadImage)
		});
		if (obj && obj.getGuid()) 
			this.renderCropper(obj);
		else
			logger.warn(this.id + ".applyContext received empty context");
		
		callback && callback();
	},
	
	renderCropper : function (obj) {
		this.imgObj = obj;
		this.fileID = obj.getAttribute('FileID');
		this.constructImageHelper();
		
		this.subscribe({
			guid : obj.getGUID(),
			callback : this.objChanged
		});
	},
	
	reloadImage : function () {
		this.scaleRatio = 1;
		this.constructImageHelper();
    },
    
    constructImageHelper : function() {		
		dojo.empty(this.domNode);
		this.imgNode = mxui.dom.img({ 'src' : '/file?fileID=' + this.fileID + '&' + (+new Date).toString(36) }); // New date to kill caching
		dojo.style(this.imgNode, {
			'left': '-50000px',
			'position' : 'absolute'
		});
		
		dojo.addClass(this.domNode, 'ImageCropper');
		
		this.imgNode.onload = dojo.hitch(this, this.loadCrop);
		this.domNode.appendChild(this.imgNode);
	},
	
	loadCrop : function () {
		var aspectArr = this.imgObj.getAttribute(this.aspectRatio).split(':');
		if( aspectArr == null )
			aspectArr = "";
		this.aspectR = (aspectArr.length == 2)?parseInt(aspectArr[0]) / parseInt(aspectArr[1]):parseInt(this.aspectRatio);
	
		if (this.imgNode.offsetWidth > this.cropwidth || this.imgNode.offsetHeight > this.cropheight) {
			if (this.imgNode.offsetWidth >= this.imgNode.offsetHeight) {
				this.scaleRatio = this.cropwidth/this.imgNode.offsetWidth;
				if( this.scaleRatio == 0 )
					this.scaleRatio = 1;
				
				dojo.style(this.imgNode, {
					'width' : this.cropwidth+'px',
					'height' : this.scaleRatio*this.imgNode.offsetHeight+'px'
				});
			} else {
				this.scaleRatio = this.cropheight/this.imgNode.offsetHeight;
				dojo.style(this.imgNode, {
					'width' : this.scaleRatio*this.imgNode.offsetWidth+'px',
					'height' : this.cropheight+'px'
				});
			}
		}
		dojo.style(this.imgNode, 'left', '0px');
		var setSelectArr = [];
		var existingAttrs = [];
		existingAttrs.push(this.imgObj.getAttribute('crop_x1'));
		existingAttrs.push(this.imgObj.getAttribute('crop_y1'));
		existingAttrs.push(this.imgObj.getAttribute('crop_x2'));
		existingAttrs.push(this.imgObj.getAttribute('crop_y2'));
		
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
            jQuery.Jcrop(this.imgNode, {
                onSelect : dojo.hitch(this, this.cropOnSelect),
                bgColor:     'black',
                bgOpacity:   .4,
                setSelect:   setSelectArr,
                aspectRatio: this.aspectR
            });
        }
        catch (e) {
            logger.warn("Errors while loading JCrop:" + e);
        }
	},
	
	cropOnSelect : function (c) {
		this.changeObj(c.x, c.x2, c.y, c.y2, c.h, c.w);
	},
	
	changeObj : function (x, x2, y, y2, h, w) {
		if (this.imgObj && x < 10000 && x2 < 10000 && y < 10000 && y2 < 10000) {
			this.imgObj.setAttribute('crop_x1', Math.round(x/this.scaleRatio));
			this.imgObj.setAttribute('crop_x2', Math.round(x2/this.scaleRatio));
			this.imgObj.setAttribute('crop_y1', Math.round(y/this.scaleRatio));
			this.imgObj.setAttribute('crop_y2', Math.round(y2/this.scaleRatio));
			this.imgObj.setAttribute('crop_height', Math.round(h/this.scaleRatio));
			this.imgObj.setAttribute('crop_width', Math.round(w/this.scaleRatio));
			this.imgObj.save({ callback : function () {} });
		}
	},
	
	objectUpdateNotification : function () {
        if (this.imgObj != null)
            this.reloadImage();
	},
	
	objChanged : function (objId) {
		mx.processor.get({
			guid : objId,
			callback : this.objectUpdateNotification
		}, this);
	},
	
	uninitialize : function(){
	}
});