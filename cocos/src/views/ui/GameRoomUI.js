// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
"use strict"
var GameRoomUI = UIBase.extend({
    ctor: function () {
        this._super();
        this.talk_img_num = 0;

        this.containUISnippets = {};
        var self = this;
        // Note: PlayerInfoSnippet按照服务端座位号分布
        for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
            let idx = i;
            this.containUISnippets["PlayerInfoSnippet" + i] = new PlayerInfoSnippet(function () {
                let player = h1global.entityManager.player();
                let index = idx;
                if (player) {
                    index = player.server2CurSitNum(index);
                }
                return self.rootUINode.getChildByName("player_info_panel" + index);
            }, i);
        }
        this.selectedCards = [0, 0, 0];
    },
    initUI: function () {
        this.rootUINode.getChildByName("bg_panel").addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                if (h1global.curUIMgr.gameplayerinfo_ui && h1global.curUIMgr.gameplayerinfo_ui.is_show) {
                    h1global.curUIMgr.gameplayerinfo_ui.hide();
                }
            }
        });

        this.beginAnimPlaying = false;

        this.init_game_panel();
        this.init_extra_panel();
        this.init_curplayer_panel();
        this.init_player_info_panel();
        this.init_player_tile_panel();
        this.init_player_hand_panel();
        this.init_player_computer_panel();
        h1global.curUIMgr.gameroominfo_ui.show();

        this.update_roominfo_panel();

        if (!cc.audioEngine.isMusicPlaying()) {
            cc.audioEngine.resumeMusic();
        }

        if (h1global.curUIMgr.gameplayerinfo_ui && h1global.curUIMgr.gameplayerinfo_ui.is_show) {
            h1global.curUIMgr.gameplayerinfo_ui.hide();
        }
    },

    init_game_panel: function () {
        var operation_panel = this.rootUINode.getChildByName("operation_panel");
        operation_panel.setVisible(false);
    },

    init_extra_panel: function () {
        this.show_extra_panel(false);
    },

    show_extra_panel: function (is_show) {
        this.rootUINode.getChildByName("extra_operation_panel").setVisible(is_show)
    },

    init_curplayer_panel: function () {
        this.game_info_panel = this.rootUINode.getChildByName("game_info_panel");
        this.cur_player_panel = ccui.helper.seekWidgetByName(this.game_info_panel, "cur_player_panel");
        var lefttime_label = ccui.helper.seekWidgetByName(this.cur_player_panel, "lefttime_label");
        lefttime_label.setVisible(false);
    },

    update_wait_time_left: function (leftTime) {
        if (!this.is_show) {
            return;
        }
        leftTime = Math.floor(leftTime);
        this.cur_player_panel = ccui.helper.seekWidgetByName(this.game_info_panel, "cur_player_panel");
        var lefttime_label = ccui.helper.seekWidgetByName(this.cur_player_panel, "lefttime_label");
        lefttime_label.setString(leftTime);
        lefttime_label.ignoreContentAdaptWithSize(true);
        lefttime_label.setVisible(true);
    },

    init_player_info_panel: function () {
        var player = h1global.entityManager.player();
        if (!player || !player.curGameRoom) {
            return;
        }
        let playerInfoList = player.curGameRoom.playerInfoList;
        for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
            let snippet = this.containUISnippets["PlayerInfoSnippet" + i];
            if (playerInfoList[i]) {
                snippet.update_player_info_panel(playerInfoList[i]);
                snippet.update_player_online_state(playerInfoList[i]["online"]);
                if (player.curGameRoom.room_state === const_val.ROOM_WAITING) {
                    snippet.update_ready_state(player.curGameRoom.playerStateList[i]);
                }
                snippet.setVisible(true);
            } else {
                snippet.setVisible(false);
            }
        }
    },


    update_player_info_panel: function (serverSitNum, playerInfo) {
        if (this.is_show) {
            this.containUISnippets["PlayerInfoSnippet" + serverSitNum].update_player_info_panel(playerInfo);
        }
    },

    update_all_player_score: function (playerInfoList) {
        if (this.is_show) {
            for (var i = 0; i < playerInfoList.length; i++) {
                if (playerInfoList[i]) {
                    this.containUISnippets["PlayerInfoSnippet" + playerInfoList[i]['idx']].update_score(playerInfoList[i]['total_score']);
                }
            }
        }
    },

    /**
     *
     * @param state 1 = ready
     */
    update_player_ready_state: function (serverSitNum, state) {
        if (this.is_show) {
            this.containUISnippets["PlayerInfoSnippet" + serverSitNum].update_ready_state(state);
        }
    },

    update_player_online_state: function (serverSitNum, state) {
        if (this.is_show) {
            this.containUISnippets["PlayerInfoSnippet" + serverSitNum].update_player_online_state(state);
        }
    },

    init_player_tile_panel: function () {
        for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
            this.rootUINode.getChildByName("player_tile_panel" + i).setVisible(false);
        }
        this.rootUINode.getChildByName("player_hand_panel").setVisible(false);
    },

    init_player_hand_panel: function () {
        var self = this;

        function touchEventHandle(source) {
            let player = h1global.entityManager.player();
            if (player && player.curGameRoom) {
                if (player.curGameRoom.waitAidList.indexOf(const_val.OP_SHOW_CARD) < 0) {
                    return;
                }
            } else {
                return;
            }

            let card = source.card || 0;
            if (card <= 0) {
                return;
            }
            let emptyIndex = self.selectedCards.indexOf(0);

            if (source.selectedFlag) {
                source.selectedFlag = false;
                let index = self.selectedCards.indexOf(card);
                if (index >= 0) {
                    self.selectedCards.splice(index, 1, 0);
                    UICommonWidget.resetToOriginPosition(source);
                }
            } else {
                if (emptyIndex < 0) {
                    // show tip
                    return;
                }
                source.selectedFlag = true;
                UICommonWidget.addOriginPosition(source, 0, 20);
                self.selectedCards.splice(emptyIndex, 1, card);
            }
            self.update_player_computer_panel(self.selectedCards);
        }

        let handPanel = this.rootUINode.getChildByName("player_hand_panel").getChildByName("player_tile_panel").getChildByName("player_hand_panel");
        for (var i = 0; i < const_val.HAND_CARD_NUM; i++) {
            let tileImg = handPanel.getChildByName("tile_img_" + i);
            tileImg.addClickEventListener(touchEventHandle);
        }
    },
    init_dealer_mul_panel: function () {
        var player = h1global.entityManager.player();
        for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
            this.update_dealer_mul_panel(i, player && player.curGameRoom ? player.curGameRoom.fight_dealer_mul_list[i] : null)
        }
    },

    init_bet_score_panel: function () {
        var player = h1global.entityManager.player();
        for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
            this.update_bet_score_panel(i, player && player.curGameRoom ? player.curGameRoom.bet_score_list[i] : null)
        }
    },

    lock_player_hand_tiles: function () {
        if (!this.is_show) {
            return;
        }
        // this.rootUINode.getChildByName("player_computer_panel").setTouchEnabled(false);
        // this.rootUINode.getChildByName("player_hand_panel").setTouchEnabled(false);
    },

    unlock_player_hand_tiles: function () {
        if (!this.is_show) {
            return;
        }
        // this.rootUINode.getChildByName("player_computer_panel").setTouchEnabled(true);
        // this.rootUINode.getChildByName("player_hand_panel").setTouchEnabled(true);
    },

    _setBeginGameShow: function (is_show, myServerSitNum, curGameRoom) {
        let serverSitNum = myServerSitNum;
        for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
            let idx = this.server2CurSitNumOffline(i, myServerSitNum);
            if (is_show && curGameRoom.playerInfoList[i] && curGameRoom.playerInfoList[i].role === const_val.GAME_ROLE_PLAYER) {
                if (i !== myServerSitNum || (i === myServerSitNum && curGameRoom.show_state_list[i] === 1)) {
                    this.rootUINode.getChildByName("player_tile_panel" + idx).setVisible(is_show);
                } else {
                    this.rootUINode.getChildByName("player_tile_panel" + idx).setVisible(false);
                }
            } else {
                this.rootUINode.getChildByName("player_tile_panel" + idx).setVisible(false);
            }
        }
        if (!is_show) {
            this.hide_operation_panel();
            this.hide_player_computer_panel();
            this.hide_player_desk_panel();
            this.hide_player_hand_tiles(0)
        } else {
            let aid_list = curGameRoom.waitAidList;
            let data_list = curGameRoom.waitDataList;
            this.update_player_hand_tiles(serverSitNum, curGameRoom.handTilesList[serverSitNum], false, curGameRoom.game_mode, aid_list);
            this.update_operation_panel(impGameRules.waitOpDict(aid_list, data_list), const_val.SHOW_CONFIRM_OP);

            for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
                if (curGameRoom.playerInfoList[i] && curGameRoom.playerInfoList[i].role === const_val.GAME_ROLE_PLAYER) {
                    if (curGameRoom.show_state_list[i] === 1) {
                        this.update_player_desk_tiles(i, curGameRoom.handTilesList[i], false, curGameRoom.show_state_list[i] === 1, myServerSitNum, curGameRoom);
                    }
                }
            }
        }
    },

    _removeStartAnimExecutor: function (self) {
        if (self.startAnimExecutor) {
            self.startAnimExecutor.removeFromParent();
            self.startAnimExecutor = null;
        }
    },

    _removeAnimNode: function () {
        if (!this.is_show) {
            return;
        }
        var i = 100;
        while (i > 0) {
            let node = this.rootUINode.getChildByName("deal_anim_node");
            if (node == undefined || node == null) {
                return;
            }
            i--;
            if (cc.sys.isObjectValid(node)) {
                node.removeFromParent();
            }
        }
    },

    playDealAnim: function (toIdx, serverSitNum, handTileList, curGameRoom, myServerSitNum) {
        let dealAnimNode = cc.Node.create();
        dealAnimNode.setName("deal_anim_node");
        this.rootUINode.addChild(dealAnimNode);
        let endPos = this.rootUINode.getChildByName("player_tile_panel" + toIdx).getPosition();
        let offsetX = 0;
        let offsetY = 0;
        let spring = 0;
        let scale = 1;
        if (toIdx === 0) {
            scale = 1.4;
            offsetX = -319;
            offsetY = -37;
            spring = 120;
        } else {
            offsetX = -66;
            offsetY = 60;
            spring = 32;
        }
        var self = this;
        for (var i = 0; i < const_val.HAND_CARD_NUM; i++) {
            let sprite = new cc.Sprite("#Poker/pic_poker_backend.png");
            sprite.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
            sprite.setScale(scale);
            dealAnimNode.addChild(sprite);
			sprite.runAction(cc.sequence(cc.delayTime(0.07 * i), cc.callFunc(function () {
					cc.audioEngine.playEffect("res/sound/effect/deal_tile.mp3");
				}),
				cc.moveTo(0.2, endPos.x + offsetX, endPos.y + offsetY),
				cc.sequence(cc.moveBy(0.1, spring * i, 0)).easing(cc.easeIn(0.4))));
        }

        if (toIdx !== 0) {
            this.startAnimExecutor.runAction(cc.sequence(cc.delayTime(this.get_anim_config('dealTime')), cc.callFunc(function () {
                if (curGameRoom.show_state_list[serverSitNum] === 1) {
                    self.update_player_desk_tiles(serverSitNum, [0, 0, 0, 0, 0], false, false, myServerSitNum);
                }
            })))
        }
        if (toIdx === 0) {
            if (cc.sys.isObjectValid(this.startAnimExecutor)) {
                this.startAnimExecutor.runAction(cc.sequence(cc.delayTime(this.get_anim_config('dealTime') + this.get_anim_config("waitFlipTime")), cc.callFunc(function () {
                        if (cc.sys.isObjectValid(dealAnimNode)) {
                            dealAnimNode.removeFromParent();
                        }
                        if (curGameRoom.show_state_list[serverSitNum] === 0) {
							self.update_player_hand_tiles(serverSitNum, handTileList, curGameRoom.game_mode === const_val.GAME_MODE_SEEN_DEALER, curGameRoom.game_mode, curGameRoom.waitAidList);
						}
                    })
                ));
            } else {
                if (cc.sys.isObjectValid(dealAnimNode)) {
                    dealAnimNode.removeFromParent();
                }
                // this.update_player_hand_tiles(serverSitNum, handTileList, true);
            }
        }
    },

    startBeginAnim: function (startTilesList, serverSitNum, curGameRoom, dealerIdx) {
        if (this.startAnimExecutor) {
            cc.error("already Playing start anim");
            return;
        }
        this.beginAnimPlaying = true;
        this.lock_player_hand_tiles();
        this.startAnimExecutor = cc.Node.create();
        this.rootUINode.addChild(this.startAnimExecutor);
        var self = this;
        this._setBeginGameShow(false, serverSitNum, curGameRoom);
        let playingNum = curGameRoom.getPlayingPlayerNum();
        let playerInfoList = curGameRoom.playerInfoList;
        for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
            let idx = this.server2CurSitNumOffline(i, serverSitNum);
            let index = i;
            if (playerInfoList[i] && playerInfoList[i].role === const_val.GAME_ROLE_PLAYER) {
                this.startAnimExecutor.runAction(cc.sequence(cc.delayTime(0.1 * i), cc.callFunc(function () {
                    self.playDealAnim(idx, index, startTilesList, curGameRoom, serverSitNum)
                })))
            }
        }
        this.startAnimExecutor.runAction(cc.sequence(cc.delayTime(0.1 * playingNum + this.get_anim_config("dealTime") + this.get_anim_config("waitFlipTime") + 0.5 /* Note: 为了比发牌动画慢一点 */), cc.callFunc(function () {
            self.stopBeginAnim(serverSitNum, curGameRoom);
        })));
    },

    stopBeginAnim: function (myServerSitNum, curGameRoom) {
        this._removeStartAnimExecutor(this);
        this._removeAnimNode();
        this.beginAnimPlaying = false;
        this._setBeginGameShow(true, myServerSitNum, curGameRoom);
        this.unlock_player_hand_tiles();
    },

    update_dealer_mul_panel: function (serverSitNum, score) {
        if (!this.is_show) {
            return;
        }

        let rootUINode = this.containUISnippets["PlayerInfoSnippet" + serverSitNum].rootUINode;
        let img = rootUINode.getChildByName("score_img");
        if (score == null || score === -1) {
            img.setVisible(false);
            return;
        }
        rootUINode.getChildByName("score_num").setVisible(false);
        img.loadTexture("GameRoomUI/score_mul_" + score + '.png', ccui.Widget.PLIST_TEXTURE);
        img.ignoreContentAdaptWithSize(true);
        img.setVisible(true);
    },

    update_dealer_idx: function (dealerIdx) {
        if (!this.is_show) {
            return;
        }
        cc.log("dealer: ", dealerIdx);
        for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
            this.containUISnippets["PlayerInfoSnippet" + i].update_dealer_idx(i === dealerIdx, true);
        }
    },

    update_bet_score_panel: function (serverSitNum, score , runAnim) {
        if (!this.is_show) {
            return;
        }
		runAnim = runAnim || false;
        let rootUINode = this.containUISnippets["PlayerInfoSnippet" + serverSitNum].rootUINode;
        let img = rootUINode.getChildByName("score_img");
        let num = rootUINode.getChildByName("score_num");
        if (score > 0) {
            img.setVisible(false);
            num.setVisible(true);
            num.setString("X" + score);
        } else {
            num.setVisible(false);
        }
		if (runAnim) {
			num.stopAllActions();
			num.setScale(5);
			num.runAction(cc.sequence(cc.scaleTo(0.5, 1), cc.scaleTo(1, 1)));
		}
    },

    hide_player_desk_panel: function (index) {
        if (index >= 0) {
            this.rootUINode.getChildByName("player_tile_panel" + index).setVisible(false);
        } else {
            for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
                let rootPanel = this.rootUINode.getChildByName("player_tile_panel" + i);
                rootPanel.setVisible(false);
            }
        }
    },

    /**
     *
     * @param show_anim 是否显示牌翻转动画
     * @param show_state 是否已经亮牌
     */
    update_player_desk_tiles: function (serverSitNum, tileList, show_anim, show_state, myServerSitNum, curGameRoom) {
        if (!this.is_show) {
            return;
        }
        if (!curGameRoom) {
            return;
        }
        let idx = this.server2CurSitNumOffline(serverSitNum, myServerSitNum);
        let rootPanel = this.rootUINode.getChildByName("player_tile_panel" + idx);
        let cur_player_tile_panel = rootPanel.getChildByName("player_tile_panel").getChildByName("player_hand_panel");
        if (!cur_player_tile_panel) {
            return;
        }
        let playerInfoList = curGameRoom.playerInfoList[serverSitNum];
        show_anim = show_anim || false;
        show_state = show_state || false;
        let handTilesList = tileList ? tileList : curGameRoom.handTilesList[serverSitNum];
        if (playerInfoList == null || playerInfoList.role === const_val.GAME_ROLE_VIEWER) {
            rootPanel.setVisible(false);
        } else {
            rootPanel.setVisible(true);
            for (var i = 0; i < const_val.HAND_CARD_NUM; i++) {
                let tile_img = cur_player_tile_panel.getChildByName("tile_img_" + i);
                if (handTilesList[i] > 0 && show_state) {
                    let pokerNum = rules.get_poker_num(handTilesList[i]);
                    let pokerColor = rules.get_poker_color(handTilesList[i]);
                    tile_img.loadTexture("Poker/pic_poker_" + const_val.POKER_COLOR_DICT[pokerColor] + pokerNum + ".png", ccui.Widget.PLIST_TEXTURE);
                } else {
                    tile_img.loadTexture("Poker/pic_poker_backend.png", ccui.Widget.PLIST_TEXTURE);
                }
            }
            this.showPokerPoints(idx, handTilesList, show_state, curGameRoom.confirm_poker_state_list[serverSitNum]);
        }
        if (show_anim) {
            let poker_title_img = rootPanel.getChildByName("poker_title_img");
            if (show_state) {
                poker_title_img.stopAllActions();
                poker_title_img.setVisible(false);
                poker_title_img.runAction(cc.sequence(cc.delayTime(this.get_anim_config('flipTime')), cc.show()))
            }
            this.showPokerFlipAnim(cur_player_tile_panel, tileList, curGameRoom.game_mode, false, false);
        }
    },

    hide_player_hand_tiles: function (serverSitNum) {
        if (!this.is_show) {
            return;
        }
        // let player = h1global.entityManager.player();
        // if (!player || !player.curGameRoom) {
        //     return;
        // }
        // let idx = player.server2CurSitNum(serverSitNum);
        let rootPanel = this.rootUINode.getChildByName("player_hand_panel");
        rootPanel.setVisible(false);
    },

    /**
     *
     * @param serverSitNum
     * @param tileList
     * @param show_anim 是否显示牌翻转动画
     * @param gameMode 做庄模式 控制牌的显示
     * @param waitOpList 当前可以执行的操作 控制牌的显示
     * @param isLast 是否只显示最后一张牌的翻转动画
     */
    update_player_hand_tiles: function (serverSitNum, tileList, show_anim, gameMode, waitOpList, isLast) {
        if (!this.is_show) {
            return;
        }
        let rootPanel = this.rootUINode.getChildByName("player_hand_panel");
        let cur_player_tile_panel = rootPanel.getChildByName("player_tile_panel").getChildByName("player_hand_panel");
        if (!cur_player_tile_panel) {
            return;
        }
        let doFight = waitOpList && waitOpList.indexOf(const_val.OP_SHOW_CARD) < 0;
        rootPanel.setVisible(true);
        let handTilesList = tileList;
        for (var i = 0; i < const_val.HAND_CARD_NUM; i++) {
            let tile_img = cur_player_tile_panel.getChildByName("tile_img_" + i);
            tile_img.stopAllActions();
            tile_img.setVisible(true);
            tile_img.card = handTilesList[i];

            if (handTilesList[i] > 0) {
                let pokerNum = rules.get_poker_num(handTilesList[i]);
                let pokerColor = rules.get_poker_color(handTilesList[i]);
                // 不是明牌抢庄把所有牌都盖住
                if (gameMode !== const_val.GAME_MODE_SEEN_DEALER) {
                    if (doFight) {
                        tile_img.loadTexture("Poker/pic_poker_backend.png", ccui.Widget.PLIST_TEXTURE);
                    } else {
                        tile_img.loadTexture("Poker/pic_poker_" + const_val.POKER_COLOR_DICT[pokerColor] + pokerNum + ".png", ccui.Widget.PLIST_TEXTURE);
                    }
                } else if (gameMode === const_val.GAME_MODE_SEEN_DEALER) {
                    if (doFight && i === const_val.HAND_CARD_NUM - 1) {
                        tile_img.loadTexture("Poker/pic_poker_backend.png", ccui.Widget.PLIST_TEXTURE);
                    } else {
                        tile_img.loadTexture("Poker/pic_poker_" + const_val.POKER_COLOR_DICT[pokerColor] + pokerNum + ".png", ccui.Widget.PLIST_TEXTURE);
                    }
                } else {
                    tile_img.loadTexture("Poker/pic_poker_" + const_val.POKER_COLOR_DICT[pokerColor] + pokerNum + ".png", ccui.Widget.PLIST_TEXTURE);
                }
            } else {
                tile_img.loadTexture("Poker/pic_poker_backend.png", ccui.Widget.PLIST_TEXTURE);
            }
        }

        show_anim = show_anim || false;
        if (show_anim) {
            this.showPokerFlipAnim(cur_player_tile_panel, tileList, gameMode, doFight, isLast || false);
        }
    },

    get_anim_config: function (name) {
        if (!this.anim_config) {
            this.anim_config = {};
            this.anim_config['flipTime'] = 0.3;
            this.anim_config['dealTime'] = 0.65;
            this.anim_config['waitFlipTime'] = 0.15;
        }
        return this.anim_config [name];
    },

    showPokerFlipAnim: function (rootPanel, tileList, gameMode, doFight, onlyLast) {
        if (!this.is_show || !cc.sys.isObjectValid(rootPanel)) {
            return;
        }
        if (gameMode === const_val.GAME_MODE_DEALER && doFight) {
            return;
        }
        UICommonWidget.load_effect_plist('poker_flip');
        let flipAnimNode = cc.Node.create();
        flipAnimNode.setName("flip_anim_node");
        flipAnimNode.runAction(cc.sequence(cc.delayTime(this.get_anim_config('flipTime') + this.get_anim_config('waitFlipTime')), cc.removeSelf()));
        rootPanel.addChild(flipAnimNode);
        for (var i = 0; i < const_val.HAND_CARD_NUM; i++) {
            if (onlyLast && i !== const_val.HAND_CARD_NUM - 1) {
                continue;
            }
            if (!onlyLast && gameMode === const_val.GAME_MODE_SEEN_DEALER && doFight && i === const_val.HAND_CARD_NUM - 1) {
                continue;
            }
            let tile_img = rootPanel.getChildByName("tile_img_" + i);
            tile_img.setVisible(false);
            tile_img.runAction(cc.sequence(cc.delayTime(this.get_anim_config('flipTime') + this.get_anim_config('waitFlipTime')), cc.show()));
            let action = UICommonWidget.create_effect_action({
                "TIME": this.get_anim_config('flipTime'),
                "NAME": "poker_flip/",
                "FRAMENUM": 5
            });
            let sprite = new cc.Sprite();
            sprite.setScale(tile_img.getScale() * 0.98);
            let point = tile_img.getPosition();
            sprite.setPosition(point.x - 20, point.y - 20);
            sprite.setAnchorPoint(tile_img.getAnchorPoint());
            sprite.runAction(cc.sequence(action, cc.hide(), cc.delayTime(this.get_anim_config('waitFlipTime')), cc.callFunc(function () {
                tile_img.setVisible(true);
            }), cc.removeSelf()));
            flipAnimNode.addChild(sprite);
        }
    },

    showPokerPoints: function (index, cards, is_show, confirmState) {
        let poker_title_img = this.rootUINode.getChildByName("player_tile_panel" + index).getChildByName("poker_title_img");
        if (is_show) {
            poker_title_img.setVisible(true)
        } else {
            poker_title_img.setVisible(false);
            return;
        }
		var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
		if (confirmState === const_val.POKER_STATE_NONE && const_val.MODULE_CONFIRM_POKER_STATE) {
			poker_title_img.loadTexture('GameRoomUI/ox_0.png', ccui.Widget.PLIST_TEXTURE);
			if (info_dict["sex"] == 1) {
				cc.audioEngine.playEffect("res/sound/voice/male/sound_man_type_0.mp3");
			} else {
				cc.audioEngine.playEffect("res/sound/voice/female/sound_woman_type_0.mp3");
			}
			return;
		}
		let player = h1global.player();
		if (!player || !player.curGameRoom) {
			return;
		}
		let rulesFunc = player.curGameRoom.rulesList;
		cards = collections.map(cards, rules.get_poker_num);
		for (var i = 0; i < rulesFunc.length; i++) {
			var result = rulesFunc[i](cards);
			if (result[1]) {
				let type = result[0];
				let points = result[2];
				let path = null;
				if (type !== const_val.POKER_TYPE_TEN && type !== const_val.POKER_TYPE_NONE) {
					path = 'GameRoomUI/ox_type_' + type + ".png";
				} else {
					path = 'GameRoomUI/ox_' + points + ".png";
					if (info_dict["sex"] == 1) {
						cc.audioEngine.playEffect("res/sound/voice/male/sound_man_type_" + points + ".mp3");
					} else {
						cc.audioEngine.playEffect("res/sound/voice/female/sound_woman_type_" + points + ".mp3");
					}
				}
				poker_title_img.loadTexture(path, ccui.Widget.PLIST_TEXTURE);
				return;
			}
		}
		poker_title_img.loadTexture('GameRoomUI/ox_0.png', ccui.Widget.PLIST_TEXTURE);
		if (info_dict["sex"] == 1) {
			cc.audioEngine.playEffect("res/sound/voice/male/sound_man_type_0.mp3");
		} else {
			cc.audioEngine.playEffect("res/sound/voice/female/sound_woman_type_0.mp3");
		}
	},

    init_operation_panel: function () {
        var player = h1global.entityManager.player();
        if (player.curGameRoom.waitAidList.length > 0) {
            // 重连等待玩家判断，此时需要告诉玩家上一张打出的牌是哪一张
            player.waitForOperation(player.curGameRoom.waitAidList, player.curGameRoom.waitDataList);
        } else {
            if (player.startActions["GameRoomUI"]) {
                return;
            }
            this.hide_operation_panel();
            this.hide_player_computer_panel()
        }
    },

    playOperationFunc: function (curSitNum, opId) {
        var self = this;
        var cur_img = ccui.ImageView.create();
        var cur_img1 = ccui.ImageView.create();
        var cur_img2 = ccui.ImageView.create();
        if ((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
            cur_img1.loadTexture("res/ui/GameRoomUI/" + opId + "_1.png");
            cur_img2.loadTexture("res/ui/GameRoomUI/" + opId + "_2.png");
            opPos(curSitNum, cur_img);
            this.rootUINode.addChild(cur_img);
            cur_img.addChild(cur_img1);
            cur_img.addChild(cur_img2);
            cur_img1.setLocalZOrder(2);
            cur_img2.setLocalZOrder(1);
            cur_img1.runAction(cc.Sequence.create(cc.ScaleTo.create(0.1, 2), cc.DelayTime.create(0.1), cc.ScaleTo.create(0.05, 1),
                cc.Spawn.create(cc.FadeTo.create(0.2, 125), cc.ScaleTo.create(0.2, 1.3)),
                cc.FadeOut.create(0.3),
                cc.removeSelf()));
            cur_img2.runAction(cc.Sequence.create(
                cc.Spawn.create(cc.ScaleTo.create(0.1, 2), cc.MoveBy.create(0.1, cc.p(-2, -9))),
                cc.ScaleTo.create(0.1, 1),
                cc.DelayTime.create(1.2),
                cc.removeSelf()));
        } else {
            cur_img.loadTexture("res/ui/GameRoomUI/" + opId + "_2.png");
            cur_img.setScale(4.0);
            opPos(curSitNum, cur_img);
            this.rootUINode.addChild(cur_img);
            cur_img.runAction(cc.Sequence.create(cc.ScaleTo.create(0.2, 1.5), cc.DelayTime.create(0.5), cc.removeSelf()));
        }

        //动作的位置
        function opPos(curSitNum, cur_img) {
            if (curSitNum == 0) {
                cur_img.setPosition(cc.p(cc.winSize.width * 0.5, self.rootUINode.getChildByName("player_tile_panel0").getPositionY() + 160));
            } else if (curSitNum == 1) {
                cur_img.setPosition(cc.p(self.rootUINode.getChildByName("player_tile_panel1").getPositionX(), cc.winSize.height * 0.5));
            } else if (curSitNum == 2) {
                cur_img.setPosition(cc.p(cc.winSize.width * 0.5, self.rootUINode.getChildByName("player_tile_panel2").getPositionY() - 160));
            } else if (curSitNum == 3) {
                cur_img.setPosition(cc.p(self.rootUINode.getChildByName("player_tile_panel3").getPositionX(), cc.winSize.height * 0.5));
            } else {
                cur_img.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5));
            }
        }
    },

    playOperationEffect: function (opId, serverSitNum, tile) {
        var curSitNum = -1;
        if (serverSitNum === undefined) {
            curSitNum = -1;
        } else {
            curSitNum = h1global.entityManager.player().server2CurSitNum(serverSitNum);
        }
    },

    getEmotionPos: function (playerInfoPanel, idx) {
        var pos = playerInfoPanel.getPosition();
        if (idx === 0) {
            pos = cc.p(pos.x + playerInfoPanel.width, pos.y + playerInfoPanel.height * 0.5);
        } else if (idx === 1) {
            pos = cc.p(pos.x - playerInfoPanel.width * 0.9, pos.y + playerInfoPanel.height * 0.1);
        } else if (idx === 2) {
            pos = cc.p(pos.x - playerInfoPanel.width * 1.55, pos.y);
        } else if (idx === 3) {
            pos = cc.p(pos.x - playerInfoPanel.width * 0.5, pos.y - playerInfoPanel.height * 0.3);
        } else if (idx === 4) {
            pos = cc.p(pos.x + playerInfoPanel.width * 0.5, pos.y - playerInfoPanel.height * 0.9);
        } else if (idx === 5) {
            pos = cc.p(pos.x + playerInfoPanel.width * 0.9, pos.y + playerInfoPanel.height * 0.5);
        }
        return pos;
    },

    playEmotionAnim: function (serverSitNum, eid) {
        var curSitNum = h1global.entityManager.player().server2CurSitNum(serverSitNum);
        var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + curSitNum);
        var talk_img = ccui.ImageView.create();
        // talk_img.setPosition(this.getMessagePos(player_info_panel).x - 70, this.getMessagePos(player_info_panel).y + 10);
        talk_img.setPosition(this.getEmotionPos(player_info_panel, curSitNum));
        talk_img.loadTexture("res/ui/Default/talk_frame.png");
        talk_img.setScale9Enabled(true);
        talk_img.setContentSize(cc.size(100, 120));
        this.rootUINode.addChild(talk_img);
        var talk_angle_img = ccui.ImageView.create();
        talk_angle_img.loadTexture("res/ui/Default/talk_angle.png");
        talk_img.addChild(talk_angle_img);
        // 加载表情图片
        cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
        var cache = cc.spriteFrameCache;
        var plist_path = "res/effect/biaoqing.plist";
        var png_path = "res/effect/biaoqing.png";
        cache.addSpriteFrames(plist_path, png_path);
        cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;

        var anim_frames = [];
        for (var i = 1; i <= const_val.ANIM_LIST[eid - 1]; i++) {
            var frame = cache.getSpriteFrame("Emot/biaoqing_" + eid.toString() + "_" + i.toString() + ".png");
            if (frame) {
                anim_frames.push(frame);
            }
        }
        var effect_animation = new cc.Animation(anim_frames, 1.2 / const_val.ANIM_LIST[eid - 1]);
        var effect_action = new cc.Animate(effect_animation);

        var emot_sprite = cc.Sprite.create();
        // emot_sprite.setScale(1.0);
        emot_sprite.setScale(0.4);
        emot_sprite.setPosition(cc.p(50, 60));
        // emot_sprite.setPosition(this.getMessagePos(player_info_panel));
        talk_img.addChild(emot_sprite);
        if (curSitNum > 0 && curSitNum < 4) {
            talk_img.setScaleX(-1);
            talk_img.setPositionX(talk_img.getPositionX() - 40);
            talk_img.setPositionY(talk_img.getPositionY() - 10);
        } else {
            talk_img.setPositionX(talk_img.getPositionX() + 40);
            talk_angle_img.setLocalZOrder(3);
        }
        talk_angle_img.setPosition(3, talk_angle_img.getPositionY() + 50);
        emot_sprite.runAction(cc.Sequence.create(cc.Repeat.create(effect_action, 2), cc.CallFunc.create(function () {
            talk_img.removeFromParent();
        })));
    },

    getMessagePos: function (playerInfoPanel, idx) {
        var pos = playerInfoPanel.getPosition();
        if (idx === 0) {
            pos = cc.p(pos.x + playerInfoPanel.width, pos.y + playerInfoPanel.height * 0.5);
        } else if (idx === 1) {
            pos = cc.p(pos.x - playerInfoPanel.width * 0.9, pos.y + playerInfoPanel.height * 0);
        } else if (idx === 2) {
            pos = cc.p(pos.x - playerInfoPanel.width * 1.5, pos.y);
        } else if (idx === 3) {
            pos = cc.p(pos.x - playerInfoPanel.width * 0.5, pos.y - playerInfoPanel.height * 0.3);
        } else if (idx === 4) {
            pos = cc.p(pos.x + playerInfoPanel.width * 0.5, pos.y - playerInfoPanel.height * 0.9);
        } else if (idx === 5) {
            pos = cc.p(pos.x + playerInfoPanel.width * 0.9, pos.y + playerInfoPanel.height * 0.4);
        }
        return pos;
    },

    playMessageAnim: function (serverSitNum, mid, msg) {
        var idx = h1global.entityManager.player().server2CurSitNum(serverSitNum);
        var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + idx);
        var talk_img = ccui.ImageView.create();
        var talk_angle_img = ccui.ImageView.create();
        talk_img.setAnchorPoint(0, 0.5);
        talk_img.setPosition(this.getMessagePos(player_info_panel, idx));
        talk_img.loadTexture("res/ui/Default/talk_frame.png");
        talk_angle_img.loadTexture("res/ui/Default/talk_angle.png");
        talk_img.addChild(talk_angle_img);
        this.rootUINode.addChild(talk_img);

        var msg_label = cc.LabelTTF.create("", "Arial", 22);
        msg_label.setString(mid < 0 ? msg : const_val.MESSAGE_LIST[mid]);
        msg_label.setDimensions(msg_label.getString().length * 26, 0);
        msg_label.setColor(cc.color(20, 85, 80));
        msg_label.setAnchorPoint(cc.p(0.5, 0.5));
        talk_img.addChild(msg_label);
        talk_img.setScale9Enabled(true);
        talk_img.setContentSize(cc.size(msg_label.getString().length * 23 + 20, talk_img.getContentSize().height));
        talk_angle_img.setPosition(3, talk_img.getContentSize().height * 0.5);
        if (idx > 0 && idx < 4) {
            msg_label.setPosition(cc.p(msg_label.getString().length * 26 * 0.37 + 10, 23));
            talk_img.setScaleX(-1);
            msg_label.setScaleX(-1);
        } else {
            msg_label.setPosition(cc.p(msg_label.getString().length * 26 * 0.50 + 13, 23));
            talk_angle_img.setLocalZOrder(3);
        }
        msg_label.runAction(cc.Sequence.create(cc.DelayTime.create(2.0), cc.CallFunc.create(function () {
            talk_img.removeFromParent();
        })));
    },

    getExpressionPos: function (player_info_panel, idx) {
        // 魔法表情
        var pos = player_info_panel.getPosition();
        if (idx === 0) {
            pos = cc.p(pos.x + player_info_panel.width * 0.5, pos.y + player_info_panel.height * 0.5);
        } else if (idx === 1) {
            pos = cc.p(pos.x - player_info_panel.width * 0.4, pos.y);
        } else if (idx === 2) {
            pos = cc.p(pos.x - player_info_panel.width, pos.y);
        } else if (idx === 3) {
            pos = cc.p(pos.x, pos.y - player_info_panel.height * 0.3);
        } else if (idx === 4) {
            pos = cc.p(pos.x, pos.y - player_info_panel.height * 0.9);
        } else if (idx === 5) {
            pos = cc.p(pos.x + player_info_panel.width * 0.4, pos.y + player_info_panel.height * 0.4);
        }
        return pos;
    },

    playExpressionAnim: function (fromIdx, toIdx, eid) {
        var self = this;
        var rotate = 0;
        var moveTime = 0.7;
        var flagArr = [[1, 2], [0, 5], [5, 4]];
        for (var i = 0; i < flagArr.length; i++) {
            let arr = flagArr[i];
            if ((arr[0] === fromIdx || arr[1] === fromIdx) && (arr[0] === toIdx || arr[1] === toIdx)) {
                moveTime = 0.3;
                break;
            }
        }
        var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + fromIdx.toString());
        var expression_img = ccui.ImageView.create();
        expression_img.setPosition(this.getExpressionPos(player_info_panel, fromIdx));
        expression_img.loadTexture("res/ui/PlayerInfoUI/expression_" + const_val.EXPRESSION_ANIM_LIST[eid] + ".png");
        this.rootUINode.addChild(expression_img);
        if (eid > 1) {
            rotate = 1440;
            rotate = rotate + (moveTime - 0.7) * 1800;
        }
        expression_img.runAction(cc.Spawn.create(cc.RotateTo.create(0.2 + moveTime, rotate), cc.Sequence.create(
            cc.ScaleTo.create(0.1, 1.5),
            cc.ScaleTo.create(0.1, 1),
            cc.MoveTo.create(moveTime, self.getExpressionPos(self.rootUINode.getChildByName("player_info_panel" + toIdx.toString()), toIdx)),
            cc.CallFunc.create(function () {
                expression_img.removeFromParent();
                cc.audioEngine.playEffect("res/sound/effect/" + const_val.EXPRESSION_ANIM_LIST[eid] + ".mp3");
                self.playExpressionAction(toIdx, self.getExpressionPos(self.rootUINode.getChildByName("player_info_panel" + toIdx.toString()), toIdx), eid);
            })
        )));
    },

    playExpressionAction: function (idx, pos, eid) {
        if (idx < 0 || idx > 5) {
            return;
        }
        var self = this;
        UICommonWidget.load_effect_plist("expression");
        var expression_sprite = cc.Sprite.create();
        if (eid == 3) {
            expression_sprite.setScale(2);
        }
        expression_sprite.setPosition(pos);
        self.rootUINode.addChild(expression_sprite);
        expression_sprite.runAction(cc.Sequence.create(
            UICommonWidget.create_effect_action({
                "FRAMENUM": const_val.EXPRESSION_ANIMNUM_LIST[eid],
                "TIME": const_val.EXPRESSION_ANIMNUM_LIST[eid] / 16,
                "NAME": "Expression/" + const_val.EXPRESSION_ANIM_LIST[eid] + "_"
            }),
            cc.DelayTime.create(0.5),
            cc.CallFunc.create(function () {
                expression_sprite.removeFromParent();
            })
        ));
    },

    playVoiceAnim: function (serverSitNum, record_time) {
        var self = this;
        if (cc.audioEngine.isMusicPlaying()) {
            cc.audioEngine.pauseMusic();
        }
        var idx = h1global.entityManager.player().server2CurSitNum(serverSitNum);
        var interval_time = 0.8;
        this.talk_img_num += 1;
        // var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + h1global.entityManager.player().server2CurSitNum(serverSitNum));
        var player_info_panel = undefined;
        if (serverSitNum < 0) {
            player_info_panel = this.rootUINode.getChildByName("agent_info_panel");
        } else {
            player_info_panel = this.rootUINode.getChildByName("player_info_panel" + h1global.entityManager.player().server2CurSitNum(serverSitNum));
        }
        var talk_img = ccui.ImageView.create();
        talk_img.setPosition(this.getMessagePos(player_info_panel, idx));
        talk_img.loadTexture("res/ui/Default/talk_frame.png");
        talk_img.setScale9Enabled(true);
        talk_img.setContentSize(cc.size(100, talk_img.getContentSize().height));
        this.rootUINode.addChild(talk_img);
        var talk_angle_img = ccui.ImageView.create();
        talk_angle_img.loadTexture("res/ui/Default/talk_angle.png");
        talk_img.addChild(talk_angle_img);

        var voice_img1 = ccui.ImageView.create();
        voice_img1.loadTexture("res/ui/Default/voice_img1.png");
        voice_img1.setPosition(cc.p(50, 23));
        talk_img.addChild(voice_img1);
        var voice_img2 = ccui.ImageView.create();
        voice_img2.loadTexture("res/ui/Default/voice_img2.png");
        voice_img2.setPosition(cc.p(50, 23));
        voice_img2.setVisible(false);
        talk_img.addChild(voice_img2);
        voice_img2.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.DelayTime.create(interval_time), cc.CallFunc.create(function () {
            voice_img1.setVisible(false);
            voice_img2.setVisible(true);
            voice_img3.setVisible(false);
        }), cc.DelayTime.create(interval_time * 2), cc.CallFunc.create(function () {
            voice_img2.setVisible(false)
        }))));
        var voice_img3 = ccui.ImageView.create();
        voice_img3.loadTexture("res/ui/Default/voice_img3.png");
        voice_img3.setPosition(cc.p(50, 23));
        voice_img3.setVisible(false);
        talk_img.addChild(voice_img3);
        voice_img3.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.DelayTime.create(interval_time * 2), cc.CallFunc.create(function () {
            voice_img1.setVisible(false);
            voice_img2.setVisible(false);
            voice_img3.setVisible(true);
        }), cc.DelayTime.create(interval_time), cc.CallFunc.create(function () {
            voice_img3.setVisible(false);
            voice_img1.setVisible(true);
        }))));
        talk_angle_img.setPosition(3, talk_img.getContentSize().height * 0.5);
        if (idx > 0 && idx < 4) {
            talk_img.setScale(-1);
            talk_img.setPositionX(talk_img.getPositionX() - 40);
        } else {
            talk_img.setPositionX(talk_img.getPositionX() + 40);
            talk_angle_img.setLocalZOrder(3);
        }
        talk_img.runAction(cc.Sequence.create(cc.DelayTime.create(record_time), cc.CallFunc.create(function () {
            talk_img.removeFromParent();
            self.talk_img_num -= 1;
            if (self.talk_img_num === 0) {
                if (!cc.audioEngine.isMusicPlaying()) {
                    cc.audioEngine.resumeMusic();
                }
            }
        })));
        // return talk_img;
    },

    play_result_anim: function (callback, player_info_list, scoreList, curGameRoom, myServerSitNum) {
        this.playResultAnim = true;
        var self = this;

        function createLabel(parent, score) {
            if (score === 0) {
                return;
            }
            let signum = "";
            // 130, 54
            // let bg_path = "GameRoomUI/score_win_bg.png";
            // let font = "yingfenshuzi.fnt";
            let nodeSrc = null;
            if (score > 0) {
                signum = "+";
                nodeSrc = self.rootUINode.getChildByName("clone_nodes").getChildByName("win_anim_img");
            } else if (score < 0) {
                // signum = "-";
                // bg_path = "GameRoomUI/score_lose_bg.png";
                // font = "shufenshuzi.fnt";
                nodeSrc = self.rootUINode.getChildByName("clone_nodes").getChildByName("lose_anim_img");
            }

            // let bgImg = new ccui.ImageView(bg_path, ccui.Widget.PLIST_TEXTURE);
            let bgImg = nodeSrc.clone();
            let label = bgImg.getChildByName("score_label");
            label.setString(signum + score);
            // let label = ccui.TextBMFont.create(signum + score, 'res/ui/GameRoomUI/' + font);
            // let label = UICommonWidget.createBMFont(signum + score, 'res/ui/GameRoomUI/' + font);
            // label.setPosition(130 * 0.5, 54 * 0.5);
            // bgImg.addChild(label);
			bgImg.runAction(cc.spawn(
				cc.sequence(cc.moveBy(0.8, 0, 40), cc.delayTime(4), cc.removeSelf()),
				cc.sequence(cc.fadeIn(0.2), cc.delayTime(4.4), cc.fadeOut(0.2))
			));
			label.runAction(cc.sequence(cc.fadeIn(0.2), cc.delayTime(4.4), cc.fadeOut(0.2)));

            let size = parent.getContentSize();
            bgImg.setPosition(size.width / 2, size.height / 2 + 40);
            parent.addChild(bgImg);
        }

        player_info_list = cutil.deepCopy(player_info_list).sort(function (a, b) {
            if (a['idx'] === curGameRoom.dealerIdx) {
                return 100;
            }
            if (b['idx'] === curGameRoom.dealerIdx) {
                return -100;
            }
        });
		var tmp_player_info_list = cutil.deepCopy(player_info_list);
        var dealerIdx = curGameRoom.dealerIdx;
		this.rootUINode.runAction(
			cc.sequence(
				cc.sequence(
					cc.delayTime(0.5), cc.callFunc(function () {
						let info = player_info_list.shift();
						let idx = info['idx'];
						let tiles = info['tiles'];
						self.update_player_desk_tiles(idx, tiles, true, true, myServerSitNum, curGameRoom);
						if (dealerIdx === idx) {
							return;
						}
						if (scoreList[idx] < 0) {
							self.playCoinAnim(idx, dealerIdx, 0.6, myServerSitNum);
							cc.audioEngine.playEffect("res/sound/effect/coins_fly.mp3");
						} else if (scoreList[idx] > 0) {
							self.playCoinAnim(dealerIdx, idx, 0.6, myServerSitNum, 0.8);
							cc.audioEngine.playEffect("res/sound/effect/coins_fly.mp3");
						}
					})
				).repeat(player_info_list.length),
				cc.callFunc(function () {
					for (var i = 0; i < tmp_player_info_list.length; i++) {
						var info = tmp_player_info_list[i];
						let idx = info['idx'];
						self.rootUINode.runAction(cc.sequence(cc.delayTime(i * 0.5) , cc.callFunc(function () {
							createLabel(self.containUISnippets["PlayerInfoSnippet" + idx].rootUINode, scoreList[idx]);
						})))
					}
				}),
				cc.delayTime(2),
				cc.callFunc(function () {
					self.playResultAnim = false;
					if (callback) {
						callback();
					}
				}))
		);
	},

    update_roominfo_panel: function () {
        if (!this.is_show) {
            return;
        }
    },

    /* op_dict = {8:[], 16:[1], 32:[4], 64:[4], 128:[]} value数组不能为空list */
    /* from_type = 0 自摸 from_type = 1 提交确认*/
    update_operation_panel: function (op_dict, from_type) {
        cc.log("update_operation_panel, op_dict:", op_dict, from_type);
        if (!this.is_show) {
            return;
        }
        let keys = Object.keys(op_dict);
        if (keys.length === 0) {
            this.unlock_player_hand_tiles();
            this.hide_operation_panel();
            this.hide_player_computer_panel();
            return;
        }

        let operation_panel = this.rootUINode.getChildByName("operation_panel");

        // sync method
        function layoutBtns(btns) {
            let space = 10;
            let rootSize = operation_panel.getContentSize();
            let length = btns.length;

            let needWidth = space * (length - 1) + 136 * length;
            let start = (rootSize.width - needWidth) * 0.5;
            for (var i = 0; i < length; i++) {
                btns[i].setPosition(start + 136 * i + space * i, rootSize.height * 0.5);
            }
        }

        function addClickEventHandle(source, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED && cc.sys.isObjectValid(source) && UICommonWidget.isAncestorsVisible(source)) {
                let player = h1global.entityManager.player();
                if (player) {
                    player.confirmOperation(source.postOp, source.postData);
                    operation_panel.setVisible(false);
                }
            }
        }

        let showOperation = false;
        for (var i = 0; i < keys.length; i++) {
            let op = parseInt(keys[i]);
            let data = op_dict[keys[i]];
            if (op === const_val.OP_SHOW_CARD) {
                this.update_player_computer_panel([0, 0, 0]);
            } else if (op === const_val.OP_BET) {
                let btns = [];
                operation_panel.removeAllChildren();
                let btnSrc = this.rootUINode.getChildByName("clone_nodes").getChildByName("bet_btn");
                for (var j = 0; j < data.length; j++) {
                    // let op_btn = new ccui.Button();
                    let op_btn = btnSrc.clone();
                    // Note: size 136,54
                    // op_btn.loadTextureNormal('GameRoomUI/op_bet_bg.png', ccui.Widget.PLIST_TEXTURE);
                    operation_panel.addChild(op_btn);
                    op_btn.postOp = const_val.OP_BET;
                    op_btn.postData = [data[j]];
                    btns.push(op_btn);
                    // let label = ccui.TextBMFont.create("" + data[j], 'res/ui/GameRoomUI/fensuzi.fnt');
                    // let label = UICommonWidget.createBMFont("" + data[j], 'res/ui/GameRoomUI/fensuzi.fnt');
                    // label.setPosition(136 * 0.5, 54 * 0.5);
                    // op_btn.addChild(label);
                    let label = op_btn.getChildByName("num_label");
                    label.ignoreContentAdaptWithSize(true);
                    label.setString("" + data[j]);
                    op_btn.addTouchEventListener(addClickEventHandle)
                }
                layoutBtns(btns);
                showOperation = true;
            } else if (op === const_val.OP_FIGHT_DEALER) {
                let btns = [];
                operation_panel.removeAllChildren();
                for (var j = 0; j < data.length; j++) {
                    let op_btn = new ccui.Button();
                    // Note: size 136,54
                    if (data[j] !== 0) {
                        op_btn.loadTextureNormal('GameRoomUI/op_mul_' + data[j] + '.png', ccui.Widget.PLIST_TEXTURE);
                    } else {
                        op_btn.loadTextureNormal('GameRoomUI/op_mul_pass.png', ccui.Widget.PLIST_TEXTURE);
                    }
                    op_btn.postOp = const_val.OP_FIGHT_DEALER;
                    op_btn.postData = [data[j]];
                    operation_panel.addChild(op_btn);
                    btns.push(op_btn);
                    op_btn.addTouchEventListener(addClickEventHandle)
                }
                layoutBtns(btns);
                showOperation = true;
            }
        }
        operation_panel.setVisible(showOperation);
        if (this.beginAnimPlaying) {
            cc.log("update_operation_panel play anim");
            operation_panel.setVisible(false);
        }
    },


    show_operation_panel: function () {
        if (!this.is_show) {
            return;
        }
        let operation_panel = this.rootUINode.getChildByName("operation_panel");
        if (!operation_panel.editorOrigin) {
            operation_panel.editorOrigin = operation_panel.getPosition();
        }
        operation_panel.setVisible(true);
    },

    hide_operation_panel: function () {
        if (!this.is_show) {
            return;
        }
        this.rootUINode.getChildByName("operation_panel").setVisible(false);
    },

    hide_player_computer_panel: function () {
        if (!this.is_show) {
            return;
        }
        this.rootUINode.getChildByName("player_computer_panel").setVisible(false);
    },

    init_player_computer_panel: function () {
        let playerComputerPanel = this.rootUINode.getChildByName("player_computer_panel");
        var self = this;
        playerComputerPanel.getChildByName("ox_pass_btn").addClickEventListener(function (source) {
            if (!self.is_show || !UICommonWidget.isAncestorsVisible(source)) {
                return;
            }
			let player = h1global.player();
			if (!const_val.MODULE_CONFIRM_POKER_STATE) {
				if (!player || !player.curGameRoom) {
					return;
				}
				let rulesFunc = player.curGameRoom.rulesList;
				let cards = player.curGameRoom.handTilesList[player.serverSitNum];
				cards = collections.map(cards, rules.get_poker_num);
				for (var i = 0; i < rulesFunc.length; i++) {
					if (rulesFunc[i](cards)[1]) {
						UICommonWidget.showToast(self.rootUINode, '其实有牛哦，请仔细算一下！', cc.p(cc.winSize.width / 2, cc.winSize.height * 0.38), 1);
						return;
					}
				}
			}
			this.selectedCards = [0, 0, 0];
			if (player) {
				player.confirmOperation(const_val.OP_SHOW_CARD, [const_val.POKER_STATE_NONE]);
			}
        });
        playerComputerPanel.getChildByName("ox_confirm_btn").addClickEventListener(function (source) {
            if (!self.is_show || !UICommonWidget.isAncestorsVisible(source)) {
                return;
            }
            if (h1global.entityManager.player()) {
                let player = h1global.entityManager.player();
                if (collections.any(const_val.AUTO_COMPUTER_TEN_LIST, function (item) {
                        return player.isTargetPokerType(item);
                    })) {
                    player.confirmOperation(const_val.OP_SHOW_CARD, [const_val.POKER_STATE_TEN]);
                    return;
                }
            }

            if (self.selectedCards.indexOf(0) >= 0) {
                cc.log("not confirm");
                // if (h1global.curUIMgr.toast_ui) {
                // h1global.curUIMgr.toast_ui.show_toast("", 12, cc.winSize.width / 2, cc.winSize.height / 2, 10)
                // }
            } else {
                let tmp = collections.map(self.selectedCards, function (x) {
                    x = rules.get_poker_num(x);
                    return x > 10 ? 10 : x;
                });
                if (collections.sum(tmp) % 10 === 0) {
                    let player = h1global.entityManager.player();
                    if (player) {
                        player.confirmOperation(const_val.OP_SHOW_CARD, [const_val.POKER_STATE_TEN]);
                    }
                } else {
                    if (cc.sys.isObjectValid(self.rootUINode)) {
                        UICommonWidget.showToast(self.rootUINode, '需要是“10”的倍数哦', cc.p(cc.winSize.width / 2, cc.winSize.height * 0.38), 1);
                    }
                }
            }
        });
    },

    update_player_computer_panel_with_special: function () {
        let playerComputerPanel = this.rootUINode.getChildByName("player_computer_panel");
        playerComputerPanel.setVisible(true);
        let numPanel = playerComputerPanel.getChildByName("computer_panel");

        function hide_computer() {
            numPanel.setVisible(false);
            playerComputerPanel.getChildByName("ox_pass_btn").setVisible(false);
        }

        let player = h1global.entityManager.player();
        if (player && player.curGameRoom) {
            for (var i = 0; i < const_val.AUTO_COMPUTER_TEN_LIST.length; i++) {
                if (player.isTargetPokerType(const_val.AUTO_COMPUTER_TEN_LIST[i])) {
                    cc.log("special: ", const_val.AUTO_COMPUTER_TEN_LIST[i]);
                    hide_computer();
                    return true;
                }
            }
        }
        return false;
    },

    update_player_computer_panel: function (selectList) {
        if (!this.is_show) {
            return;
        }
        if (this.update_player_computer_panel_with_special()) {
            return;
        }
        let playerComputerPanel = this.rootUINode.getChildByName("player_computer_panel");
        playerComputerPanel.setVisible(true);
        let numPanel = playerComputerPanel.getChildByName("computer_panel");
        numPanel.setVisible(true);
        playerComputerPanel.getChildByName("ox_pass_btn").setVisible(true);
        for (var i = 0; i < 3; i++) {
            let label = numPanel.getChildByName("num" + i);
            label.setString(rules.get_poker_string(selectList[i]));
            label.setVisible(selectList[i] !== 0);
        }
        let sumLabel = numPanel.getChildByName("num3");
        sumLabel.ignoreContentAdaptWithSize(true);
        let sum = collections.sum(collections.map(selectList, function (x) {
            x = rules.get_poker_num(x);
            return x > 10 ? 10 : x;
        }));
        sumLabel.setString(sum);
        sumLabel.setVisible(sum !== 0);
    },

    reset: function () {
        if (!this.is_show) {
            return;
        }
        for (var i = 0; i < 4; i++) {
            this.rootUINode.getChildByName("player_tile_panel" + i).setVisible(false);
        }
        let handPanel = this.rootUINode.getChildByName("player_hand_panel").getChildByName("player_tile_panel").getChildByName("player_hand_panel");
        this.selectedCards = [0, 0, 0];
        for (var i = 0; i < const_val.HAND_CARD_NUM; i++) {
            let tileImg = handPanel.getChildByName("tile_img_" + i);
            tileImg.selectedFlag = false;
            UICommonWidget.resetToOriginPosition(tileImg);
        }
        for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
            this.update_bet_score_panel(i, 0);
            this.update_dealer_mul_panel(i, null);
        }
        this.hide_player_computer_panel();
        this.hide_player_hand_tiles();
        this.hide_operation_panel();
        this.hide_player_desk_panel();

        let player = h1global.entityManager.player();
        if (player && player.curGameRoom) {
            this.update_all_player_score(player.curGameRoom.playerInfoList);
            if (h1global.curUIMgr && h1global.curUIMgr.gameroominfo_ui && h1global.curUIMgr.gameroominfo_ui.is_show) {
                h1global.curUIMgr.gameroominfo_ui.update_round();
            }
        }
    },
    startGame: function () {
        if (!this.is_show) {
            return;
        }
        this.playResultAnim = false;
        let player = h1global.entityManager.player();

        let all_show = true;
        for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
            if (player && player.curGameRoom) {
                if (player.curGameRoom.playerInfoList[i] && player.curGameRoom.playerInfoList[i].role === const_val.GAME_ROLE_PLAYER) {
                    if (player.curGameRoom.show_state_list[i] !== 1) {
                        all_show = false;
                        break;
                    }
                }
            }
        }
        for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
            if (!player || !player.curGameRoom) {
                // Note: 已经掉线
                this.hide_player_hand_tiles(i);
                this.update_player_hand_tiles(i, [0, 0, 0, 0, 0], false);
            } else {
                let curGameRoom = player.curGameRoom;
                let show_state = curGameRoom.show_state_list[i] === 1;
                let handTilesList = curGameRoom.handTilesList[i];
                if (show_state) {
                    if (i === player.serverSitNum) {
                        this.hide_player_hand_tiles(i);
                    }
                    this.update_player_desk_tiles(i, handTilesList, false, all_show, player.serverSitNum, curGameRoom);
                } else {
                    if (i === player.serverSitNum) {
                        if (curGameRoom.playerInfoList[i] && curGameRoom.playerInfoList[i].role === const_val.GAME_ROLE_PLAYER) {
                            this.update_player_hand_tiles(i, handTilesList, false, curGameRoom.game_mode, curGameRoom.waitAidList);
                        } else {
                            this.hide_player_hand_tiles(i)
                        }
                    } else {
                        if (curGameRoom.playerInfoList[i] && curGameRoom.playerInfoList[i].role === const_val.GAME_ROLE_PLAYER) {
                            this.update_player_desk_tiles(i, handTilesList, false, all_show, player.serverSitNum, curGameRoom);
                        }
                    }
                }
            }
        }

        for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
            this.update_player_ready_state(i, 0);
        }

        this.init_operation_panel();
        this.init_dealer_mul_panel();
        this.init_bet_score_panel();
    },


    playCoinAnim: function (fromIdx, toIdx, duration, myServerSitNum, delayTime) {
        delayTime = delayTime === undefined ? 0 : delayTime;
        let parent = this.rootUINode;

        let startPos = this.containUISnippets["PlayerInfoSnippet" + fromIdx].rootUINode.getPosition();
        let endPos = this.containUISnippets["PlayerInfoSnippet" + toIdx].rootUINode.getPosition();

        // let duration = Math.sqrt((startPos.x - endPos.x) ** 2 + (startPos.y + endPos.y) ** 2) / 600.0;
        this.containUISnippets["PlayerInfoSnippet" + toIdx].setVisible(true);
        let fromIndex = this.server2CurSitNumOffline(fromIdx, myServerSitNum);
        let toIndex = this.server2CurSitNumOffline(toIdx, myServerSitNum);
        if (fromIndex === 0) {
            startPos.x += 60;
            startPos.y += 80;
        } else if (fromIndex === 1) {
            startPos.x -= 50;
        } else if (fromIndex === 2) {
            startPos.x -= 120;
        } else if (fromIndex === 3) {
            startPos.y -= 50;
        } else if (fromIndex === 4) {
            startPos.y -= 140;
        } else if (fromIndex === 5) {
            startPos.y += 70;
            startPos.x += 50;
        }

        if (toIndex === 0) {
            endPos.x += 60;
            endPos.y += 80;
        } else if (toIndex === 1) {
            endPos.x -= 50;
        } else if (toIndex === 2) {
            endPos.x -= 120;
        } else if (toIndex === 3) {
            endPos.y -= 50;
        } else if (toIndex === 4) {
            endPos.y -= 140;
        } else if (toIndex === 5) {
            endPos.y += 70;
            endPos.x += 50;
        }
        for (var i = 0; i < 12; i++) {
            for (var j = 0; j < 2; j++) {

                let sprite = new cc.Sprite("#GameRoomUI/coin.png");
                parent.addChild(sprite);
                sprite.setPosition(startPos);
                sprite.setVisible(false);
                let rate = Math.random();
                let rate2 = Math.random();
                let x = rate * 30 * (rate > 0.5 ? 1 : -1) + endPos.x;
                let y = rate2 * 30 * (rate2 > 0.5 ? 1 : -1) + endPos.y;

                // sprite.runAction(cc.sequence(cc.delayTime(0.5 * Math.random()), cc.moveTo(duration, x, y), cc.removeSelf()))
                sprite.runAction(cc.sequence(cc.delayTime(delayTime + 0.05 * i), cc.show(), cc.sequence(
                    // cc.moveTo(duration - i * 0.02, x, y)
                    cc.bezierTo(duration, [startPos, cc.p((startPos.x + endPos.x) * 0.6, y), cc.p(x, y)])
                ).easing(
                    cc.easeIn(0.5)
                ), cc.removeSelf()));
            }
            // sprite.runAction(cc.bezierTo(1, [startPos, cc.p((startPos.x + endPos.x) * 0.7, (startPos.y + endPos.y) * 0.8), endPos]))
        }
    },

	_get_player_info_anim_position: function (serverSitNum) {
		let node = this.containUISnippets["PlayerInfoSnippet" + serverSitNum].rootUINode;
		let position = node.getPosition();
		let player = h1global.player();
		let idx = serverSitNum;
		if(player){
			idx =  player.server2CurSitNum(serverSitNum);
		}
		if(idx === 0){
			position.x += 55;
			position.y += 60;
		} else if (idx === 1) {
			position.x -= 50;
			position.y += 10;
		} else if (idx === 2) {
			position.x -= 100;
			position.y += 10;
		} else if (idx === 3) {
			position.x -= 0;
			position.y -= 30;
		} else if (idx === 4) {
			position.x += 10;
			position.y -= 130;
		} else if (idx === 5) {
			position.x += 50;
			position.y += 60;
		}
		return position;
	},

	play_fight_dealer_anim: function (targetServerSitNum) {
		if (!this.is_show) {
			return;
		}
		let targetPosition = this._get_player_info_anim_position(targetServerSitNum);
		let sprite = new cc.Sprite("#GameRoomUI/dealer_gold_crown.png");
		sprite.setPosition(cc.winSize.width * 0.52, cc.winSize.height * 0.615);
		let len = Math.sqrt((cc.winSize.width * 0.5 - targetPosition.x) * (cc.winSize.width * 0.5 - targetPosition.x) + (cc.winSize.height * 0.5 - targetPosition.y) * (cc.winSize.height * 0.5 - targetPosition.y));
		sprite.scale = 1.5;
		sprite.runAction(cc.spawn(
			cc.sequence(cc.delayTime(1),cc.moveTo(len / 600.0, targetPosition), cc.removeSelf()),
			cc.sequence(cc.delayTime(1), cc.scaleTo(len / 600.0, 1))
		));
		this.rootUINode.addChild(sprite);

	},

	play_bet_anim: function (serverSitNum, score) {
		if (!this.is_show) {
			return;
		}
		let targetPosition = this._get_player_info_anim_position(serverSitNum);
		let sprite = new cc.Sprite("#GameRoomUI/coin.png");
		sprite.scale = 0.5;
		sprite.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
		let len = Math.sqrt((cc.winSize.width * 0.5 - targetPosition.x) * (cc.winSize.width * 0.5 - targetPosition.x) + (cc.winSize.height * 0.5 - targetPosition.y) * (cc.winSize.height * 0.5 - targetPosition.y));
		sprite.runAction(cc.sequence(cc.delayTime(1),cc.moveTo(len / 600.0, targetPosition), cc.removeSelf()));
		this.rootUINode.addChild(sprite);
	},
	
    server2CurSitNumOffline: function (serverSitNum, myServerSitNum) {
        return (serverSitNum - myServerSitNum + const_val.MAX_PLAYER_NUM) % const_val.MAX_PLAYER_NUM;
    }

});