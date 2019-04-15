"use strict"
var SettlementUI = UIBase.extend({
    ctor: function () {
        this._super();
        this.resourceFilename = "res/ui/SettlementUI.json";
        this.setLocalZOrder(const_val.SettlementZOrder)
    },
    initUI: function () {
        var self = this;
        var confirm_btn = this.rootUINode.getChildByName("confirm_btn");

        function confirm_btn_event(sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                // TEST:
                // self.hide();
                // h1global.curUIMgr.gameroomprepare_ui.show_prepare();
                // h1global.curUIMgr.notifyObserver("hide");
                // return;
                self.hide();

				//重新开局
                var player = h1global.player();
                if (player) {
                    player.curGameRoom.updatePlayerState(player.serverSitNum, 1);
                    h1global.curUIMgr.gameroomprepare_ui.show_prepare();
                    h1global.curUIMgr.roomLayoutMgr.notifyObserver("reset");
                    player.prepare();
                } else {
                    cc.warn('player undefined');
                }
            }
        }

        confirm_btn.addTouchEventListener(confirm_btn_event);

        //单局结算分享
        this.rootUINode.getChildByName("share_btn").addTouchEventListener(function (sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                if ((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) {
                    jsb.fileUtils.captureScreen("", "screenShot.png");
                } else if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
                    jsb.reflection.callStaticMethod("WechatOcBridge", "takeScreenShot");
                } else {
                    h1global.curUIMgr.share_ui.show();
                }
            }
        });

        if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) && switches.appstore_check == true) {
            this.rootUINode.getChildByName("share_btn").setVisible(false);
        }
    },

    setPlaybackLayout: function (replay_btn_func) {
        let replay_btn = ccui.helper.seekWidgetByName(this.rootUINode, "replay_btn");
        let self = this;
        replay_btn.addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                if (replay_btn_func) replay_btn_func();
                if (self.is_show) {
                    self.hide();
                }
            }
        });
        replay_btn.setVisible(true);
        let back_hall_btn = ccui.helper.seekWidgetByName(this.rootUINode, "back_hall_btn");
        back_hall_btn.addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                h1global.runScene(new GameHallScene());
            }
        });
        back_hall_btn.setVisible(true);

        ccui.helper.seekWidgetByName(this.rootUINode, "share_btn").setVisible(false);
        ccui.helper.seekWidgetByName(this.rootUINode, "confirm_btn").setVisible(false);
    },

    show_by_info: function (roundRoomInfo, serverSitNum, curGameRoom, confirm_btn_func, replay_btn_func) {
        cc.log("结算==========>:");
        cc.log("roundRoomInfo :  ", roundRoomInfo);
        var self = this;
        this.show(function () {
            var confirm_btn = self.rootUINode.getChildByName("confirm_btn");
            var result_btn = self.rootUINode.getChildByName("result_btn");
            if (confirm_btn_func) {
                self.rootUINode.getChildByName("result_btn").addTouchEventListener(function (sender, eventType) {
                    if (eventType == ccui.Widget.TOUCH_ENDED) {
                        self.hide();
                        confirm_btn_func();
                    }
                });
                confirm_btn.setVisible(false);
                result_btn.setVisible(true);
            } else if (replay_btn_func) {
                self.setPlaybackLayout(replay_btn_func)
            } else {
                confirm_btn.setVisible(true);
                result_btn.setVisible(false);
            }
        });
    },

    show_title: function (dealer_idx, serverSitNum) {
        var bg_img = this.rootUINode.getChildByName("settlement_panel").getChildByName("bg_img");
        var title_img = this.rootUINode.getChildByName("settlement_panel").getChildByName("title_img");
        title_img.ignoreContentAdaptWithSize(true);
    },

    update_player_hand_tiles: function (panel_idx, serverSitNum, curGameRoom, tileList) {
        if (!this.is_show) {
            return;
        }
        var cur_player_tile_panel = this.player_tiles_panels[panel_idx].getChildByName("item_hand_panel");
        if (!cur_player_tile_panel) {
            return;
        }
    },

});