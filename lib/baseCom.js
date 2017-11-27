/**
 * 获取随机 ID
 * @return {String} ID 字符串
 */
function getID() {
    return "" ;//||Math.random().toString(36).substring(2, 15);
}
/**
 * 模块化组件
 * @param {Object} options 配置项
 * @param {String} options.scope 组件的命名空间
 * @param {Object} options.data 组件的动态数据
 * @param {Object} options.methods 组件的事件函数
 */
class BaseCom {
    constructor(options = {}) {
        Object.assign(this, {
            options, 
        })
        this.__init()
    }

    /**
     * 初始化
     */
    __init() {
        this.page = getCurrentPages()[getCurrentPages().length - 1]
        this.setData = this.page.setData.bind(this.page)
        this.__initState()
    }

    /**
     * 初始化组件状态
     */
    __initState() {
    	this.options = this.options || {};
    	this.options.data = this.options.data || {}
        this.options.data && this.__initData()
        this.options.methods && this.__initMethods();
    }

    /**
     * 绑定组件动态数据
     */
    __initData() {
        const scope = this.options.scope
        const data = this.options.data

        this._data = {}

        // 筛选非函数类型，更改参数中函数的 this 指向
        if (!this.isEmptyObject(data)) {
            for(let key in data) {
                if (data.hasOwnProperty(key)) {
                    if (typeof data[key] === `function`) {
                        data[key] = data[key].bind(this)
                    } else {
                        this._data[key] = data[key]
                    }
                }
            }
        }

        // 将数据同步到 page.data 上面方便渲染组件
        this.page.setData({
            [`${scope}`]: this._data, 
        })
    }

    /**
     * 绑定组件事件函数
     */
    __initMethods() {
        const scope = this.options.scope
        const methods = this.options.methods

        // 筛选函数类型
        if (!this.isEmptyObject(methods)) {
            for(let key in methods) {
                if (methods.hasOwnProperty(key) && typeof methods[key] === `function`) {
                    this[key] = methods[key] = methods[key].bind(this)
                    // 将 methods 内的方法重命名并挂载到 page 上面，否则 template 内找不到事件
                    this.page[`${scope}.${key}`] = methods[key]
                    // 将方法名同步至 page.data 上面，方便在模板内使用 {{ method }} 方式绑定事件
                    this.setData({
                        [`${scope}.${key}`]: `${scope}.${key}`, 
                    })
                }
            }
        }
    }

    /**
     * 获取组件的 data 数据
     */
    getComponentData() {
        let data = this.page.data
        let name = this.options.scope && this.options.scope.split(`.`)
        
        name.forEach((n, i) => {
            data = data[n]
        })

        return data
    }

    /**
     * 判断 object 是否为空
     */
    isEmptyObject(e) {  
        for (let t in e)
            return !1
        return !0
    }
    /*
     重置页面
     */
    reset(opts = {}) {
        for(let key in opts) {
            this.setData({
                [`${this.options.scope}.${key}`]: opts[key]
            });
        }       
    }
    /**
     * 组件 ID
     */
    get cid() {
        if(!this._cid) this._cid = getID();

        return this._cid;
    }
     /**
     * 获取真正的函数名称
     * @param name {String}  组件内函数名称
     * @return {String} 挂载到页面的真正的函数名称
     */
    _getFuncName(name) {
        return `${name}`;
    }
     /**
     * 添加回调方法供模板调用
     * @param name {String} 对应模板中调用时的方法名
     * @param fn {Function} 执行的回调方法，this 指向当前组件
     */
    addFunc(name, fn) {
        if(this._data[name]) {
            throw new Error(`function name ${name} is already exists~   @HK`);
        }
        if(!fn){
        	throw new Error(`function fn  is not exists~   @HK`);
        }
        const fnName = this._getFuncName(name);
        const scope = this.options.scope;
        const key = name;
        const myFn = fn.bind(this);
        // notice to page if page object is already exists
       // 将 methods 内的方法重命名并挂载到 page 上面，否则 template 内找不到事件
        this.page[`${scope}.${key}`] = myFn
        // 将方法名同步至 page.data 上面，方便在模板内使用 {{ method }} 方式绑定事件
        this.setData({
            [`${scope}.${key}`]:`${scope}.${key}`
        })

    }
    //推荐用些方法,单个值
    setValue (key,val){
    	const scope = this.options.scope;
        this.page.setData({
            [`${scope}.${key}`]:val
        })
        this._data[key] = val;
    }
    setMyData (key,val){
    	if(typeof key == "object"){
            this.reset(key);
        }else{
        	this.setValue(key,val);
        }
    }
    
      /**
     * 设置元素显示
     */
    setVisible(className = ``) {
        this.setData({
            [`${this.options.scope}.visible`]: !0, 
        })
    }

    /**
     * 设置元素隐藏
     */
    setHidden() {
        this.setData({
            [`${this.options.scope}.visible`]: !1, 
        })
    }
    
     /*
     重置页面
     */
    reset(opts = {}) {
        for(let key in opts) {
        	this.setValue(key,opts[key]);
        }
    }
}

export default BaseCom