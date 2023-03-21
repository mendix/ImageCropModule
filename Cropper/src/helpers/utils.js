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

export const getImageUrlFromObject = (mxObject) => {
    const guid = mxObject.getGuid();
    const changedDate = mxObject.get('changedDate');
    const name = mxObject.get('Name');

    return `/file?guid=${guid}&changedDate=${changedDate}&name=${name}`;
}