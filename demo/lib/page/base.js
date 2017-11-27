/**
 * 基类
 * 用于提供一些公共方法
 */
class Base {
    constructor(obj) {
    	obj.config = obj.config||{}
    }
    /**
     * 点击上报
     * @param {String} 需要上报的 Key
     */
    report(key,params) { // 数据上报代码
    }
}

module.exports = Base;