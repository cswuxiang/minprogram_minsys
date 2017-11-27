/**
 * 基础函数
 */

var $ = {};
var trim = function (str) {
    if(str === null || str === undefined){
        str = "";
    }
   str = str+"" || "";
   return str.replace(/^\s+/,"").replace(/\s+$/,"");
};

//
var class2type = {

};
var toString = class2type.toString;
var emptyArr = [];
var slice = emptyArr.slice;

function type(obj){
  return obj === null ? String(obj) : class2type[toString.call(obj)] || "object";
}

function isType(type) {
    return function(obj) {
        return {}.toString.call(obj) == "[object " + type + "]"
    }
}

var isFunction = isType("Function");
var isString = isType("String");
var isUndefined = isType("Undefined");

function isObject(obj){ 
    return (typeof obj) !=="string" && (typeof obj) !=="number" && (typeof obj) !=="undefined" && (typeof obj) !=="boolean" && type(obj) == "object"; 
}
function isArray(value) { return value instanceof Array; }
function likeArray(obj) { return typeof obj.length == 'number'; }
function isPlainObject(obj) {
    return isObject(obj) && obj != null && Object.getPrototypeOf(obj) == Object.prototype;
}

function extend(target, source, deep) {
    for (var key in source){   
      if (deep  && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {};
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = [];
        extend(target[key], source[key], deep);
      }
      else if (source[key] !== undefined) target[key] = source[key];
    }
}

$.extend = function(target){
    var deep, args = slice.call(arguments, 1);
    if (typeof target == 'boolean') {
      deep = target;
      target = args.shift();
    }
    args.forEach(function(arg){ extend(target, arg, deep); });
    return target;
};
$.type = type;
$.isFunction = isFunction;
$.isArray = isArray;
$.isPlainObject = isPlainObject;
$.isUndefined = isUndefined;
$.trim = trim;

$.stringify = function (obj,option){
    var opt = {
        "sep":"&",
        "eq" :"=",
        "encode":true,
        "encodeURIComponent":encodeURIComponent
    };
    var encodeFn = function(str){return str;};

    //参数处理
    if(option){
        opt = $.extend(opt,option);
    }
    if(opt.encode){
        encodeFn = opt.encodeURIComponent || encodeURIComponent;
    }else{
        encodeFn = function(str){
            return str;
        }
    }

    //合成
    var result = [];
    var eq = opt.eq;
    for( var i in obj){
        if(obj.hasOwnProperty(i)){
          result.push(encodeFn(i) + eq + encodeFn(obj[i]));
        }
    } 

    return result.join(opt.sep);
};

$.getParameter = function(obj){
    obj = obj || {};
    var result = {};
    var value;

    for(var key in obj){
        if(obj.hasOwnProperty(key)){
            value = obj[key];
            if(value !== undefined){
                value = decodeURIComponent(value);
            }
            result[decodeURIComponent(key)] = value;
        }
    }

    return result;
};

/**
 * 将Json对象生成URL的Get参数字符串形式
 * @param {Object}  params //Json对象
 * @return {String} //返回URL Get参数字符串
 */
$.makeQueryString = function (params) {
    params = params || {};
    var items = [];
    for (var key in params) {
        if (!params.hasOwnProperty(key)) continue;
        items.push(key + "=" + encodeURIComponent(params[key]));      
    }
    return items.join("&");
};

$.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
}

$.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
}

