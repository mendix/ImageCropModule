const path = require('path');
let localConfFilePath = "../.mxlocal.config",
	localConf = false;
if (moduleExists(localConfFilePath)) {
	localConf = require(localConfFilePath);
}
// if there is a local conf then use it otherwise use the default/general
const mxProjectRootDir = localConf && localConf.mxProjectRootDir ? localConf.mxProjectRootDir : path.join(__dirname, "..", "test");

module.exports = {
	srcDir: path.join(__dirname, '..', 'src'),
	srcEntry: './src/index.js',
	confDir: __dirname,
	distDir: path.join(__dirname, '..', 'dist'),
	buildDir: path.join(__dirname, '..', 'build'),
	mxProjectRootDir,
	widgetPackageXML: path.join(__dirname, '..', 'src', 'package.ejs'),
	widgetConfigXML: path.join(__dirname, '..', 'src', 'widget.config.ejs')
};

function moduleExists(modulePath) {
	try {
		return require.resolve(modulePath);
	} catch (e) {
		return false;
	}
}