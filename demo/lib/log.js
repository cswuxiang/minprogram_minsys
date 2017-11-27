 /**
  * 错误上报
  */
var $ = require("./util.js");
var _cgi_path = "https://www.xx.com/logger4js.cgi?";
var _cacheSent = {};  //上报过的错误
var _MaxCount = 5;    //如果同一个错误，上报超过5次，将不再上报

/**
 * 错误上报模块的构造器
 * @method Logger
 * @param {Object} action 错误上报配置的对象
*/
function Logger(action){
    this.attrs = {   
        "ua" : "",          // @@@   
        "action" : action,  //流程标识（唯一标识）@@
        "attach" : "",      //附加数据，格式：V1/V2/V3/.../Vn@@
        "retcode" : "-1",   //返回码
        "retmsg" : "",      //返回信息
        "line"   : "",      //错误所在的行号
        "errmsg" : "",      //错误描述
        "url"    : ""       //发生的错误的页面地址
    };
}

var pro = {
    attr:function(option){
        var data = this.formate(option);
        var attrs = this.attrs;

        for(var i in data){
            if(data.hasOwnProperty(i)){
                attrs[i] = data[i];
            }
        }
    },
    formate:function(option){
        var data = {
            "retcode":option.retcode,
            "retmsg":"",
            "errmsg":"",
            "line":"",
            "url":""
        };
        var stack = option.msg;
        if(stack.length < 50){
            data.errmsg = stack.replace(/\n\t/gi," ");  
            return data;  
        }

        stack = stack.replace(/\n/gi,"@")
                .split(/\bat\b/)
                .join("@");
        
        //line & url
        var index = -1;
        var regLine = /\([^\)]*\)/;
        var lineMsg = stack.match(regLine);
        if(lineMsg && lineMsg[0]){
            index = lineMsg[0].lastIndexOf("\/");
            if(index!= -1){
                lineMsg = lineMsg[0].substring(index+1,lineMsg[0].length-1);
                lineMsg = lineMsg.split(":");
                data.url = lineMsg[0];
                data.line = lineMsg[1]+":"+lineMsg[2];                
            }
        }
        //retmsg
        var regRet = /TypeError\:([^\@]*)/;
        var retmsg = stack.match(regRet);
        if(retmsg && retmsg[1]){
            data.retmsg = retmsg[1];
        }

        //errmsg
        /*var regErr = /([^\@]*)(\@*)TypeError/;
        //var errmsg = stack.match(regErr);
        if(errmsg && errmsg[1]){
            data.errmsg = errmsg[1];
        }
        */
        data.errmsg  = data.retmsg || stack ;

        return data;
    },
    send:function(){
        var data = this.attrs;
        var key = data.url+"_"+data.retmsg;

        if( _cacheSent[key] && _cacheSent[key] >= _MaxCount){
           return ; 
        }

        this.addUserInfo();
        this.attrs.st = +new Date;
        var url =_cgi_path + $.stringify(this.attrs,{encode:false});

        try{
            var pagelist = getCurrentPages();
            pagelist[pagelist.length -1] && pagelist[pagelist.length -1].setData({"__log_url":url});
            $.request({url:url});
        }catch(e){}

        _cacheSent[key] = (_cacheSent[key] || 0)+1;
    },
    addUserInfo:function(){
         try {
          var res = wx.getSystemInfoSync();
          var ua = ";model-"+res.model
                    + ";pixelRatio-"+res.pixelRatio
                    + ";windowWidth-"+res.windowWidth
                    + ";windowHeight-"+res.windowHeight
                    + ";language-"+res.language
                    + ";version-"+res.version
                    + ";platform-"+res.platform;
            this.attrs.ua = encodeURIComponent(ua);
        } catch (e) {
          // Do something when catch error
        }
    }
};

Logger.prototype = pro;

module.exports = Logger;