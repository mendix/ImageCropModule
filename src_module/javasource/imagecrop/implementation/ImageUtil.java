package imagecrop.implementation;

import java.awt.color.ColorSpace;
import java.awt.image.BufferedImage;
import java.awt.image.ColorConvertOp;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.MemoryCacheImageOutputStream;
import com.mendix.core.Core;
import com.mendix.systemwideinterfaces.core.IContext;
import com.mendix.systemwideinterfaces.core.IMendixObject;

public class ImageUtil {
	
	public ImageUtil() {
		super();
	}
	
	public static void processImageBW(	IContext context, IMendixObject bwImageObj, IMendixObject colorImageObj,
										int thumbnailWidth, int thumbnailHeight, float jpegCompressionQuality) throws IOException {
		
		try ( InputStream is = Core.getImage(context, colorImageObj, false) )
		{
			BufferedImage originalImage = ImageIO.read(is);
			Integer imageType = (originalImage.getColorModel().hasAlpha()) ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB;
			BufferedImage alteredImage = new BufferedImage(originalImage.getWidth(), originalImage.getHeight(), imageType);
			
	        ColorConvertOp op = new ColorConvertOp(ColorSpace.getInstance(ColorSpace.CS_GRAY), null);
	        op.filter(originalImage, alteredImage);
	        
	        String formatName = getFormatName(context, colorImageObj);
			
			write(context, bwImageObj, alteredImage, formatName, thumbnailWidth, thumbnailHeight, jpegCompressionQuality);
		}
	}
	
	
	public static void processImage(IContext context, IMendixObject imageObj, 
									int width, int height, int thumbnailWidth, int thumbnailHeight, 
									Boolean crop, int x1, int y1, int x2, int y2, float jpegCompressionQuality) {
		try ( InputStream is = Core.getImage(context, imageObj, false) ) 
		{
			BufferedImage originalImage = ImageIO.read(is);
			Integer imageType = (originalImage.getColorModel().hasAlpha()) ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB;
			BufferedImage alteredImage = new BufferedImage(width, height, imageType);
			
			if (crop) {
				alteredImage.getGraphics().drawImage(originalImage, 0, 0, width, height, x1, y1, x2, y2, null);
			} else 
			{
				alteredImage.getGraphics().drawImage(originalImage, 0, 0, width, height, null);
			}
			
			String formatName = getFormatName(context, imageObj);
			
			write(context, imageObj, alteredImage, formatName, thumbnailWidth, thumbnailHeight, jpegCompressionQuality);
		} catch (IOException e) {
			Core.getLogger("ImageCrop").error(e);
		} 
	}
	
	private static String getFormatName(IContext context, IMendixObject imageObj) throws IOException {
		
		try ( InputStream is = Core.getImage(context, imageObj, false) )
		{
			try (ImageInputStream iis = ImageIO.createImageInputStream(is))
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
			}
		}
	}
	
	private static void write(	IContext context, IMendixObject imageObj, BufferedImage alteredImage, String formatName, 
								int thumbnailWidth, int thumbnailHeight, float jpegCompressionQuality) throws IOException 
	{
		ByteArrayOutputStream os = new ByteArrayOutputStream();
		

		if (formatName.toLowerCase().equals("jpeg") || formatName.toLowerCase().equals("jpg") ) {
			float compQuality = jpegCompressionQuality;
			if (compQuality < 0f) {
				compQuality = 0f;
			} else if (compQuality > 1f) {
				compQuality = 1f;
			}
							
			ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
			ImageWriteParam param = writer.getDefaultWriteParam();
			param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT); // Needed see javadoc
			param.setCompressionQuality(compQuality); // Highest quality
			writer.setOutput(new MemoryCacheImageOutputStream(os));
			writer.write(null, new IIOImage(alteredImage, null, null), param);
		} else {
			ImageIO.write(alteredImage, formatName, os);
		}
		
		try ( InputStream stream = new ByteArrayInputStream(os.toByteArray()) )
		{
			Core.storeImageDocumentContent(context, imageObj, stream,
					thumbnailWidth, thumbnailHeight);
		}
	
	}


	
}
