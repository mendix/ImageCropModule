// This file was generated by Mendix Studio Pro.
//
// WARNING: Only the following code will be retained when actions are regenerated:
// - the import list
// - the code between BEGIN USER CODE and END USER CODE
// - the code between BEGIN EXTRA CODE and END EXTRA CODE
// Other code you write will be lost the next time you deploy the project.
// Special characters, e.g., é, ö, à, etc. are supported in comments.

package imagecrop.actions;

import com.mendix.core.Core;
import com.mendix.systemwideinterfaces.core.IContext;
import com.mendix.systemwideinterfaces.core.IMendixObject;
import com.mendix.webui.CustomJavaAction;

public class CopyFileContent extends CustomJavaAction<java.lang.Boolean>
{
	private IMendixObject OriginalFile;
	private IMendixObject TargetFile;
	private java.lang.Long thumbWidth;
	private java.lang.Long thumbHeight;

	public CopyFileContent(IContext context, IMendixObject OriginalFile, IMendixObject TargetFile, java.lang.Long thumbWidth, java.lang.Long thumbHeight)
	{
		super(context);
		this.OriginalFile = OriginalFile;
		this.TargetFile = TargetFile;
		this.thumbWidth = thumbWidth;
		this.thumbHeight = thumbHeight;
	}

	@java.lang.Override
	public java.lang.Boolean executeAction() throws Exception
	{
		// BEGIN USER CODE
		Core.storeImageDocumentContent(getContext(), this.TargetFile, Core.getFileDocumentContent(getContext(), this.OriginalFile), this.thumbWidth.intValue(), this.thumbHeight.intValue());
		
		return true;
		// END USER CODE
	}

	/**
	 * Returns a string representation of this action
	 */
	@java.lang.Override
	public java.lang.String toString()
	{
		return "CopyFileContent";
	}

	// BEGIN EXTRA CODE
	// END EXTRA CODE
}
