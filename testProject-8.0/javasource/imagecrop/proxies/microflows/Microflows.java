// This file was generated by Mendix Studio Pro.
//
// WARNING: Code you write here will be lost the next time you deploy the project.

package imagecrop.proxies.microflows;

import java.util.HashMap;
import java.util.Map;
import com.mendix.core.Core;
import com.mendix.core.CoreException;
import com.mendix.systemwideinterfaces.MendixRuntimeException;
import com.mendix.systemwideinterfaces.core.IContext;
import com.mendix.systemwideinterfaces.core.IMendixObject;

public class Microflows
{
	// These are the microflows for the ImageCrop module
	public static imagecrop.proxies.Configuration dS_GetConfiguration(IContext context)
	{
		try
		{
			Map<java.lang.String, Object> params = new HashMap<java.lang.String, Object>();
			IMendixObject result = (IMendixObject)Core.execute(context, "ImageCrop.DS_GetConfiguration", params);
			return result == null ? null : imagecrop.proxies.Configuration.initialize(context, result);
		}
		catch (CoreException e)
		{
			throw new MendixRuntimeException(e);
		}
	}
	public static imagecrop.proxies.Configuration getConfiguration(IContext context)
	{
		try
		{
			Map<java.lang.String, Object> params = new HashMap<java.lang.String, Object>();
			IMendixObject result = (IMendixObject)Core.execute(context, "ImageCrop.GetConfiguration", params);
			return result == null ? null : imagecrop.proxies.Configuration.initialize(context, result);
		}
		catch (CoreException e)
		{
			throw new MendixRuntimeException(e);
		}
	}
	public static void mB_AlterAspectRatio(IContext context, imagecrop.proxies.CropImage _cropImage)
	{
		try
		{
			Map<java.lang.String, Object> params = new HashMap<java.lang.String, Object>();
			params.put("CropImage", _cropImage == null ? null : _cropImage.getMendixObject());
			Core.execute(context, "ImageCrop.MB_AlterAspectRatio", params);
		}
		catch (CoreException e)
		{
			throw new MendixRuntimeException(e);
		}
	}
	public static void mB_ApplyAspectRatio(IContext context, imagecrop.proxies.CropImage _cropImage)
	{
		try
		{
			Map<java.lang.String, Object> params = new HashMap<java.lang.String, Object>();
			params.put("CropImage", _cropImage == null ? null : _cropImage.getMendixObject());
			Core.execute(context, "ImageCrop.MB_ApplyAspectRatio", params);
		}
		catch (CoreException e)
		{
			throw new MendixRuntimeException(e);
		}
	}
	public static void mB_ApplyDraftChanges(IContext context, imagecrop.proxies.CropImage _draftCropImage)
	{
		try
		{
			Map<java.lang.String, Object> params = new HashMap<java.lang.String, Object>();
			params.put("DraftCropImage", _draftCropImage == null ? null : _draftCropImage.getMendixObject());
			Core.execute(context, "ImageCrop.MB_ApplyDraftChanges", params);
		}
		catch (CoreException e)
		{
			throw new MendixRuntimeException(e);
		}
	}
	public static void mB_ConvertToBW(IContext context, imagecrop.proxies.CropImage _cropImage)
	{
		try
		{
			Map<java.lang.String, Object> params = new HashMap<java.lang.String, Object>();
			params.put("CropImage", _cropImage == null ? null : _cropImage.getMendixObject());
			Core.execute(context, "ImageCrop.MB_ConvertToBW", params);
		}
		catch (CoreException e)
		{
			throw new MendixRuntimeException(e);
		}
	}
	public static void mB_CreateDraft(IContext context, imagecrop.proxies.CropImage _cropImage)
	{
		try
		{
			Map<java.lang.String, Object> params = new HashMap<java.lang.String, Object>();
			params.put("CropImage", _cropImage == null ? null : _cropImage.getMendixObject());
			Core.execute(context, "ImageCrop.MB_CreateDraft", params);
		}
		catch (CoreException e)
		{
			throw new MendixRuntimeException(e);
		}
	}
	public static void mB_CropImage(IContext context, imagecrop.proxies.CropImage _cropImage)
	{
		try
		{
			Map<java.lang.String, Object> params = new HashMap<java.lang.String, Object>();
			params.put("CropImage", _cropImage == null ? null : _cropImage.getMendixObject());
			Core.execute(context, "ImageCrop.MB_CropImage", params);
		}
		catch (CoreException e)
		{
			throw new MendixRuntimeException(e);
		}
	}
	public static void mB_RevertAndCloseDraft(IContext context, imagecrop.proxies.CropImage _draftCropImage)
	{
		try
		{
			Map<java.lang.String, Object> params = new HashMap<java.lang.String, Object>();
			params.put("DraftCropImage", _draftCropImage == null ? null : _draftCropImage.getMendixObject());
			Core.execute(context, "ImageCrop.MB_RevertAndCloseDraft", params);
		}
		catch (CoreException e)
		{
			throw new MendixRuntimeException(e);
		}
	}
	public static void mB_RevertDraftChanges(IContext context, imagecrop.proxies.CropImage _draftCropImage)
	{
		try
		{
			Map<java.lang.String, Object> params = new HashMap<java.lang.String, Object>();
			params.put("DraftCropImage", _draftCropImage == null ? null : _draftCropImage.getMendixObject());
			Core.execute(context, "ImageCrop.MB_RevertDraftChanges", params);
		}
		catch (CoreException e)
		{
			throw new MendixRuntimeException(e);
		}
	}
	public static void mB_SaveImage(IContext context, imagecrop.proxies.CropImage _mB_CropImage)
	{
		try
		{
			Map<java.lang.String, Object> params = new HashMap<java.lang.String, Object>();
			params.put("MB_CropImage", _mB_CropImage == null ? null : _mB_CropImage.getMendixObject());
			Core.execute(context, "ImageCrop.MB_SaveImage", params);
		}
		catch (CoreException e)
		{
			throw new MendixRuntimeException(e);
		}
	}
	public static void mB_ScaleImage(IContext context, imagecrop.proxies.CropImage _cropImage)
	{
		try
		{
			Map<java.lang.String, Object> params = new HashMap<java.lang.String, Object>();
			params.put("CropImage", _cropImage == null ? null : _cropImage.getMendixObject());
			Core.execute(context, "ImageCrop.MB_ScaleImage", params);
		}
		catch (CoreException e)
		{
			throw new MendixRuntimeException(e);
		}
	}
	public static void saveConfiguration(IContext context, imagecrop.proxies.Configuration _configuration)
	{
		try
		{
			Map<java.lang.String, Object> params = new HashMap<java.lang.String, Object>();
			params.put("Configuration", _configuration == null ? null : _configuration.getMendixObject());
			Core.execute(context, "ImageCrop.SaveConfiguration", params);
		}
		catch (CoreException e)
		{
			throw new MendixRuntimeException(e);
		}
	}
	public static void sF_CopyImageContents(IContext context, imagecrop.proxies.CropImage _sourceImage, imagecrop.proxies.CropImage _targetImage)
	{
		try
		{
			Map<java.lang.String, Object> params = new HashMap<java.lang.String, Object>();
			params.put("SourceImage", _sourceImage == null ? null : _sourceImage.getMendixObject());
			params.put("TargetImage", _targetImage == null ? null : _targetImage.getMendixObject());
			Core.execute(context, "ImageCrop.SF_CopyImageContents", params);
		}
		catch (CoreException e)
		{
			throw new MendixRuntimeException(e);
		}
	}
}