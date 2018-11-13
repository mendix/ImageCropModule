// This file was generated by Mendix Modeler.
//
// WARNING: Only the following code will be retained when actions are regenerated:
// - the import list
// - the code between BEGIN USER CODE and END USER CODE
// - the code between BEGIN EXTRA CODE and END EXTRA CODE
// Other code you write will be lost the next time you deploy the project.
// Special characters, e.g., é, ö, à, etc. are supported in comments.

package imagecrop.actions;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import com.mendix.core.Core;
import com.mendix.systemwideinterfaces.core.IContext;
import com.mendix.systemwideinterfaces.core.IMendixObject;
import com.mendix.webui.CustomJavaAction;

/**
 * 
 */
public class ScaleImage extends CustomJavaAction<Boolean> {
	private IMendixObject __cropImgObj;
	private imagecrop.proxies.CropImage cropImgObj;
	private Long thumbnailWidth;
	private Long thumbnailHeight;

	public ScaleImage(IContext context, IMendixObject cropImgObj, Long thumbnailWidth, Long thumbnailHeight) {
		super(context);
		this.__cropImgObj = cropImgObj;
		this.thumbnailWidth = thumbnailWidth;
		this.thumbnailHeight = thumbnailHeight;
	}

	@Override
	public Boolean executeAction() throws Exception {
		this.cropImgObj = __cropImgObj == null ? null
				: imagecrop.proxies.CropImage.initialize(getContext(), __cropImgObj);

		// BEGIN USER CODE
		int x1 = this.cropImgObj.getcrop_x1();
		int x2 = this.cropImgObj.getcrop_x2();
		int y1 = this.cropImgObj.getcrop_y1();
		int y2 = this.cropImgObj.getcrop_y2();

		if (x2 > 0 && y2 > 0) {
			int newWidth = x2 - x1, newHeight = y2 - y1;
			
			InputStream is = null;
			InputStream stream = null;
			
			try {
				is = Core.getImage(getContext(), this.cropImgObj.getMendixObject(), false);
				BufferedImage originalImage = ImageIO.read(is);

				BufferedImage alteredImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
				alteredImage.getGraphics().drawImage(originalImage, 0, 0, newWidth, newHeight, null);

				String formatName = getFormatName(
						Core.getImage(getContext(), this.cropImgObj.getMendixObject(), false));

				ByteArrayOutputStream os = new ByteArrayOutputStream();
				ImageIO.write(alteredImage, formatName, os);
				stream = new ByteArrayInputStream(os.toByteArray());
				Core.storeImageDocumentContent(getContext(), this.cropImgObj.getMendixObject(), stream,
						this.thumbnailWidth.intValue(), this.thumbnailHeight.intValue());
			} catch (IOException e) {
				Core.getLogger(this.toString()).error(e);
			} finally {
				if (is != null)
					is.close();
				if (stream != null)
					stream.close();
			}
			return true;
		} else
			return false;
		// END USER CODE
	}

	/**
	 * Returns a string representation of this action
	 */
	@Override
	public String toString() {
		return "ScaleImage";
	}

	// BEGIN EXTRA CODE
	public static String getFormatName(Object o) {
		try (ImageInputStream iis = ImageIO.createImageInputStream(o)) 
		{
			Iterator<ImageReader> iter = ImageIO.getImageReaders(iis);
			if (!iter.hasNext()) {
				return null;
			}
			ImageReader reader = (ImageReader) iter.next();
		
			String formatName = reader.getFormatName();
			if (formatName == null)
				formatName = "jpeg";

			return formatName;
		} catch (IOException e) {
		}

		return "jpeg";
	}
	// END EXTRA CODE
}