/**
         * 对字符串模块进行格式化处理，如果模板字符串中包含“!”符号，在没有提供数据的情况下会被替换为空字符串
         *
         * @method $.format
         * @param {String} tlp 格式化的模板字符创
         * @param {Object} metaData 变量替换的元数据对象
         * @param {Function} [filter:null] 进行过滤的方法
         * @param {Object} [rules:null] 对属性进行自定义的操作
         * @example
           $.format("I'm a ${sex}",{sex: "boy"}) --> I'm a boy
           $.format("I'm a $!{lazy} ${sex}",{sex: "boy"}) --> I'm a boy
           $.format("the book'name is $!{name}",[{name: "javascript"},{name:"css"}],function(item){
                return item.name == "javascript";
           })
           复杂的调用情况
           var record = [{name:"chauvetxiao",mobile:"13424383573"},{name:"test",mobile:"15826173558"}];
           var tpl = "${name}'s mobile number is $!{mobile}";

           var str = $.format(tpl,record,function(item){  //过滤掉name不是chauvetxiao的记录
               return item.name == "chauvetxiao";
           },{
               "mobile": function(value,key,index,records){
                   //value:mobile字段的值 key:就是属性的键值 index:对象在数组的位置 records:所有记录 this:当前对象
                   return value.replace(/^(\d{3})(\d|\*)+(\d{2})$/g, "$1******$3");
               }
           });
           ==>output: chauvetxiao's mobile is 134******73
        */
        $.format = function(tpl, metaData,filter,rules){
            var data = [],
                reg  = null,
                rules = rules||{},
                tmp_str,
                tmp_tpl;

            if(tpl && metaData){
                if($.isPlainObject(metaData)){  //如果是纯对象则转换为数组
                    metaData = [metaData];
                }
                if($.isArray(metaData)){
                    $.each(metaData,function(k,v){
                        if(!filter || filter(v,k,metaData)){
                            tmp_str = tpl;
                            tmp_tpl = tpl;

                            $.each(v,function(m,n){
                                n = (rules[m] && $.isFunction(rules[m])) ? rules[m].call(v,n,m,k,metaData) : n;
                                reg = new RegExp("\\$\\!?\\{" + m +"\\}", "gm");
                                try{
                                    tmp_str = tmp_tpl = tmp_tpl.replace(reg,decodeURIComponent(n));
                                }catch(e){
                                    tmp_str = tmp_tpl = tmp_tpl.replace(reg,n);
                                }
                            })
                            data.push(tmp_str);
                        }
                    });
                    tmp_str = data.join("");
                    reg = new RegExp("\\$\\!\\{[^\\{\\}]+\\}", "gm");

                    return tmp_str.replace(reg,"");
                }else{
                    return "";
                }
            }else{
                return "";
            }
        };
/**
 * 将字符串转换为JSON格式，如果参数为对象则直接返回         
 * 
 * @method $.parseJSON         
 * @param {String|Object} data 需要进行格式转换的数据
 * @return {Object} 转换后的JSON数据
*/
$.parseJSON = function(data){ //对JSON原生的parse方法进行兼容
    if(!data || typeof(data) != "string" ){
        return data;
    }

    data = $.trim(data);
    try{
        data = JSON.parse(data);
    }catch(e){      
        data = parse2JsonObject(data);
    }

    return data;
};

function parse2JsonObject(str){
    var str;
    try{

        str = JSON.parse(str.replace(/\\x([0-9A-Fa-f]{2})/g, function() {
            return String.fromCharCode(parseInt(arguments[1], 16));
         }).replace('\n', ' '));

    }catch(e){}

  return str;
}


/**
 * 对微信api的扩展
 */

/**
 * [request-网络请求部分]
 * 兼容了超过5个并行请求的情况
 * 兼容了请求的编码问题
 * 兼容了微信将内容转json的失败情况
 * @param  {[string]} url             [请求path,必填]
 * @param  {[Object]} data            [数据]
 * @param  {[Object]} context         [上下文]
 * @param  {[string]} method:"GET"    [方法]
 * @param  {[string]} dataType:"JSON" [响应数据格式，支持json、文本]
 * @param  {[Object]} header:         [请求头]
 * @param  {[function]} success       [成功回调]
 * @param  {[function]} fail          [失败回调]
 * @param  {[function]} complete      [完成回调]
 */
