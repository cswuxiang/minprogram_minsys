/**
 * 基类
 * 用于提供一些公共方法
 * new AppCom({
 * 
 * })
 */
var Stat = require("../mta_analysis.js");
var Logger = require("../log.js");

class AppCom {
    constructor(obj) {
    	
    	this.obj = obj;
    	
    	this.initLifeCircle();
        App(obj);
    }
    initLifeCircle(){
    	const list = ['getStat','onLoad','onError', 'onReady', 'onShow', 'onHide', 'onLaunch', 'onError','get'];
        const _self = this;
        for(let fn of list) {
            //原始Page页面方法
            let tempFn = this.obj[fn];

            this.obj[fn] = function(...args) {
                //基类方法
                var ret = null;
                if(_self[fn]){
                    ret = args = _self[fn].apply(this, args) || args;
                }
                if(tempFn) {
                    ret = tempFn.apply(this, args);
                }
                return ret;
            }
        }
    }
    onLaunch() {
        //统计信息初始化
       Stat.App.init(this.STAT);
    }
    getStat(){
    	return Stat;
    }
    onError(msg) {
        msg = msg || "";
        if (/\:fail(\s)*cancel(\s)*$/.test(msg)) {
            return;
        }

        var ins = new Logger("aa/bb");
        var o = {
            "retcode" : '90050000',
            "msg" : msg
        };
        ins.attr(o);
        ins.send();

    }
}

module.exports = AppCom;