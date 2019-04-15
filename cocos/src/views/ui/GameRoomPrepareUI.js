// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
var GameRoomPrepareUI = UIBase.extend({
    ctor: function () {
        this._super();
        this.resourceFilename = "res/ui/GameRoomPrepareUI.json";
        this.talk_img_num = 0;
    },

    initUI: function () {
        var player = h1global.entityManager.player();
        this.gameprepare_panel = this.rootUINode.getChildByName("gameprepare_panel");
        if (this.curRound > 0) {
            this.gameprepare_panel.setVisible(false);
            return;
        }
		this.gameprepare_panel.setVisible(true);

        if (player && player.curGameRoom) {
            for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
                if (player.curGameRoom.playerInfoList[i]) {
                    this.update_player_info_panel(i, player.curGameRoom.playerInfoList[i]);
                }
                this.update_player_state(i, player.curGameRoom.playerStateList[i]);
                if (h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
                    h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_ready_state", i, player.curGameRoom.playerStateList[i]);
                    h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_player_desk_panel", player.server2CurSitNum(i));
                }
            }
        }
        this.update_location();
		var roomid_label = this.gameprepare_panel.getChildByName("roomid_label");
		roomid_label.setString(player.curGameRoom.roomID.toString());

        var wxinvite_btn = this.gameprepare_panel.getChildByName("wxinvite_btn");
		UICommonWidget.saveOriginPosition(wxinvite_btn);
		if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) && switches.appstore_check == true) {
            wxinvite_btn.setVisible(false);
        }
        wxinvite_btn.addTouchEventListener(function (sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
				let player = h1global.entityManager.player();
				if (!player || !player.curGameRoom) {
					return;
				}
				let share_title = ' 房间号【' + player.curGameRoom.roomID.toString() + '】,招募群主,1000红包奖励群主!';
				let share_desc = cutil.get_playing_room_detail(player.curGameRoom);
				let share_url = switches.PHP_SERVER_URL + '/' + switches.gameEngName + '_home?action=joinroom&roomId=' + player.curGameRoom.roomID.toString();
				if ((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) {
					jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "callWechatShareUrl", "(ZLjava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", true, share_url, share_title, share_desc);
				} else if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
					jsb.reflection.callStaticMethod("WechatOcBridge", "callWechatShareUrlToSession:fromUrl:withTitle:andDescription:", true, share_url, share_title, share_desc);
				} else {
					cutil.share_func(share_title, share_desc);
					h1global.curUIMgr.share_ui.show();
				}
			}
        });
        this.check_prepare();
        var prepare_btn = this.gameprepare_panel.getChildByName("prepare_btn");
        prepare_btn.addTouchEventListener(function (sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                let player = h1global.entityManager.player();
                if (player) {
                    player.curGameRoom.updatePlayerState(player.serverSitNum, 1);
                    player.prepare();
                    prepare_btn.setVisible(false);
                    if (h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
                        h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_ready_state", player.serverSitNum, 1);
                    }
                }
            }
        });

        let start_btn = this.gameprepare_panel.getChildByName("start_btn");
        if (player && player.curGameRoom) {
            if (player.curGameRoom.room_controller === player.serverSitNum) {
                start_btn.setVisible(true);
            }
        }
        start_btn.addClickEventListener(function (source) {
            let player = h1global.entityManager.player();
            if (player && player.curGameRoom) {
                let playerStateList = player.curGameRoom.playerStateList;
                let playerInfoList = player.curGameRoom.playerInfoList;
                // 必须所有在房间内的玩家准备后才能点开始
                let sum = 0;
                for (var i = 0; i < playerInfoList.length; i++) {
                    if (playerInfoList[i]) {
                        sum++;
                        if (playerStateList[i] !== 1 && i !== player.serverSitNum) {
                            return;
                        }
                    }
                }
                if (sum === 1) {
                    return;
                }
                player.curGameRoom.updatePlayerState(player.serverSitNum, 1);
                player.prepare();
                // start_btn.setVisible(false);
                if (h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
                    h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_ready_state", player.serverSitNum, 1);
                }
            }
        });

        if (this.curRound !== 0) {
            wxinvite_btn.setVisible(false);
        }

        h1global.curUIMgr.gameroominfo_ui.show();

        if (!cc.audioEngine.isMusicPlaying()) {
            cc.audioEngine.resumeMusic();
        }

        if (h1global.curUIMgr.gameplayerinfo_ui && h1global.curUIMgr.gameplayerinfo_ui.is_show) {
            h1global.curUIMgr.gameplayerinfo_ui.hide();
        }
    },

    show_prepare:function (curRound, playerInfoList, cbk_fuction) {
        var player = h1global.player();
        this.curRound = curRound !== undefined ? curRound : player.curGameRoom.curRound;
        this.playerInfoList = playerInfoList || player.curGameRoom.playerInfoList;
        this.is_swaping = false;
        this.show(cbk_fuction);
    },

    swap_seat:function (swap_list) {
	    this.is_swaping = true;
        var player = h1global.player();
        var self = this;
        var repeat_time = 30;
        // 位置交换
        var swap = [];
        var list_count = [[2, 3, 1, 0], [1, 2, 3, 0], [0, 1, 2, 3], [3, 0, 1, 2]];
        for (var i = 0; i < repeat_time - 1; i++) {
            var list = cutil.deepCopy(swap_list);
            // list.sort(function(){return 0.5 - Math.random()});
            list = list_count[i % 4];
            swap.push(list);
        }
        swap.push(cutil.deepCopy(swap_list));

        function fly() {
            self.gameprepare_panel.setVisible(false);
            var clone_list = [];
            for (var i = 0; i < swap_list.length; i++) {
                var player_info_panel = self.gameprepare_panel.getChildByName("player_info_panel" + i);
                player_info_panel.getChildByName("ready_img").setVisible(false);
                var clone_panel = player_info_panel.clone();
                var playerInfo = self.playerInfoList[swap_list[i]];
                cutil.loadPortraitTexture(playerInfo["head_icon"], playerInfo["sex"], function (img) {
                    if (h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show && clone_panel) {

                        if (clone_panel.getChildByName("portrait_sprite")) {
                            clone_panel.getChildByName("portrait_sprite").removeFromParent();
                        }

                        var portrait_sprite = new cc.Sprite(img);
                        portrait_sprite.setName("portrait_sprite");
                        if (self.curRound > 0) {
                            portrait_sprite.setScale(74 / portrait_sprite.getContentSize().width);
                        } else {
                            portrait_sprite.setScale(100 / portrait_sprite.getContentSize().width);
                        }
                        portrait_sprite.x = clone_panel.getContentSize().width * 0.5;
                        portrait_sprite.y = clone_panel.getContentSize().height * 0.5;
                        clone_panel.addChild(portrait_sprite);
                        clone_panel.reorderChild(portrait_sprite, -1);
                    }
                });

                clone_panel.setPosition(self.rootUINode.convertToNodeSpace(player_info_panel.getPosition()));
                self.rootUINode.addChild(clone_panel);
                clone_list.push(clone_panel);
            }
            var sum = 0;
            var game_next_panel = self.rootUINode.getChildByName("gameprepare" + (parseInt(cc.sys.localStorage.getItem(const_val.GAME_NAME+"GAME_ROOM_UI")) + 2).toString() + "d_panel");
            for (let i = 0; i < clone_list.length; i++) {
                var aim_panel = game_next_panel.getChildByName("player_info_panel" + player.server2CurSitNum(i));
                // var aim_pos = cc.p(aim_panel.getPositionX()+(0.5 - aim_panel.getAnchorPoint().x) *aim_panel.getContentSize().width , aim_panel.getPositionY() +(0.5 - aim_panel.getAnchorPoint().y) *aim_panel.getContentSize().height);
                // var space_pos = self.rootUINode.convertToNodeSpace(aim_pos)

                var space_pos = cc.p(aim_panel.getPositionPercent().x*cc.winSize.width, aim_panel.getPositionPercent().y*cc.winSize.height);
                clone_list[i].setScale(0.7);
                clone_list[i].setAnchorPoint(aim_panel.getAnchorPoint())
                clone_list[i].runAction(cc.Sequence.create(
                    cc.MoveTo.create(0.4, cc.p(space_pos.x, space_pos.y)),
                    cc.CallFunc.create(function () {
                        sum += 1;
                        if (sum === clone_list.length) {
                            self.hide();
                            if (h1global.curUIMgr.roomLayoutMgr) {
                                h1global.curUIMgr.roomLayoutMgr.startGame(function (complete) {
                                    if (complete) {
                                        let player2 = h1global.entityManager.player();
                                        if (player2 && player2.startActions["GameRoomUI"]) {
                                            player2.startActions["GameRoomUI"]();
                                            player2.startActions["GameRoomUI"] = undefined;
                                        }
                                    }
                                });
                            }
                        }
                    })
                ))
            }

        }

        let index = 0;

        function func() {
            if (repeat_time <= 0) {
                return;
            }
            self.gameprepare_panel.runAction(cc.sequence(cc.DelayTime.create(0.08),
                cc.CallFunc.create(function () {
                    var cur_swap = swap[index];
                    for (let j = 0; j < cur_swap.length; j++) {
                        self.update_player_info_panel(j, self.playerInfoList[cur_swap[j]])
                        var player_info_panel = self.gameprepare_panel.getChildByName("player_info_panel" + j);
                        player_info_panel.getChildByName("red_mark_img").setVisible(false)
                    }
                    if (index < repeat_time - 1) {
                        func()
                    } else if (index === repeat_time - 1) {
                        fly()
                    }
                    index++;
                })
            ))
        }

        func();
    },

    check_invition: function () {
        var player = h1global.entityManager.player();
        var playerNum = 0;
        for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
            if (player.curGameRoom.playerInfoList[i]) {
                playerNum = playerNum + 1;
            }
        }
        var wxinvite_btn = this.gameprepare_panel.getChildByName("wxinvite_btn");
        if (playerNum < player.curGameRoom.player_num) {
            wxinvite_btn.setVisible(true);
        } else {
            wxinvite_btn.setVisible(false);
        }
        if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) && switches.appstore_check == true) {
            wxinvite_btn.setVisible(false);
        }
    },

    check_prepare: function () {
        var player = h1global.entityManager.player();
        var prepare_btn = this.gameprepare_panel.getChildByName("prepare_btn");
        if (player && player.curGameRoom) {
            if (player.curGameRoom.hand_prepare === 1) {
                prepare_btn.setVisible(false);
				if (player.curGameRoom.room_controller === player.serverSitNum) {
                    //    pass
                } else {
                    var wxinvite_btn = this.gameprepare_panel.getChildByName("wxinvite_btn");
                    wxinvite_btn.setPositionX(this.gameprepare_panel.getContentSize().width * 0.5);
                }
            } else {
                if (player.curGameRoom.playerStateList[player.serverSitNum] !== 1) {
                    if (player.curGameRoom.room_controller === player.serverSitNum) {
                        prepare_btn.setVisible(false);
                    } else {
                        prepare_btn.setVisible(true);
                    }
                } else {
                    prepare_btn.setVisible(false);
                    var wxinvite_btn = this.gameprepare_panel.getChildByName("wxinvite_btn");
                    wxinvite_btn.setPositionX(this.gameprepare_panel.getContentSize().width * 0.5);
                }
            }
        }
    },

	updateRoomController: function () {
		if (!this.is_show) {
			return;
		}
		let start_btn = this.gameprepare_panel.getChildByName("start_btn");
		start_btn.setVisible(true);
		let prepare_btn = this.gameprepare_panel.getChildByName("prepare_btn");
		prepare_btn.setVisible(false);
		let wxinvite_btn = this.gameprepare_panel.getChildByName("wxinvite_btn");
		let player = h1global.player();
		if(player && player.curGameRoom && player.curGameRoom.hand_prepare === 1){
			UICommonWidget.resetToOriginPosition(wxinvite_btn)
		}
	},

    update_location: function () {
        if (true) {
            return;
        }
        var self = this;
        if (self.curRound > 0) {
            return;
        }
        var player = h1global.entityManager.player();
        var ip_panel = this.gameprepare_panel.getChildByName("ip_panel");
        var distance_panel = this.gameprepare_panel.getChildByName("distance_panel");

        //获得ip相同和距离相近玩家的list  ——start
        var playerInfoList = player.curGameRoom.playerInfoList;
        // cc.log("playerInfoList:",playerInfoList)
        var ip_list = [];
        var idx_ip_list = [];
        var distance_list = player.curGameRoom.playerDistanceList;
        var idx_distance_list = [];
        for (var i = 0; i < player.curGameRoom.playerInfoList.length && playerInfoList[i]; i++) {
            if (i == player.serverSitNum) {
                ip_list.push("0");
            } else {
                if (playerInfoList[i]) {
                    ip_list.push(playerInfoList[i]["ip"]);
                }
            }
        }

        collections.combinations([0, 1, 2, 3, 4, 5], 2, function (comb) {
            var a = comb[0];
            var b = comb[1];
            if (ip_list[a] == ip_list[b]) {
                if (idx_ip_list.indexOf(a) < 0) {
                    idx_ip_list.push(a);
                }
                if (idx_ip_list.indexOf(b) < 0) {
                    idx_ip_list.push(b);
                }
            }

            if (a == player.serverSitNum || b == player.serverSitNum) {
                return
            }
            if (distance_list[a][b] < 100 && distance_list[a][b] >= 0) {
                if (idx_distance_list.indexOf(a) < 0) {
                    idx_distance_list.push(a);
                }
                if (idx_distance_list.indexOf(b) < 0) {
                    idx_distance_list.push(b);
                }
            }
        });
        //获得ip相同和距离相近玩家的list  ——end

        var pos_list = [0.53, 0.36, 0.19];
        for (var i = 0; i < idx_ip_list.length; i++) {
            if (!playerInfoList[idx_ip_list[i]]) {
                continue;
            }
            var idx = i;
            cutil.loadPortraitTexture(playerInfoList[idx_ip_list[i]]["head_icon"], playerInfoList[idx_ip_list[i]]["sex"], function (img) {
                if (h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show && cc.sys.isObjectValid(ip_panel)) {
                    // location_panel.getChildByName("portrait_sprite" + curSitNum).removeFromParent();
                    var portrait_sprite = new cc.Sprite(img);
                    portrait_sprite.setName("portrait_sprite");
                    portrait_sprite.setScale(60 / portrait_sprite.getContentSize().width);
                    portrait_sprite.x = ip_panel.getContentSize().width * pos_list[idx];
                    portrait_sprite.y = ip_panel.getContentSize().height * 0.5;
                    ip_panel.addChild(portrait_sprite);
                    ip_panel.reorderChild(portrait_sprite, -1);
                }
            }, playerInfoList[idx_ip_list[i]]["uuid"].toString() + ".png");
        }

        for (var i = 0; i < idx_distance_list.length; i++) {
            let idx = i;
            cc.log("idx_distance_list:", idx_distance_list);
            cutil.loadPortraitTexture(playerInfoList[idx_distance_list[i]]["head_icon"], playerInfoList[idx_distance_list[i]]["sex"], function (img) {
                if (h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show && cc.sys.isObjectValid(distance_panel)) {
                    // location_panel.getChildByName("portrait_sprite" + curSitNum).removeFromParent();
                    var portrait_sprite = new cc.Sprite(img);
                    portrait_sprite.setName("portrait_sprite");
                    portrait_sprite.setScale(60 / portrait_sprite.getContentSize().width);
                    portrait_sprite.x = distance_panel.getContentSize().width * pos_list[idx];
                    portrait_sprite.y = distance_panel.getContentSize().height * 0.5;
                    distance_panel.addChild(portrait_sprite);
                    distance_panel.reorderChild(portrait_sprite, -1);
                }
            }, playerInfoList[idx_distance_list[i]]["uuid"].toString() + ".png");
        }

        if (idx_ip_list.length > 1) {
            ip_panel.setVisible(true);
            distance_panel.setVisible(false);
        } else if (idx_distance_list.length > 1 && idx_ip_list.length <= 1) {
            ip_panel.setVisible(false);
            distance_panel.setVisible(true);
        }
        this.gameprepare_panel.runAction(cc.repeatForever(cc.sequence(
            cc.delayTime(3.0),
            cc.callFunc(function () {
                if (idx_distance_list.length > 1 && idx_ip_list.length > 1) {
                    if (ip_panel.isVisible()) {
                        ip_panel.setVisible(false);
                        distance_panel.setVisible(true);
                    } else {
                        ip_panel.setVisible(true);
                        distance_panel.setVisible(false);
                    }
                }
            })
        )));
    },

    update_player_info_panel: function (serverSitNum, playerInfo) {
        if (true) {
            return;
        }
        if (serverSitNum < 0 || serverSitNum > 5) {
            return;
        }
        var self = this;
        var player = h1global.entityManager.player();
        var player_info_panel = this.gameprepare_panel.getChildByName("player_info_panel" + serverSitNum.toString());
        var frame_bg_img = this.gameprepare_panel.getChildByName("frame_img_" + serverSitNum.toString());
        if (this.curRound > 0) {
            player_info_panel = this.gameprepare_panel.getChildByName("player_info_panel" + player.server2CurSitNum(serverSitNum).toString());
        }
        if (playerInfo) {
            frame_bg_img.setVisible(false);
            var name_label = ccui.helper.seekWidgetByName(player_info_panel, "name_label");
            name_label.setString(playerInfo["nickname"]);
            var frame_img = ccui.helper.seekWidgetByName(player_info_panel, "frame_img");
            player_info_panel.reorderChild(frame_img, -2);
            frame_img.setTouchEnabled(true);
            frame_img.addTouchEventListener(function (sender, eventType) {
                if (eventType === ccui.Widget.TOUCH_ENDED) {
                    h1global.curUIMgr.gameplayerinfo_ui.show_by_info(playerInfo, serverSitNum + 10);
                }
            });
            cutil.loadPortraitTexture(playerInfo["head_icon"], playerInfo["sex"], function (img) {
                if (h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show && player_info_panel) {
                    player_info_panel.getChildByName("portrait_sprite").removeFromParent();
                    var portrait_sprite = new cc.Sprite(img);
                    portrait_sprite.setName("portrait_sprite");
                    if (self.curRound > 0) {
                        portrait_sprite.setScale(74 / portrait_sprite.getContentSize().width);
                    } else {
                        portrait_sprite.setScale(100 / portrait_sprite.getContentSize().width);
                    }
                    portrait_sprite.x = player_info_panel.getContentSize().width * 0.5;
                    portrait_sprite.y = player_info_panel.getContentSize().height * 0.5;
                    player_info_panel.addChild(portrait_sprite);
                    player_info_panel.reorderChild(portrait_sprite, -1);
                }
            }, playerInfo["uuid"].toString() + ".png");

            var owner_img = ccui.helper.seekWidgetByName(player_info_panel, "owner_img");
            player_info_panel.reorderChild(owner_img, 3);
            owner_img.setVisible(playerInfo["is_creator"]);

            var red_mark_img = player_info_panel.getChildByName("red_mark_img");
            player_info_panel.reorderChild(red_mark_img, 5);
            red_mark_img.setVisible(!playerInfo["location"] && this.curRound < 1);
            player_info_panel.setVisible(true);
        } else {
            frame_bg_img.setVisible(true);
            player_info_panel.setVisible(false);
        }
        if (player.curGameRoom.playerInfoList.length == 3) {
            this.gameprepare_panel.getChildByName("player_info_panel2").setVisible(false);
        }
        this.check_invition();
        this.check_prepare();
    },

    update_player_state: function (serverSitNum, state) {
        if (true) {
            return;
        }
        if (serverSitNum < 0 || serverSitNum > 5) {
            return;
        }
        var player_info_panel = this.gameprepare_panel.getChildByName("player_info_panel" + serverSitNum.toString());
        var ready_img = ccui.helper.seekWidgetByName(player_info_panel, "ready_img");
        if (state === 1) {
            // name_label.setString(playerInfo["name"]);
            ready_img.setVisible(true);
        } else {
            ready_img.setVisible(false);
        }
    }
});