var request = (function(util){
    var $ = util;
    var empty = function(){};
    var ajaxSettings = {
        url:"",                //cgi path
        data:{},               //参数
        context:null,          //上下文
        method:"GET",          //请求方式
        dataType:"JSON",       //响应格式
        header: {
          'content-type': 'application/json'
        },
       // beforeSend:empty,
        success:empty,        
        fail:empty,
        complete:empty
    };
    var waitQueue = [];   //等待发出的请求
    var conCount = 0;     //在并发连接中的请求数
    var MAX_COUNT = 5;    //最大的请求并发量

    //发送请求，options的参数与ajaxSettings一致
    var send = function(options){
        var setting = formatSetting(options);
        waitQueue.push(setting);
        queueChange();
    };

    //格式化请求参数
    function formatSetting(options){
        var settings = $.extend(true,{}, options || {}); 
        var url = "";
        var str = "";

        //将参数拷贝
        for (var key in ajaxSettings) {
            if(settings[key] === undefined){
                if(ajaxSettings[key] && $.isPlainObject(ajaxSettings[key])){
                    settings[key] = $.extend(true,{},ajaxSettings[key]);
                }else{
                    settings[key] = ajaxSettings[key];
                }
            }
        }

        //设置method值
        settings.method = $.trim(settings.method || "") || "";
        settings.method = settings.method.toUpperCase();
        if(!settings.method || settings.method !== "POST"){
            settings.method = "GET";
        }

        //设置header
        if(settings.method == "POST" && (!options.header || !options.header["content-type"])){
            settings.header = settings.header || {};
            settings.header["content-type"] = "application/x-www-form-urlencoded";
        }

        //对于GET请求，将参数直接拼接在url上
        if(settings.method == "GET" && $.isPlainObject(settings.data)){
           str = $.stringify(settings.data); 
           if(str){                
               url = settings.url;      
               settings.url = url+(/\?/.test(url)?"&":"?")+str;
           }
           delete settings.data;
        }
        
        //回调
        var succFn = settings.success;
        var failFn = settings.fail;
        var completeFn = settings.complete;
        var context = settings.context;
        settings.success = function(res){
            var statusCode = parseInt(res.statusCode || 0) || -1; 
            if(statusCode !=-1 && (statusCode <200 || (statusCode>=300 && statusCode!=304))){
                if(context){
                    failFn.call(context,res);
                }else{
                    failFn(res);
                }
                return;
            }

            if((settings.dataType == "JSON" || res.data) && !settings.noParse){
                res.data = $.parseJSON(res.data);  
            }

            if(context){
                succFn.call(context,res);
            }else{
                succFn(res);
            }
        };
        settings.fail = function(res){
            if(context){
                failFn.call(context,res);
            }else{
                failFn(res);
            }
        };        
        settings.complete = function(res){
            //通知加载完成
            requestComplete();
            if ((settings.dataType == "JSON" || res.data) && !settings.noParse ){
                res.data = $.parseJSON(res.data);  
            }
            if(context){
                completeFn.call(context,res);
            }else{
                completeFn(res);
            }
        };

        return settings;
    }

    //新的请求加入或者完成加载，校验是否发送请求
    function queueChange(){ 
        var req;  

        //在线并发请求是否满负载,是否还有等待的请求
        while(conCount < MAX_COUNT && waitQueue.length >0){
            req = waitQueue.shift();
            conCount++;
            wx.request(req);
        }
    }

    //请求加载完成
    function requestComplete(){
       conCount--; 
       queueChange();
    }  

    return send;
})($);

/**
 * 路径管理
 */
/*
 * desc: 
 *  1、如果目标页面已经在栈中，那么wx.navigateBack({delta: xx})到目标页面
 *  2、如果目标页面不在栈中，
 *    （1）如果栈大小<5，那么wx.navigateTo(目标页面)
 *    （2）否则，wx.redirectTo(目标页面)
 *  3、所有页面间的数据传输，通过缓存携带
 *  4、跳转目标页，用goPage()
 *  5、在目标页，通过inPage()接收数据。接收后，数据会被删除
 */
