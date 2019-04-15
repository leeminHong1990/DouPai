// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
"use strict";
var ResultUI = UIBase.extend({
    ctor: function () {
        this._super();
        this.resourceFilename = "res/ui/ResultUI.json";
        this.setLocalZOrder(const_val.MAX_LAYER_NUM);
    },
    initUI: function () {
        this.result_panel = this.rootUINode.getChildByName("result_panel");

        var share_btn = this.rootUINode.getChildByName("result_panel").getChildByName("share_btn");
        if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) && switches.appstore_check == true) {
            share_btn.setVisible(false);
        }

        function share_btn_event(sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                if ((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) {
                    jsb.fileUtils.captureScreen("", "screenShot.png");
                } else if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
                    jsb.reflection.callStaticMethod("WechatOcBridge", "takeScreenShot");
                } else {
                    // share_btn.setVisible(false);
                    h1global.curUIMgr.share_ui.show();
                }
            }
        }

        function save_screen_btn_event(sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                if ((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) {
                    var currTimeStr = new Date().getTime().toString();
                    jsb.fileUtils.captureScreen("", "MJ_" + currTimeStr + "_MJ.png");
                } else if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
                    jsb.reflection.callStaticMethod("WechatOcBridge", "saveScreenShot");
                } else {
                    // share_btn.setVisible(false);
                }
            }
        }

        share_btn.addTouchEventListener(function (sender, eventType) {
            share_btn_event(sender, eventType);
            save_screen_btn_event(sender, eventType);
        });
        if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) && switches.appstore_check == true) {
            share_btn.setVisible(false);
        }
        // if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)){
        // 	share_btn.setVisible(true);
        // } else {
        // 	share_btn.setVisible(false);
        // }
        var self = this;
        var confirm_btn = this.rootUINode.getChildByName("result_panel").getChildByName("back_hall_btn");

        function confirm_btn_event(sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                let player = h1global.player();
                if (self.rootUINode.canContinue) {
                    if (player) {
						if (player.curGameRoom) {
							player.club_id = player.curGameRoom.club_id
						}
                        player.quitRoom();
						player.curGameRoom = null;
                        self.finalResultFlag = false;
                    }
                } else {
					self.finalResultFlag = false;
					let fromData = null;
					if (player && player.curGameRoom && player.curGameRoom.club_id) {
						fromData = {'from_scene': 'GameHallScene', 'club_id': player.curGameRoom.club_id};
					}
					player.curGameRoom = null;
					h1global.runScene(new GameHallScene(fromData));
                }
            }
        }

        confirm_btn.addTouchEventListener(confirm_btn_event);

        //保存截屏
        var save_screen_btn = this.rootUINode.getChildByName("result_panel").getChildByName("save_screen_btn");


        save_screen_btn.addTouchEventListener(save_screen_btn_event);

        this.rootUINode.getChildByName("result_panel").getChildByName("continue_btn").addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
                    h1global.curUIMgr.roomLayoutMgr.notifyObserver("reset");
                }
                let player = h1global.entityManager.player();
                if (player && player.curGameRoom) {
                    if (player.curGameRoom.hand_prepare === 1 && player.serverSitNum !== 0) {
                        player.prepare();
                    }
                    if (h1global.curUIMgr && h1global.curUIMgr.gameroomprepare_ui) {
                        h1global.curUIMgr.gameroomprepare_ui.show_prepare(0);
                        h1global.curUIMgr.result_ui.finalResultFlag = false;
                        self.hide();
                    }
                }
            }
        })

    },

    show_by_info: function (finalPlayerInfoList, curGameRoom, serverSitNum, canContinue) {
        cc.log("finalPlayerInfoList:", finalPlayerInfoList);
        var self = this;
        this.show(function () {
            self.rootUINode.canContinue = canContinue;
            var maxScore = 0;
            // 需求 将玩家自己放在第一位
            finalPlayerInfoList = cutil.deepCopy(finalPlayerInfoList);

            for (var i = 0; i < finalPlayerInfoList.length; i++) {
                if (finalPlayerInfoList[i]["idx"] === serverSitNum && i !== 0) {
                    let info = finalPlayerInfoList.splice(i, 1);
                    finalPlayerInfoList.splice(0, 0, info[0]);
                }
            }

            for (var i = 0; i < finalPlayerInfoList.length; i++) {
                let finalPlayerInfo = finalPlayerInfoList[i];
                if (finalPlayerInfo["score"] > maxScore) {
                    maxScore = finalPlayerInfo["score"];
                }
            }
            let panels = [];
            let parent = self.rootUINode.getChildByName("result_panel");
            let source_panel = parent.getChildByName("player_info_panel");
            source_panel.setVisible(true);
            // Note: source size (224, 402)
            panels.push(source_panel);
            for (var i = 0; i < finalPlayerInfoList.length - 1; i++) {
                let clone = source_panel.clone();
                clone.setName("player_info_panel" + i);
                panels.push(clone);
                parent.addChild(clone);
            }
            // layout
            let parentWidth = parent.getContentSize().width;
            let sourceWidth = 224;
            let start = (parentWidth - panels.length * 224) * 0.5 + sourceWidth * 0.5 + 40;
            let space = -15;
            for (var i = 0; i < panels.length; i++) {
                panels[i].setPositionX(start + sourceWidth * i + space * i);
            }
            //
            for (var i = 0; i < finalPlayerInfoList.length; i++) {
                let panel = panels[i];
                let finalPlayerInfo = finalPlayerInfoList[i];
                if (finalPlayerInfo["score"] === maxScore && maxScore !== 0) {
                    self.update_player_info(panel, finalPlayerInfo["idx"], finalPlayerInfo, i, curGameRoom);
                } else {
                    self.update_player_info(panel, finalPlayerInfo["idx"], finalPlayerInfo, -1, curGameRoom);
                }
            }

			let clubStr = "";
			if (curGameRoom.club_id > 0) {
				clubStr = "    茶楼号：" + curGameRoom.club_id;
			}
			let roomInfoLabel = self.result_panel.getChildByName("roominfo_label");
			roomInfoLabel.setString(cutil.convert_timestamp_to_datetime_exsec(new Date() / 1000) + "   房间号：" + curGameRoom.roomID.toString() + clubStr);

			self.updateBtns();
            cutil.unlock_ui();

            if (!((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) || switches.TEST_OPTION)) {
                var result_list = {};
                var result_str = '';
                for (var i = 0; i < finalPlayerInfoList.length; i++) {
                    var finalPlayerInfo = finalPlayerInfoList[i];
                    result_list[finalPlayerInfo["idx"]] = finalPlayerInfo;
                }
                for (var i = 0; i < finalPlayerInfoList.length; i++) {
                    if (result_list[i]) {
                        result_str = result_str + '[' + curGameRoom.playerInfoList[i]["nickname"] + ']:' + result_list[i]["score"];
                        if (i != finalPlayerInfoList.length - 1) {
                            result_str = result_str + ','
                        }
                    }
                }
                var title = '房间号【' + curGameRoom.roomID.toString() + '】,招募群主,1000红包奖励群主!';
                cutil.share_func(title, result_str);
            }
        });
    },

    update_player_info: function (player_info_panel, serverSitNum, finalPlayerInfo, win_idx, curGameRoom) {
        win_idx = win_idx >= 0 ? win_idx : -1;
        cc.log("finalPlayerInfo:", finalPlayerInfo);
        var playerInfo = curGameRoom.playerInfoList[serverSitNum];
        player_info_panel.getChildByName("name_label").setString(playerInfo["nickname"]);
        var owner_img = ccui.helper.seekWidgetByName(player_info_panel, "owner_img");
        var id_label = ccui.helper.seekWidgetByName(player_info_panel, "id_label");
        id_label.setString("ID:" + playerInfo["userId"].toString());
        var win_num = finalPlayerInfo["win_times"];
        var win_num_label = ccui.helper.seekWidgetByName(player_info_panel, "win_num_label");
        win_num_label.setString(win_num.toString());

        var lose_num = finalPlayerInfo["lose_times"];
        var lose_num_label = ccui.helper.seekWidgetByName(player_info_panel, "lose_num_label");
        lose_num_label.setString(lose_num.toString());

        var none_num = finalPlayerInfo["type_none_times"];
        var none_num_label = ccui.helper.seekWidgetByName(player_info_panel, "type_none_num_label");
        none_num_label.setString(none_num.toString());

        var ten_num = finalPlayerInfo["type_ten_times"];
        var ten_num_label = ccui.helper.seekWidgetByName(player_info_panel, "type_ten_num_label");
        ten_num_label.setString(ten_num.toString());

        owner_img.setVisible(playerInfo["is_creator"]);
        cutil.loadPortraitTexture(playerInfo["head_icon"], playerInfo["sex"], function (img) {
            if (!cc.sys.isObjectValid(player_info_panel)) {
                return;
            }
            let old = player_info_panel.getChildByName("portrait_sprite");
            let oldPosition = old.getPosition();
            old.removeFromParent();
            let portrait_sprite = new cc.Sprite(img);
            portrait_sprite.setName("portrait_sprite");
            portrait_sprite.setScale(68 / portrait_sprite.getContentSize().width);
            portrait_sprite.setPosition(oldPosition);
            player_info_panel.addChild(portrait_sprite);
            if (cc.sys.isObjectValid(owner_img)) {
                portrait_sprite.setLocalZOrder(owner_img.getLocalZOrder());
                owner_img.setLocalZOrder(owner_img.getLocalZOrder() + 1)
            }
        }, playerInfo["uuid"].toString() + ".png");
        var final_score = finalPlayerInfo["score"];
        player_info_panel.getChildByName("score_label").setString(final_score.toString());
        player_info_panel.getChildByName("score_label").color = (final_score >= 0 ? cc.color(62, 165, 2) : cc.color(236, 88, 60));
        var win_title_img = ccui.helper.seekWidgetByName(player_info_panel, "win_title_img");
        win_title_img.setVisible(win_idx >= 0);
    },

    onHide: function () {
        this.finalResultFlag = false;
    },

    updateBtns: function () {
        let rootPanel = this.rootUINode.getChildByName("result_panel");
        let canContinue = this.rootUINode.canContinue;
        rootPanel.getChildByName("continue_btn").setVisible(canContinue);

        let back = rootPanel.getChildByName("back_hall_btn");
        let share = rootPanel.getChildByName("share_btn");
        if (!canContinue) {
            back.loadTextureNormal("res/ui/Default/back_hall_btn_yellow.png");
            UICommonWidget.addOriginPosition(back, -cc.winSize.width * 0.15, 0);
            UICommonWidget.addOriginPosition(share, cc.winSize.width * 0.15, 0)
        } else {
            back.loadTextureNormal("res/ui/Default/back_hall_btn.png");
            UICommonWidget.resetToOriginPosition(back);
            UICommonWidget.resetToOriginPosition(share);
        }
    },

    update_when_creator_quit: function () {
        if (!this.is_show) {
            return;
        }
        this.rootUINode.canContinue = false;
        this.updateBtns();
        // UICommonWidget.showToast(this.rootUINode, "房间已解散", cc.p(cc.winSize.width / 2, cc.winSize.height * 0.4), 2, true);
    }

});
