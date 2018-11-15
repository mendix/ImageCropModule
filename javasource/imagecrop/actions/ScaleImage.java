// This file was generated by Mendix Modeler.
//
// WARNING: Only the following code will be retained when actions are regenerated:
// - the import list
// - the code between BEGIN USER CODE and END USER CODE
// - the code between BEGIN EXTRA CODE and END EXTRA CODE
// Other code you write will be lost the next time you deploy the project.
// Special characters, e.g., é, ö, à, etc. are supported in comments.

package imagecrop.actions;

import com.mendix.systemwideinterfaces.core.IContext;
import com.mendix.systemwideinterfaces.core.IMendixObject;
import com.mendix.webui.CustomJavaAction;
import imagecrop.implementation.ImageUtil;

public class ScaleImage extends CustomJavaAction<java.lang.Boolean>
{
	private IMendixObject __cropImgObj;
	private imagecrop.proxies.CropImage cropImgObj;
	private java.lang.Long thumbnailWidth;
	private java.lang.Long thumbnailHeight;

	public ScaleImage(IContext context, IMendixObject cropImgObj, java.lang.Long thumbnailWidth, java.lang.Long thumbnailHeight)
	{
		super(context);
		this.__cropImgObj = cropImgObj;
		this.thumbnailWidth = thumbnailWidth;
		this.thumbnailHeight = thumbnailHeight;
	}

	@Override
	public java.lang.Boolean executeAction() throws Exception
	{
		this.cropImgObj = __cropImgObj == null ? null : imagecrop.proxies.CropImage.initialize(getContext(), __cropImgObj);

		// BEGIN USER CODE
		int x1 = this.cropImgObj.getcrop_x1();
		int x2 = this.cropImgObj.getcrop_x2();
		int y1 = this.cropImgObj.getcrop_y1();
		int y2 = this.cropImgObj.getcrop_y2();

		if (x2 > 0 && y2 > 0) {
			int newWidth = x2 - x1, newHeight = y2 - y1;
			
			ImageUtil.processImage(this.getContext(), cropImgObj.getMendixObject(), 
					newWidth, newHeight, thumbnailWidth.intValue(), thumbnailHeight.intValue(), 
					false, 0, 0, 0, 0);
		
			return true;
		} else {
			return false;
		}
		// END USER CODE
	}

	/**
	 * Returns a string representation of this action
	 */
	@Override
	public java.lang.String toString()
	{
		return "ScaleImage";
	}

	// BEGIN EXTRA CODE

	// END EXTRA CODE
}