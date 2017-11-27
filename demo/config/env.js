/**
 * 基础配置信息
 */
var ENV = {
	STAT : {
       "appID":"500013092",
       "eventID":"500541205", // 高级功能-自定义事件统计ID，配置开通后在初始化处填写
       "statPullDownFresh":true, // 使用分析-下来刷新次数/人数，必须先开通自定义事件，并配置了合法的eventID
       "statShareApp":true, // 使用分析-分享次数/人数，必须先开通自定义事件，并配置了合法的eventID
       "statReachBottom":true // 使用分析-页面触底次数/人数，必须先开通自定义事件，并配置了合法的eventID
    },
    noWhiteUserCode :["84663031"]//非白名单用户
};

module.exports = ENV;