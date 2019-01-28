import _widgetBase from 'MxWidgetBase';
import declare from 'dojoBaseDeclare';
import * as widgetConf from '../conf/widget.config.json';

//import dependencies
import $ from "jquery";
import jqueryJcrop from "../node_modules/jquery-jcrop/js/jquery.Jcrop";
import jqueryJColor from "../node_modules/jquery-jcrop/js/jquery.color";

import './style/style.scss';
import "../node_modules/jquery-jcrop/css/Jcrop.gif";
import "../node_modules/jquery-jcrop/css/jquery.Jcrop.min.css";


export default declare(`${widgetConf.name}.widget.${widgetConf.name}`, [_widgetBase], {
    constructor() {},
    postCreate() {
        console.debug(`${this.id} >> postCreate`);
    },
    update(contextObject, callback) {
        console.debug(`${this.id} >> update`);

        callback();
    }
});