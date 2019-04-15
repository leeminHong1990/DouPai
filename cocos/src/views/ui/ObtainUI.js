"use strict";
var ObtainUI = BasicDialogUI.extend({
    ctor:function() {
        this._super();
        this.resourceFilename = "res/ui/ObtainUI.json";
    },

    initUI:function(){
        var self = this;
        var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
        this.obtain_panel = this.rootUINode.getChildByName("obtain_panel");
        this.obtain_panel.getChildByName("return_btn").addTouchEventListener(function(sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                self.hide();
            }
        });



        //领取
        this.receive_panel = this.obtain_panel.getChildByName("receive_panel");
        this.num_tf = this.receive_panel.getChildByName("num_tf");
        this.receive_panel.getChildByName("explain_label_1").setString("2.无邀请码可关注微信公众号：" + switchesnin1.gzh_name);

        this.obtain_panel.getChildByName("receive_btn").addTouchEventListener(function(sender, eventType) {
            //领取面板显示
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
                if (h1global.player().isAgent == 1) {
                    h1global.globalUIMgr.info_ui.show_by_info("您已是代理，不可以领取房卡！");
                    return;
                }
                if (info_dict["bind"] == true) {
                    h1global.globalUIMgr.info_ui.show_by_info("您已领取过新手房卡！");
                } else {
                    self.receive_panel.setVisible(true);
                    BasicDialogUI.addColorMask(self.receive_panel, undefined, function () {
                        self.receive_panel.setVisible(false);
                    });
                    BasicDialogUI.applyShowEffect(self.receive_panel);
                }
            }
        });

        this.receive_panel.getChildByName("return_btn").addTouchEventListener(function(sender, eventType) {
            //return_btn事件
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                self.receive_panel.setVisible(false);
            }
        });

        this.receive_panel.getChildByName("ok_btn").addTouchEventListener(function(sender, eventType) {
            //ok_btn事件,填写邀请码验证
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                cutil.lock_ui();
                var num = self.num_tf.getString();
                if((/^\d{7}$/).test(num)) {
                	if(num == info_dict["user_id"]) {
                		h1global.globalUIMgr.info_ui.show_by_info("邀请者ID不可以是自己！");
                		return;
                	}
                    cutil.spread_bind(num, function(content){
                        cutil.unlock_ui();
                        if(content[0] == '{'){
                            var data = eval('(' + content + ')');
                            if (data["errcode"] == 0) {
                                h1global.globalUIMgr.info_ui.show_by_info("绑定成功！获得" + data["card_quantity"] + "张房卡！");
                                var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
                                info_dict["bind"] = true;
                                cc.sys.localStorage.setItem("INFO_JSON", JSON.stringify(info_dict));
                                cutil.get_user_info("wx_" + info_dict["unionid"], function(user_info_content){
                                    if(user_info_content[0] != '{'){
                                        return;
                                    }
                                    var info = eval('(' + user_info_content + ')');
                                    h1global.curUIMgr.gamehall_ui.update_roomcard(info["card"].toString());
                                });
                            } else {
                                h1global.globalUIMgr.info_ui.show_by_info(data["errmsg"]);
                            }
                        } else {
                            h1global.globalUIMgr.info_ui.show_by_info("绑定失败！");
                        }
                    });
                    self.receive_panel.setVisible(false);
                } else {
                    self.num_tf.setString("");
                    if(num) {
                        h1global.globalUIMgr.info_ui.show_by_info("邀请码错误！");
                    } else {
                        h1global.globalUIMgr.info_ui.show_by_info("邀请码不能为空！");
                    }
                }
            }
        });




        //免费发卡
        this.freecard_panel = this.obtain_panel.getChildByName("freecard_panel");
        this.freecard_panel.getChildByName("title_label").setString("您的邀请码" + info_dict["user_id"]);

        this.obtain_panel.getChildByName("free_card_btn").addTouchEventListener(function(sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                var share_url = switches.PHP_SERVER_URL + '/p/' + info_dict["user_id"];
                var share_title = switches.gameName;
                var share_desc = '[' + info_dict["nickname"] + ']邀请你来玩' + switches.gameName + '，最正宗的' + switches.gameName + '，赶紧来玩吧！';
                if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) {
                    jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity","callWechatShareUrl", "(ZLjava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", true, share_url, share_title, share_desc);
                } else if((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
                    jsb.reflection.callStaticMethod("WechatOcBridge","callWechatShareUrlToSession:fromUrl:withTitle:andDescription:", true, share_url, share_title, share_desc);
                } else {
                    cutil.share_func(share_title, share_desc);
                    h1global.curUIMgr.share_ui.show();
                }
            }
        });

        this.freecard_panel.getChildByName("friend_btn").addTouchEventListener(function(sender, eventType) {
            //发送给好友/群
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                var share_title = switches.gameName;
                var share_desc = '[' + info_dict["nickname"] + ']邀请你来玩' + switches.gameName + '，最正宗的' + switches.gameName + '，赶紧来玩吧！';
                if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) {
                    jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity","callWechatShareUrl", "(ZLjava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", true, switches.share_android_url, share_title, share_desc);
                } else if((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
                    jsb.reflection.callStaticMethod("WechatOcBridge","callWechatShareUrlToSession:fromUrl:withTitle:andDescription:", true, switches.share_ios_url, share_title, share_desc);
                } else {
                    cutil.share_func(share_title, share_desc);
                    h1global.curUIMgr.share_ui.show();
                }
            }
        });

        this.freecard_panel.getChildByName("friends_btn").addTouchEventListener(function(sender, eventType) {
            //发送给朋友圈
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                var share_title = switches.gameName ;
                var share_desc = switches.gameName;
                if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) {
                    jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity","callWechatShareUrl", "(ZLjava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", false, switches.share_android_url, share_title, share_desc);
                } else if((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
                    jsb.reflection.callStaticMethod("WechatOcBridge","callWechatShareUrlToSession:fromUrl:withTitle:andDescription:", false, switches.share_ios_url, share_title, share_desc);
                } else {
                    cutil.share_func(share_title, share_desc);
                    h1global.curUIMgr.share_ui.show();
                }
            }
        });

        //复制0
        this.copy_label0 = this.obtain_panel.getChildByName("copy_label0");
        this.copy_label0.setString(switches.PHP_SERVER_URL + "/p/" + info_dict["user_id"]);
        this.obtain_panel.getChildByName("copy_btn0").addTouchEventListener(function(sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                cc.log("copy_btn0");
                cutil.copyToClipBoard(self.copy_label0.getString());
            }
        });

        //复制1
        this.copy_label1 = this.obtain_panel.getChildByName("copy_label1");
        this.copy_label1.setString("邀请码:" + info_dict["user_id"]);
        this.obtain_panel.getChildByName("copy_btn1").addTouchEventListener(function(sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                cc.log("copy_btn1");
                cutil.copyToClipBoard(info_dict["user_id"].toString());
            }
        });




        //查看奖励
        this.obtain_panel.getChildByName("reward_btn").addTouchEventListener(function(sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                cc.log("reward_btn");
                // h1global.globalUIMgr.info_ui.show_by_info("暂未开放！");
                // h1global.curUIMgr.webview_ui.show_by_info("http://www.baidu.com/");
                var info_dict = eval('(' + cc.sys.localStorage.getItem('INFO_JSON') + ')')
                cutil.get_award("wx_" + info_dict["unionid"], function(content){
                    if(content[0] == '{'){
                        var data = eval('(' + content + ')');
                        h1global.globalUIMgr.info_ui.show_by_info(data["errmsg"]);
                        if (data["errcode"] == 0) {
                            cutil.get_user_info("wx_" + info_dict["unionid"], function(user_info_content){
                                if(user_info_content[0] != '{'){
                                    return;
                                }
                                var info = eval('(' + user_info_content + ')');
                                if(h1global.curUIMgr.gamehall_ui) {
                                    h1global.curUIMgr.gamehall_ui.update_roomcard(info["card"].toString());
                                }
                            });
                        }
                    } else {
                        h1global.globalUIMgr.info_ui.show_by_info("领取奖励失败！");
                    }
                });
            }
        });
    },
});