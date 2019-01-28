export const isMxImageObject = (mxObject) => {
    if (mxObject) {
        return (
            mxObject.hasSuperEntities() &&
            mxObject.getSuperEntities().indexOf('System.Image') !== -1 &&
            mxObject.getSuperEntities().indexOf('System.FileDocument') !== -1
        );
    }
    return false;
}