$.navigation = {
  MAX_VALUE: 5,  //页面栈最多5层
  NAVIGATION_KEY : '__navigation',

  /*
   * desc: 跳转页面
   * param:
   *  obj: {
   *    url: ''  //页面在app.json中的路径，路径前不要加'/'斜杠（加也可以，做了兼容）
   *    data: {}  //需要携带的参数，统一通过缓存携带
   *  }
   * tip：data中，至少包含参数referer(页面route值)
   */
  goPage: function (obj) {
    var pages = getCurrentPages(),
      len = pages.length,
      dlt = '';
      obj.url = obj.url.replace(/^\//, ''); //将第一个‘/’去掉，如果有

    for (var i = 0; i < len; i++) {
      if (pages[i].route == obj.url) {  //要求每个页面都要定义pid
        dlt = i + 1;  //目标页在栈中的位置
        break;
      }
    }

    //保存数据
    var nData = Object.assign({ referer: pages[len - 1].route }, obj.data || {});
    wx.setStorageSync(this.NAVIGATION_KEY, JSON.stringify(nData));

    if (!dlt) {  //页面不在栈中
      if (len < this.MAX_VALUE) {
        wx.navigateTo({
          url: '/' + obj.url
        });
      } else {
        wx.redirectTo({
          url: '/' + obj.url
        });
      }
    } else {
      wx.navigateBack({
        delta: len - dlt
      });
    }
  },

  /*
   * desc：在目标页接收数据
   */
  inPage: function () {
    //获取数据
    try {
      var raw = wx.getStorageSync(this.NAVIGATION_KEY);
      wx.setStorage({
        key: this.NAVIGATION_KEY,
        data: ''
      });

      return JSON.parse(raw);
    } catch (e) {
      return '';
    }
  }
};
/**
 * [navigateTo] 打开新的视图，当前打开的视图达到最大值，替换当前视图
 * 兼容处理小程序最多只能打开5层
 * @param  {[Object]} obj [url，success，fail，complete]
 * @return 无
 */
$.navigateTo = function(obj){
    var pagelist = getCurrentPages();
    var len = pagelist.length;
    var MAX_VALUE = 5;

    if(len >= MAX_VALUE){
        wx.redirectTo(obj);
    }else{
        wx.navigateTo(obj);
    }
};

/**
 * [redirectTo 替换当前视图]
 * @param  {[Object]} obj [url，success，fail，complete]
 * @return 无
 */
$.redirectTo = function(obj){
    wx.redirectTo(obj);
};

/**
 * [navigateBack 返回]
 * 扩展了{url:"page/index"}用法，指定返回某个视图
 * @param  {[Object]} obj [obj = {delta:1}] , obj = {url:"page/index"}
 * @return 无
 */
$.navigateBack = function(obj){

    //没有obj，或者存在delta
    if(!obj || ("delta" in obj)){
        wx.navigateBack(obj);
        return;
    }

    //没有url
    if(!obj.url){
        wx.navigateBack({delta:1});
        return;
    }
    
    //跳到具体页面
    var pagelist = getCurrentPages();
    var len = pagelist.length;
    var index = -1;
    var i=0;
    var url = obj.url;
    for(;i<len;i++){
        if(-1 != url.indexOf(pagelist[i].__route__)){
            index = i;
            break;
        }
    }

    if(index !== -1 ){  //有找到
        if(index == len-1){  //本页面
            return;
        }
        wx.navigateBack({delta:len-1-index});
        return;
    }

    wx.redirectTo(obj);
};

/**
 * storage缓存
 * 增加容量管理
 * @param {[type]} option [description]
 */
var storage = (function(){
    var CACHE_RECORD_KEY = "__CACHE_RECORD_KEY";
    var cache_s = {};   //缓存访问过的Storage
    var cache_r;        //缓存key记录
    var destoryLevel = 0;  //0-未清理；1-清理了3个月以内的；2-逐个清理

    //获取key记录表
    function getCacheRecord(){
        if(cache_r){
            return cache_r;
        }
        
        try{
            cache_r = wx.getStorageSync(CACHE_RECORD_KEY);
        }catch(e){
            cache_r = {};
        }       
        return cache_r;
    }

    //更新记录表
    function updateCacheRecord(){
        wx.getStorageInfo({
            success:function(res){
                cache_r = getCacheRecord();
                var keys = res.keys || [];
                var now = +(new Date());
                var cache_n = {};

                //从StorageInfo中更新key记录
                for(var i = 0,len = keys.length,item;i<len;i++){
                    item = keys[i];
                    if(item == CACHE_RECORD_KEY){
                        continue;
                    }

                    if(cache_r[item]){
                        cache_n[item] = cache_r[item];
                    }else{
                        cache_n[item] = {time:now};
                    }
                }
                cache_r = cache_n;

                wx.setStorage({key:CACHE_RECORD_KEY,data:cache_r});
            }
        });
    }
    
    getCacheRecord();
    updateCacheRecord();

    /**
     * [set 设置Storage]异步
     * @param {[Object]} option 
     * ----------------------------
     * option = {key:"",data:"",success,fail，complete}
     * ----------------------------
     */
    var set = function(option){
        cache_s[option.key] = option.data;
        cache_r[option.key] = {time:+(new Date())};
        _flush(option);
    };

    function _flush(option){
        wx.setStorage({
            key:option.key,
            data:option.data,
            success:function(res){
                option.success && option.success(res);
                option.complete && option.complete(res);
                wx.setStorage({key:CACHE_RECORD_KEY,data:cache_r});
            },
            fail:function(res){   
                if(destoryLevel <1){
                    removeLevel_0();
                    _flush(option);
                    return;
                }
                
                var total = sortByTime();
                var item = total[0];
                if(!item){  //清理了所有的
                    clearSync();
                    option.fail && option.fail();
                    option.complete && option.complete(res);
                    return;
                }

                //还有未清空的数据
                try {
                    wx.removeStorageSync(item.key);
                    cache_s.hasOwnProperty(item.key) && delete cache_s[item.key];
                    cache_r.hasOwnProperty(item.key) && delete cache_r[item.key];
                    _flush(option);
                } catch (e) {
                    option.fail && option.fail();
                    option.complete && option.complete(res);
                }                  
            }
        });
    }

    var setSync = function(key,data){
        cache_s[key] = data;
        cache_r[key] = {time:+(new Date())};
        _flushSync(key,data);
    };

    function _flushSync(key,data){

        try {
            wx.setStorageSync(key, data);
            wx.setStorage({key:CACHE_RECORD_KEY,data:cache_r});
        } catch (e) { 

            if(destoryLevel <1){
                removeLevel_0();
                _flushSync(key,data);
                return;
            }
            
            var total = sortByTime();
            var item = total[0];
            if(!item){  //清理了所有的
                clearSync();
                return;
            }

            //还有未清空的数据
            try {
                wx.removeStorageSync(item.key);
                cache_s.hasOwnProperty(item.key) && delete cache_s[item.key];
                cache_r.hasOwnProperty(item.key) && delete cache_r[item.key];
                _flushSync(key,data);
            } catch (e) {}  
        }
    }

    function removeLevel_0(){

        //清理超过6个月，未再次访问的
        var destory = [];
        var now = +(new Date());
        var vtime = 6*30*24*60*60*1000;
        var item;

        for(var i in cache_r){
            item = cache_r[i];
            if(item.time + vtime>now){  //可以清除
                try {
                    wx.removeStorageSync(i);
                    destory.push(i);
                } catch (e) {}
            }
        }

        for(var i = 0,len = destory.length,key;i<len;i++){
            key = destory[i];
            cache_s.hasOwnProperty(item.key) && delete cache_s[item.key];
            cache_r.hasOwnProperty(item.key) && delete cache_r[item.key];
        }
        return destory;
    }

    function sortByTime(){
        var arr = [];
        var item;

        for(var i in cache_r){
            arr.push({key:i,time:cache_r[i].time});
        }

        for(var i=1,len = arr.length,t;i<len;i++){
            for(var j = 0;j<i;j++){
                if(arr[i].time < arr[j].time){
                    t = arr[i];
                    arr.splice(i,1);
                    arr.splice(j,0,t);
                }
            }
        }

        return arr;
    }

    /**
     * [get 异步获取]
     * @param  {[object]} option = {key:"",data:"",success,fail,complete}
     */
    var get = function(option){
        var key = option.key;
        var success = option.success;
        var complete = option.complete;
        var res = {};

        if(cache_s.hasOwnProperty(key)){
            res.data = cache_s[key];
            cache_r[key] = {time:+(new Date())};
            success && success(res);
            complete && complete(res);
            wx.setStorage({key:CACHE_RECORD_KEY,data:cache_r});
            return;
        }

        option.success = function(res){
            cache_s[key] = res.data;
            success && success(res);
        };
        option.complete = function(res){
            complete && complete(res);
            cache_r[key] = {time:+(new Date())};
            wx.setStorage({key:CACHE_RECORD_KEY,data:cache_r});
        };
        wx.getStorage(option); 
    };

    var getSync = function(key){        
        var value;

        if(cache_s.hasOwnProperty(key)){
            value = cache_s[key];
        }else{
            try{
               value = wx.getStorageSync(key); 
               cache_s[key] = value;
            }catch(e){}            
        }

        cache_r[key] = {time:+(new Date())};
        wx.setStorage({key:CACHE_RECORD_KEY,data:cache_r});

        return value;
    };

    var getInfo = function(option){
        wx.getStorageInfo(option);
    };
    var getInfoSync = function(){
        var res;
        try {
            res = wx.getStorageInfoSync();
        } catch (e) {}

        return res;
    };

    var remove = function(option){
        var key = option.key;
        wx.removeStorage(option);

        cache_s.hasOwnProperty(key) && delete cache_s[key];
        cache_r.hasOwnProperty(key) && delete cache_r[key];
        wx.setStorage({key:CACHE_RECORD_KEY,data:cache_r});
    };

    var removeSync = function(key){
        try {
            wx.removeStorageSync(key);
        } catch (e) {}

        cache_s.hasOwnProperty(key) && delete cache_s[key];
        cache_r.hasOwnProperty(key) && delete cache_r[key];
        wx.setStorage({key:CACHE_RECORD_KEY,data:cache_r});
    };

    var clear = function(option){
        wx.clearStorage(option); 
        cache_s = {};  
        cache_r = {};     
    };

    var clearSync = function(){
        try {
            wx.clearStorageSync();
        } catch(e) {}
        cache_s = {};  
        cache_r = {}; 
    };

    return {
        set:set,
        setSync:setSync,
        get:get,
        getSync:getSync,
        remove:remove,
        removeSync:removeSync,
        clear:clear,
        clearSync:clearSync,
        getInfo:getInfo,
        getInfoSync:getInfoSync
    };
})();

$.request = request;
$.storage = storage;

module.exports = $;