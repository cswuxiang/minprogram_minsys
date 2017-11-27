/**
 * 页面基类
 */

const Base = require('./base.js');
const Emitter = require('../emitter.js');

const event = new Emitter();

class BasePage extends Base {
    constructor(obj, ...args) {
        super(obj);

        this.obj = obj;

        this.initLifeCircle();
        this.initComponents();
        this.initPlugins();
        Page(obj, ...args);
    }

    /**
     * 注入页面的生命周期
     */
    initLifeCircle() {
        const list = ['changeTitle','report','onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onRouteEnd','onShareAppMessage'];
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

    /**
     * 初始化页面挂载的组件
     */
    initComponents() {
        const {components} = this.obj;

        if(!components) return;

        this.components = {};

        for(let component in components) {
            this.components[component] = new components[component](this.obj, component);
        }

        this.obj.components = this.components;
    }

    /**
     * 为页面添加一些常用方法
     */
    initPlugins() {
        this.obj._events = {};

        // 添加方法
        let funcList = ['on', 'emit', 'report'];
        for(let fn of funcList) {
            this.obj[fn] = this[fn];
        }
    }
    /**
     * 页面公共的 onLoad 方法，会在页面 onLoad 前执行
     * @param 传入 onLoad 的参数
     * @return {Any} 返回值会替换原来的参数成传给单个页面的 onLoad 方法
     */
    onLoad(options) {
        // bind events
        const {events} = this;
        if(events) {
            for(let key in events) {
                this.on(key, this[events[key]]);
            }
        }
        //页面统计初始化
        getApp().getStat && getApp().getStat().Page.init({});
    }

    /**
     * 页面公共的 onUnload 方法
     */
    onUnload() {
        // remove event listener
        for(let name in this._events) {
            for(let i in this._events[name]) {
                let fn = this._events[name][i]
                event.off(name, fn);
            }

            delete(this._events[name]);
        }
    }

    /**
     * 监听事件
     */
    on(name, fn) {
        if(!this._events[name]) this._events[name] = [];

        fn = fn.bind(this);
        this._events[name].push(fn);

        event.on(name, fn);
    }

    /**
     * 触发事件
     */
    emit() {
        event.emit(...arguments);
    }
    /**
     * 分享 在config中控制
     */
    onReady(){
    	
    	
    	var shareObj = this.config.shareObj;
    	if(shareObj && shareObj.hasShare){
    		wx.showShareMenu({withShareTicket: true})
    	}else{
    		wx.hideShareMenu()
    	}
    }
    	 /**
     * 分享 在config中控制
     */
    onShareAppMessage(){
    	var retObj = {}
        var shareObj = this.config.shareObj;
        Object.assign(retObj,shareObj.params);
        return retObj;
    }
     /**
     * 点击上报
     * @param {String} 需要上报的 Key
     */
    report(key,params) { // 数据上报代码
        getApp().getStat().Event.stat(key,params);
    }
    changeTitle(title){
    	title && wx.setNavigationBarTitle({title:title});
    }
   
}

module.exports = BasePage;