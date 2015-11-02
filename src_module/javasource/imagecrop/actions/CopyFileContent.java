// This file was generated by Mendix Business Modeler.
//
// WARNING: Only the following code will be retained when actions are regenerated:
// - the import list
// - the code between BEGIN USER CODE and END USER CODE
// - the code between BEGIN EXTRA CODE and END EXTRA CODE
// Other code you write will be lost the next time you deploy the project.
// Special characters, e.g., é, ö, à, etc. are supported in comments.

package imagecrop.actions;

import system.proxies.FileDocument;
import com.mendix.core.Core;
import com.mendix.systemwideinterfaces.core.IContext;
import com.mendix.webui.CustomJavaAction;
import com.mendix.systemwideinterfaces.core.IMendixObject;

/**
 * 
 */
public class CopyFileContent extends CustomJavaAction<Boolean>
{
	private IMendixObject OriginalFile;
	private IMendixObject TargetFile;
	private Long thumbWidth;
	private Long thumbHeight;

	public CopyFileContent(IContext context, IMendixObject OriginalFile, IMendixObject TargetFile, Long thumbWidth, Long thumbHeight)
	{
		super(context);
		this.OriginalFile = OriginalFile;
		this.TargetFile = TargetFile;
		this.thumbWidth = thumbWidth;
		this.thumbHeight = thumbHeight;
	}

	@Override
	public Boolean executeAction() throws Exception
	{
		// BEGIN USER CODE
		Core.storeImageDocumentContent(getContext(), this.TargetFile, Core.getFileDocumentContent(getContext(), this.OriginalFile), this.thumbWidth.intValue(), this.thumbHeight.intValue());
		
		return true;
		// END USER CODE
	}

	/**
	 * Returns a string representation of this action
	 */
	@Override
	public String toString()
	{
		return "CopyFileContent";
	}

	// BEGIN EXTRA CODE
	// END EXTRA CODE
}