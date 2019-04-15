"use strict";
var ApplyCloseUI = BasicDialogUI.extend({
    ctor: function () {
        this._super();
        this.resourceFilename = "res/ui/ApplyCloseUI.json";
        this.setLocalZOrder(const_val.MAX_LAYER_NUM);
    },

    initUI: function () {
        this.applyclose_panel = this.rootUINode.getChildByName("applyclose_panel");
        this.player_info_panels_list = [];
        var player = h1global.entityManager.player();
        var playingPlayerNum = 0;
        var playingPlayers = null;
        var playerInfoList = null;
        if (player && player.curGameRoom) {
            playingPlayers = player.curGameRoom.getPlayingPlayer();
            playingPlayerNum = playingPlayers.length;
            playerInfoList = playingPlayers;
        }
        for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
            var player_info_panel = this.applyclose_panel.getChildByName("player_info_panel" + i.toString());
            if (playingPlayerNum === 2) {
                if (i < 2) {
                    UICommonWidget.addOriginPosition(player_info_panel, 0, -100);
                }
            } else {
                if (i < 2) {
                    UICommonWidget.resetToOriginPosition(player_info_panel);
                }
            }
            var name_label = player_info_panel.getChildByName("name_label");
            if (playerInfoList && playerInfoList[i] && playerInfoList[i].role === const_val.GAME_ROLE_PLAYER) {
                name_label.setString(playerInfoList[i]["nickname"]);
            } else {
                player_info_panel.setVisible(false);
                // var unselect_img = player_info_panel.getChildByName("unselect_img");
                // var agree_img = player_info_panel.getChildByName("agree_img");
                // var refuse_img = player_info_panel.getChildByName("refuse_img");
                // name_label.setVisible(false);
                // unselect_img.setVisible(false);
                // agree_img.setVisible(false);
                // refuse_img.setVisible(false);
            }
            this.player_info_panels_list.push(player_info_panel);
        }

        this.from_label = this.applyclose_panel.getChildByName("from_label");
        this.content_label = this.applyclose_panel.getChildByName("content_label");
        this.lefttime_label = this.applyclose_panel.getChildByName("lefttime_label");
        var yes_btn = this.applyclose_panel.getChildByName("yes_btn");
        this.yes_btn = yes_btn;
        var no_btn = this.applyclose_panel.getChildByName("no_btn");
        this.no_btn = no_btn;
        var waiting_label = this.applyclose_panel.getChildByName("waiting_label");
        this.waiting_label = waiting_label;
        yes_btn.addTouchEventListener(function (sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                // 同意
                player.voteDismissRoom(1);
                yes_btn.setVisible(false);
                no_btn.setVisible(false);
                waiting_label.setVisible(true);
            }
        });
        no_btn.addTouchEventListener(function (sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                // 不同意
                player.voteDismissRoom(2);
                yes_btn.setVisible(false);
                no_btn.setVisible(false);
                waiting_label.setVisible(true);
            }
        });

        this.update_vote_state();
    },

    update_vote_state: function () {
        var player = h1global.entityManager.player();
        if (!player || !player.curGameRoom) {
            return;
        }

        var infoList = cutil.simpleIterWithoutNull(player.curGameRoom.playerInfoList);
        for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
            var info = infoList.next();
            if (info && info.role === const_val.GAME_ROLE_PLAYER) {
                var unselect_img = this.player_info_panels_list[i].getChildByName("unselect_img");
                var agree_img = this.player_info_panels_list[i].getChildByName("agree_img");
                var refuse_img = this.player_info_panels_list[i].getChildByName("refuse_img");
                var imgs_list = [unselect_img, agree_img, refuse_img];
                for (var j = 0; j < 3; j++) {
                    if (player.curGameRoom.applyCloseStateList[infoList.index -1] === j) {
                        imgs_list[j].setVisible(true);
                    } else {
                        imgs_list[j].setVisible(false);
                    }
                }
            }
        }        
    },

    update_left_time: function (leftTime) {
        if (!this.is_show) {
            return;
        }
        this.lefttime_label.setString("(" + (Math.max(Math.floor(leftTime), 0)).toString() + "秒后默认同意)");
    },

    show_by_sitnum: function (serverSitNum) {
        var self = this;
        var player = h1global.entityManager.player();
        var nickname = player.curGameRoom.playerInfoList[serverSitNum]["nickname"];
        var myServerSitNum = player.serverSitNum;
        var applyCloseState = player.curGameRoom.applyCloseStateList[player.serverSitNum];
        cc.log("nickname:", nickname);
        this.show(function () {
            self.from_label.setString("玩家 " + cutil.info_sub(nickname, 4, "") + " 申请解散房间，是否同意？");
            self.update_vote_state();
            if (serverSitNum == myServerSitNum || applyCloseState === 1) {
                self.yes_btn.setVisible(false);
                self.no_btn.setVisible(false);
                self.waiting_label.setVisible(true);
            }
        });
    },

    onShow: function () {
        BasicDialogUI.addColorMask(this.rootUINode, 0.5, function () {
        });
        BasicDialogUI.applyShowEffect(this);
    },
});