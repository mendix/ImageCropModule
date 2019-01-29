# ImageCropModule
This module can transform images based on a selection made in the browser.

## Typical usage scenario

Allow users to resize and alter their own images.
Allow users to shrink or convert their images.
Enforcing a set size/aspect ratio or allowing the user control it.

## Configuration 

The module is pre-configured to use the ImageCrop entity, you can choose to inherit from this entity, set an association to the entity or copy the actions you want to have. 

The imagecrop widget and Java actions are compatible with any subclass of System.Image, as long as all the "crop_" are available with identical names. 

Once you have decided on the entities and relationships in the domain models, you can either use the existing pages or use your own pages.

## Default functionality

The CropImage_Overview, allows you to upload new images using a simple new/edit button
After uploading the image you can 'edit' the image. Pressing the button 'Edit Image' will create a new 'draft' copy of the original image and opens page: CropImage_Crop
The page 'CropImage_Crop' allows you to edit the (draft) image. 
'Crop', changes the image. This will crop the area outside the box.
'Resize', changes the image to the size of the selection box.
'Grayscale', converts the image to an image in black/white (grayscale)
'Aspect Ratio', clicking on the aspect ratio allows the user to change the Aspect Ratio and force the selection to be in a specific ratio.  Clicking the button opens a popup and allows the user to change the ratio to a valid ratio such as 4:3 or reset it to blank or 0 for a free selection shape. 
'Apply Changes', copies the image as you see it in the draft back into the original CropImage. The page is closed, and the draft is being removed.
'Revert Changes', reverts all changes and re-copies the image from the original image and allows you to start over again.
Constant: 'ThumbnailSize', this changes the size of the thumbnail that will be created after altering an image. Any of the buttons will force the thumbnail to be re-created in this size.
Please Note: If you change this constant it is recommended to change the thumbnail size on the image upload widget as well with the same value. This keeps all thumbnails consistently in the same size. 

If you choose to use your own entity or if you want to alter the implementation you can choose to change the widget of the Java actions:

## Widget 

Max Width/Height : These properties set the maximum size of the image that is loaded. This will not affect the quality or size of the final cropped image. These are not required but it is best to set at least one of these, otherwise really big images will be hard to crop, won't fit in the screen and will break the layout of your form.


If you use 0 as the Max width/height, it is recommendable to apply the CSS class: max-width: 100%; this limits the maximum size of the widget to the screen width. You can choose not to do this, if a large image is uploaded it could potentially fall outside the visible screen area.
Start height/width : This is the size the crop selection will start with. You can leave these empty to not show a selection when first loaded. If you are enforcing a specific size, it is best to set the selection to the same size, so the user knows what size to expect.

Aspect Ratio : This is the aspect ratio uses for the crop selection. You can set the aspect ratio with an attribute. The aspect ratio should be a text with a semicolon. Common aspect ratios are: 4:3, 16:9, etc. You are free to use any ratio. When you leave the field blank or 0 the user is free to set the aspect ratio.

## Java actions

- `cropImgObj` :  the object (that has the neccessary attributes) to be resized.

- `new Width/Height` : Make sure your newWidth and newHeight match the aspect ratio used in the widget to make sure the image doesn't get transformed. 

If you leave either the newWidth or the newHeight on 0, it will scale the image based on the filled in value whilst keeping the aspect ratio. If you set both on 0 it will use the width and height set by the user with the widget. Make sure your newWidth and newHeight match the aspect ratio used in the widget to make sure the image doesn't get transformed. If you leave either the newWidth or the newHeight on 0, it will scale the image based on the filled in value whilst keeping the aspect ratio. If you set both on 0 it will use the width and height set by the user with the widget.

- thumbnail Width/Height : The size of the thumbnail, editable so you can keep this on or near the same aspect ratio as the new image. The default implementation will use the tumbnail size as configured in the constant: ThumbnailSize, unless the image is smaller than the thumbnail. 
