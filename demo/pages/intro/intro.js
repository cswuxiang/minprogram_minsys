// pages/intro/intro.js
var PageCom = require("../lib/page/pageCom.js");
var app = getApp();
new PageCom({
			config : {
				shareObj : {
					hasShare : true,
					params : {
						title : "xxx",
						imageUrl : "",
						complete : function() {
						}
					}
				}
			},
			/**
			 * 页面的初始数据
			 */
			data : {
				showLayer : false
			},
			onLoad : function(){
				wx.showLoading({title:"加載中"});
			},
			onShow : function(){
				wx.hideLoading();
			},
			showLayer : function() {
				this.setData({
							showLayer : true
						});
				this.report("clickshare");
			},
			hideLayer : function() {
				this.setData({
							showLayer : false
						});
			}
		})