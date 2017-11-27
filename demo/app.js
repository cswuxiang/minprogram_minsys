// app.js
// 1,错误上报。
// 2,cgi接请
// 3,用户信息
var AppCom = require("./component/lib/app/appCom.js");


var Env = require("config/env.js");

// 4,全局存储信息
var G = {
 
}


G.Env = Env;

new AppCom ({
    G: G,
	STAT : Env.STAT,
	get : function(type) {
		return G[type] || {};
	},
	onLaunch  : function(){
		
	}
	
})