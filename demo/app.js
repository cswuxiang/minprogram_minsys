// app.js
// 1,错误上报。
// 2,cgi接请
// 3,用户信息
var AppCom = require("./lib/app/appCom.js");


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