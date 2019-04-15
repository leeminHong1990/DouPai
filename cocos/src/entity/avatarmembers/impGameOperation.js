"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var impGameOperation = impCommunicate.extend({
    __init__: function () {
        this._super();
        this.runMode = const_val.GAME_ROOM_GAME_MODE;
        this.startActions = {};
        KBEngine.DEBUG_MSG("Create impRoomOperation");
    },

    startGame: function (dealerIdx, tileList, swap_list) {
        cc.log("startGame");
        cc.log(dealerIdx, tileList, swap_list);
        var self = this;
        if (!this.curGameRoom) {
            return;
        }
        //交换位置 玩家当前在服务端的位置也改变
        var enterPlayerInfoList = cutil.deepCopy(this.curGameRoom.playerInfoList);
        cc.log(enterPlayerInfoList);
        this.serverSitNum = swap_list.indexOf(this.serverSitNum);
        this.curGameRoom.swap_seat(swap_list);
        this.curGameRoom.canContinue = null;
        this.runMode = const_val.GAME_ROOM_GAME_MODE;
        this.curGameRoom.startGame();
        this.curGameRoom.dealerIdx = dealerIdx;
        let startTilesList = cutil.deepCopy(this.curGameRoom.handTilesList);
        startTilesList[this.serverSitNum] = tileList.concat([]);
        startTilesList[this.serverSitNum].sort(rules.poker_compare);
        cc.log("startGame", startTilesList[this.serverSitNum]);

        this.curGameRoom.handTilesList[this.serverSitNum] = tileList;
        this.curGameRoom.handTilesList[this.serverSitNum].sort(rules.poker_compare);

        if (h1global.curUIMgr && h1global.curUIMgr.gameroomprepare_ui) {
            h1global.curUIMgr.gameroomprepare_ui.hide();
        }

        this.startActions["GameRoomUI"] = function () {
            if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
                h1global.curUIMgr.roomLayoutMgr.notifyObserver("startBeginAnim", startTilesList[self.serverSitNum], self.serverSitNum, self.curGameRoom, dealerIdx);
            }
            h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_dealer_idx", self.curGameRoom.dealerIdx);
            if (onhookMgr && self.curGameRoom.op_seconds > 0) {
                onhookMgr.setWaitLeftTime(self.curGameRoom.op_seconds + const_val.BEGIN_ANIMATION_TIME)
            } else if (onhookMgr && const_val.FAKE_COUNTDOWN > 0) {
                onhookMgr.setWaitLeftTime(const_val.FAKE_COUNTDOWN + const_val.FAKE_BEGIN_ANIMATION_TIME);
            }
            // cc.audioEngine.playEffect("res/sound/effect/saizi_music.mp3");
        };

        if (this.curGameRoom.curRound <= 1) {
            this.startActions["GameRoomScene"] = function () {
                if (h1global.curUIMgr && h1global.curUIMgr.gameroominfo_ui) {
                    if (h1global.curUIMgr.gameroominfo_ui.is_show) {
                        h1global.curUIMgr.gameroominfo_ui.hide();
                    }
                    h1global.curUIMgr.gameroominfo_ui.show();
                }
                if (const_val.SHOW_SWAP_SEAT) {
                    if (h1global.curUIMgr && h1global.curUIMgr.gameroomprepare_ui && !h1global.curUIMgr.gameroomprepare_ui.is_show) {
                        // h1global.curUIMgr.gameroomprepare_ui.show_prepare(0, enterPlayerInfoList, function () {
                        //     for(var i=0; i< self.curGameRoom.playerInfoList.length; i++){
                        //         h1global.curUIMgr.gameroomprepare_ui.update_player_info_panel(i, self.curGameRoom.playerInfoList[i]);
                        //     }
                        // })

                        h1global.curUIMgr.gameroomprepare_ui.show_prepare(0, enterPlayerInfoList, function () {
                            h1global.curUIMgr.gameroomprepare_ui.swap_seat(swap_list);
                        })
                    }
                } else {
                    if (const_val.SHOW_GPSUI) {
                        if (h1global.curUIMgr && h1global.curUIMgr.gps_ui) {
                            h1global.curUIMgr.gps_ui.show_by_start(self, self.curGameRoom);
                        }
                    } else {
                        h1global.curUIMgr.roomLayoutMgr.startGame(function (complete) {
                            if (complete && self.startActions["GameRoomUI"]) {
                                self.startActions["GameRoomUI"]();
                                self.startActions["GameRoomUI"] = undefined;
                            }
                        });
                    }
                }
            }
        }
        if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
            // 如果GameRoomScene已经加载完成
            if (this.startActions["GameRoomScene"]) {
                this.startActions["GameRoomScene"]();
                this.startActions["GameRoomScene"] = undefined;
            } else {
                h1global.curUIMgr.roomLayoutMgr.startGame(function (complete) {
                    if (complete) {
                        if (self.startActions["GameRoomUI"]) {
                            self.startActions["GameRoomUI"]();
                            self.startActions["GameRoomUI"] = undefined;
                        }
                    }
                });
            }
        }

        if (h1global.curUIMgr && h1global.curUIMgr.gameroominfo_ui && h1global.curUIMgr.gameroominfo_ui.is_show) {
            h1global.curUIMgr.gameroominfo_ui.update_round();
        }
        // if (h1global.curUIMgr && h1global.curUIMgr.gameconfig_ui && h1global.curUIMgr.gameconfig_ui.is_show) {
        //     h1global.curUIMgr.gameconfig_ui.update_state();
        // }

        if (h1global.curUIMgr && h1global.curUIMgr.config_ui && h1global.curUIMgr.config_ui.is_show) {
            h1global.curUIMgr.config_ui.update_state();
        }
        // 关闭结算界面
        if (h1global.curUIMgr && h1global.curUIMgr.settlement_ui) {
            h1global.curUIMgr.settlement_ui.hide();
        }
        if (h1global.curUIMgr && h1global.curUIMgr.result_ui) {
            h1global.curUIMgr.result_ui.hide();
        }
    },

    readyForNextRound: function (serverSitNum) {
        if (!this.curGameRoom) {
            return;
        }
        this.curGameRoom.updatePlayerState(serverSitNum, 1);
        this.curGameRoom.playerInfoList[serverSitNum]['role'] = const_val.GAME_ROLE_PLAYER;
        if (!h1global.curUIMgr) {
            return;
        }
        if (h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show) {
            h1global.curUIMgr.gameroomprepare_ui.update_player_state(serverSitNum, 1);
        }
        if (h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
            let index = this.server2CurSitNum(serverSitNum);
            h1global.curUIMgr.roomLayoutMgr.iterUI(function (ui) {
                if (!ui.playResultAnim) {
                    ui.update_player_ready_state(serverSitNum, 1);
                    ui.hide_player_desk_panel(index);
                }
            });
        }
        // if (h1global.curUIMgr.gameconfig_ui && h1global.curUIMgr.gameconfig_ui.is_show) {
        //     if (serverSitNum === this.serverSitNum) {
        //         h1global.curUIMgr.gameconfig_ui.update_state();
        //     }
        // }

        if (h1global.curUIMgr && h1global.curUIMgr.config_ui && h1global.curUIMgr.config_ui.is_show) {
            if (serverSitNum === this.serverSitNum) {
                h1global.curUIMgr.config_ui.update_state();
            }
        }
    },

    postMultiOperation: function (idx_list, aid_list, tile_list) {
        // 用于特殊处理多个人同时胡牌的情况
        if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
            for (var i = 0; i < idx_list.length; i++) {
                // h1global.curUIMgr.roomLayoutMgr.notifyObserver("playOperationEffect", const_val.OP_KONG_WIN, idx_list[i]);
            }
        }
        // if(this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1){
        // 	cc.audioEngine.playEffect("res/sound/voice/male/sound_man_win.mp3");
        // } else {
        // cc.audioEngine.playEffect("res/sound/voice/female/sound_woman_win.mp3");
        // }
    },

    postOperation: function (serverSitNum, aid, data) {
        cc.log("postOperation: ", serverSitNum, aid, data);
        if (!this.curGameRoom) {
            return;
        }
        if (h1global.curUIMgr && h1global.curUIMgr.gameroom3d_ui && h1global.curUIMgr.gameroom3d_ui.is_show &&
            h1global.curUIMgr.gameroom3d_ui.beginAnimPlaying) {
            // 开局动画播放过程中，如果收到操作，则马上停止播放动画
            h1global.curUIMgr.gameroom3d_ui.stopBeginAnim(this.serverSitNum, this.curGameRoom);
            this.startActions["GameRoomUI"] = undefined;
        }
        if (h1global.curUIMgr && h1global.curUIMgr.gameroom2d_ui && h1global.curUIMgr.gameroom2d_ui.is_show &&
            h1global.curUIMgr.gameroom2d_ui.beginAnimPlaying) {
            // 开局动画播放过程中，如果收到操作，则马上停止播放动画
            h1global.curUIMgr.gameroom2d_ui.stopBeginAnim(this.serverSitNum, this.curGameRoom);
            this.startActions["GameRoomUI"] = undefined;
        }

        if (aid === const_val.OP_PASS) {
        } else if (aid === const_val.OP_FIGHT_DEALER) {
            this.curGameRoom.fight_dealer_mul_list[serverSitNum] = data[0];
            h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_dealer_mul_panel", serverSitNum, data[0]);
        } else if (aid === const_val.OP_BET) {
            this.curGameRoom.bet_score_list[serverSitNum] = data[0];
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_bet_score_panel", serverSitNum, data[0], true);
        } else if (aid === const_val.OP_ADD_BET) {
            this.curGameRoom.bet_score_list[serverSitNum] += data[0];
            h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_bet_score_panel", serverSitNum, data[0]);
        } else if (aid === const_val.OP_CMP_WIN) {
            cc.error("not imp OP_CMP_WIN")
        } else if (aid === const_val.OP_EXCHANGE) {
            this.curGameRoom.handTilesList[serverSitNum] = data.slice(0);
            cc.error("not imp OP_EXCHANGE")
        } else if (aid === const_val.OP_SHOW_CARD) {
            this.curGameRoom.confirm_poker_state_list[serverSitNum] = data[const_val.HAND_CARD_NUM];
            if (this.serverSitNum !== serverSitNum) {
                this.curGameRoom.handTilesList[serverSitNum] = data.slice(0, const_val.HAND_CARD_NUM);
                this.curGameRoom.show_state_list[serverSitNum] = 1;
            } else {
                h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_player_computer_panel"); // 服务端倒计时自己操作时需要隐藏自己面板
                h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_player_hand_tiles", serverSitNum);
            }
            h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_desk_tiles", serverSitNum, this.curGameRoom.handTilesList[serverSitNum], false, false, this.serverSitNum, this.curGameRoom);
        } else if (aid === const_val.OP_CONFIRM_DEALER) {
            this.curGameRoom.dealerIdx = serverSitNum;
            h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_dealer_idx", serverSitNum);
            h1global.curUIMgr.roomLayoutMgr.notifyObserver("play_fight_dealer_anim", serverSitNum);
            // h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_hand_tiles", this.serverSitNum, this.curGameRoom.handTilesList[this.serverSitNum], true, this.curGameRoom.game_mode, this.curGameRoom.waitAidList, true);
        }
        // if (this.serverSitNum !== serverSitNum && h1global.curUIMgr.roomLayoutMgr) {
        //     h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_operation_panel");
        // }
    },

    selfPostOperation: function (aid, data) {
        cc.log("selfPostOperation", aid, data);
        // 由于自己打的牌自己不需要经服务器广播给自己，因而只要在doOperation时，自己postOperation给自己
        // 而doOperation和postOperation的参数不同，这里讲doOperation的参数改为postOperation的参数
        if (aid === const_val.OP_PASS) {

        } else if (aid === const_val.OP_SHOW_CARD) {
            let state = data[0];
            data = this.curGameRoom.handTilesList[this.serverSitNum].slice(0);
            data.push(state);
        }
        // 用于转换doOperation到postOperation的参数
        this.postOperation(this.serverSitNum, aid, data);
    },

    doOperation: function (aid, data) {
        cc.log("doOperation: ", aid, data);
        if (!this.curGameRoom) {
            return;
        }
        if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
            h1global.curUIMgr.roomLayoutMgr.notifyObserver("lock_player_hand_tiles");
        }
        // 自己的操作直接本地执行，不需要广播给自己
        this.selfPostOperation(aid, data);
        this.baseCall("doOperation", aid, data);
    },

    doOperationFailed: function (err) {
        cc.log("doOperationFailed: " + err.toString());
    },

    confirmOperation: function (aid, data) {
        cc.log("confirmOperation: ", aid, data);
        let curGameRoom = this.curGameRoom;
        if (!curGameRoom) {
            return;
        }
        let index = curGameRoom.waitAidList.indexOf(aid);
        if (index >= 0) {
            curGameRoom.waitAidList.splice(index, 1);
            curGameRoom.waitDataList.splice(index, 1);
            h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_operation_panel", this.getWaitOpDict(curGameRoom.waitAidList, curGameRoom.waitDataList, this.serverSitNum), const_val.SHOW_CONFIRM_OP)
        } else {
            cc.warn("confirmOperation invalid aid", curGameRoom.waitAidList);
            return;
        }
        // if (h1global.curUIMgr.isShow && h1global.curUIMgr.isShow()) {
        //     h1global.curUIMgr.roomLayoutMgr.notifyObserver(const_val.GAME_ROOM_UI_NAME, "lock_player_hand_tiles");
        // }
        // 自己的操作直接本地执行，不需要广播给自己
        this.selfPostOperation(aid, data);
        this.baseCall("confirmOperation", aid, data);
    },

    showWaitOperationTime: function () {
        if (onhookMgr && this.curGameRoom && this.curGameRoom.op_seconds > 0) {
            cc.log('showWaitOperationTime setWaitLeftTime=== > ', this.curGameRoom.op_seconds);
            onhookMgr.setWaitLeftTime(this.curGameRoom.op_seconds)
        } else if (onhookMgr && const_val.FAKE_COUNTDOWN > 0) {
            onhookMgr.setWaitLeftTime(const_val.FAKE_COUNTDOWN);
        }
    },

    waitForOperation: function (aid_list, data_list) {
        cc.log("waitForOperation", aid_list, data_list);
        if (!this.curGameRoom) {
            return;
        }
        this.curGameRoom.waitAidList = aid_list;
        this.curGameRoom.waitDataList = data_list;
        if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
            h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_operation_panel", this.getWaitOpDict(aid_list, data_list), const_val.SHOW_CONFIRM_OP);
            if (aid_list.indexOf(const_val.OP_SHOW_CARD) >= 0) {
                h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_hand_tiles", this.serverSitNum, this.curGameRoom.handTilesList[this.serverSitNum],
                    true, this.curGameRoom.game_mode, aid_list, this.curGameRoom.game_mode === const_val.GAME_MODE_SEEN_DEALER);
            }
        }
    },

    roundResult: function (roundRoomInfo) {
        if (!this.curGameRoom) {
            return;
        }
        cc.log("roundResult");
        cc.log(roundRoomInfo);
        this.curGameRoom.endGame();
        if (onhookMgr) {
            onhookMgr.setWaitLeftTime(null);
        }
        var playerInfoList = roundRoomInfo["player_info_list"];
        for (var i = 0; i < playerInfoList.length; i++) {
            let idx = playerInfoList[i]['idx'];
            this.curGameRoom.playerInfoList[idx]["score"] = playerInfoList[i]["score"];
            this.curGameRoom.playerInfoList[idx]["total_score"] = playerInfoList[i]["total_score"];
        }
        var self = this;

        // Note: 此处只在回放上
        var replay_func = undefined;
        if (self.runMode === const_val.GAME_ROOM_PLAYBACK_MODE) {
            replay_func = arguments[1];
        }

        let player = h1global.entityManager.player();
        var curGameRoom = player.curGameRoom;
        var serverSitNum = player.serverSitNum;

        function callbackfunc() {
            if (h1global.curUIMgr.settlement_ui) {
                if (self.runMode === const_val.GAME_ROOM_PLAYBACK_MODE) {
                    h1global.curUIMgr.settlement_ui.show_by_info(roundRoomInfo, serverSitNum, curGameRoom, undefined, replay_func);
                } else {
                    h1global.curUIMgr.settlement_ui.show_by_info(roundRoomInfo, serverSitNum, curGameRoom);
                }
            }
        }

		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
			if (h1global.curUIMgr.roomLayoutMgr.isShow()) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_all_player_score", playerInfoList);
				h1global.curUIMgr.roomLayoutMgr.notifyObserverWithCallback("play_result_anim", callbackfunc, playerInfoList, roundRoomInfo['result_list'], curGameRoom, serverSitNum);
			} else {
				h1global.curUIMgr.roomLayoutMgr.registerShowObserver(function () {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_player_hand_tiles", self.serverSitNum);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_all_player_score", playerInfoList);
					h1global.curUIMgr.roomLayoutMgr.notifyObserverWithCallback("play_result_anim", callbackfunc, playerInfoList, roundRoomInfo['result_list'], curGameRoom, serverSitNum);
				})
			}
		} else {
			callbackfunc();
		}
    },

    resetRoom: function (roomInfo) {
        this.runMode = const_val.GAME_ROOM_GAME_MODE;
        this.curGameRoom = new GameRoomEntity(roomInfo['player_num']);
        this.curGameRoom.updateRoomData(roomInfo);
        // Note: 续房的时候房主退出房间的标记， 为了在房主退出时给其他玩家提示
        this.curGameRoom.canContinue = true;
        this.curGameRoom.playerStateList = roomInfo["player_state_list"];
        cutil.clearEnterRoom();
    },

    finalResult: function (finalPlayerInfoList, roundRoomInfo, continueRoomInfo) {
        cc.log("finalResult", continueRoomInfo);
        cc.log(finalPlayerInfoList);
        if (!this.curGameRoom) {
            return;
        }
        if (onhookMgr) {
            onhookMgr.setWaitLeftTime(null);
        }
        // Note: 为了断线重连后继续停留在总结算上，此处设置一个标志位作为判断
        if (h1global.curUIMgr && h1global.curUIMgr.result_ui) {
            h1global.curUIMgr.result_ui.finalResultFlag = true;
        }

        let curGameRoom = this.curGameRoom;
        let serverSitNum = this.serverSitNum;
        let canContinue = continueRoomInfo['continue_list'][serverSitNum] === const_val.ROOM_CONTINUE;

        var self = this;

        function callbackfunc(complete) {
            if (complete && h1global.curUIMgr.result_ui) {
                if (h1global.curUIMgr.result_ui) {
                    h1global.curUIMgr.result_ui.show_by_info(finalPlayerInfoList, curGameRoom, serverSitNum, canContinue);
                }
                // h1global.curUIMgr.settlement_ui.show_by_info(roundRoomInfo, serverSitNum, curGameRoom, function () {
                //
                // });
            }
            // Note: 此时的GameRoom已经是新创建的 更新游戏场不在房间的头像
            let newGameRoom = self.curGameRoom;
            if (h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
                for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
                    h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_info_panel", i, newGameRoom.playerInfoList[i])
                }
            }
        }

        if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
			if (h1global.curUIMgr.roomLayoutMgr.isShow()) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_all_player_score", roundRoomInfo["player_info_list"]);
				h1global.curUIMgr.roomLayoutMgr.notifyObserverWithCallback("play_result_anim", callbackfunc, roundRoomInfo["player_info_list"], roundRoomInfo['result_list'], curGameRoom, serverSitNum);
			} else {
				h1global.curUIMgr.roomLayoutMgr.registerShowObserver(function () {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_all_player_score", roundRoomInfo["player_info_list"]);
					h1global.curUIMgr.roomLayoutMgr.notifyObserverWithCallback("play_result_anim", callbackfunc, roundRoomInfo["player_info_list"], roundRoomInfo['result_list'], curGameRoom, serverSitNum);
				})
			}
		} else {
			callbackfunc();
		}

        if (canContinue) {
            let initRoomInfo = continueRoomInfo['init_info'];
            this.resetRoom(initRoomInfo);
        }
    },

    subtotalResult: function (finalPlayerInfoList) {
        if (!this.curGameRoom) {
            return;
        }
        if (onhookMgr) {
            onhookMgr.setApplyCloseLeftTime(null);
        }

        if (h1global.curUIMgr && h1global.curUIMgr.applyclose_ui && h1global.curUIMgr.applyclose_ui.is_show) {
            h1global.curUIMgr.applyclose_ui.hide();
            onhookMgr.applyCloseLeftTime = 0;
        }
        if (h1global.curUIMgr && h1global.curUIMgr.settlement_ui && h1global.curUIMgr.settlement_ui.is_show) {
            h1global.curUIMgr.settlement_ui.hide()
        }
        // Note: 为了断线重连后继续停留在总结算上，此处设置一个标志位作为判断
        if (h1global.curUIMgr && h1global.curUIMgr.result_ui) {
            h1global.curUIMgr.result_ui.finalResultFlag = true;
        }
        var curGameRoom = this.curGameRoom;
        let serverSitNum = this.serverSitNum;
        if (h1global.curUIMgr && h1global.curUIMgr.result_ui) {
            h1global.curUIMgr.result_ui.show_by_info(finalPlayerInfoList, curGameRoom, serverSitNum, false);
        }
    },

    prepare: function () {
        if (!this.curGameRoom) {
            return;
        }
        this.baseCall("prepare");
    },

	updateRoomController: function (oldIdx, newIdx) {
		cc.log("updateRoomController", oldIdx, newIdx);
		if (this.curGameRoom) {
			this.curGameRoom.room_controller = newIdx;
		}
		if (!h1global.curUIMgr) {
			return;
		}
		if (h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show) {
			if (newIdx === this.serverSitNum) {
				h1global.curUIMgr.gameroomprepare_ui.updateRoomController();
			}
		}
		if (h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_ready_state", newIdx, 0);
		}
	},

    notifyPlayerOnlineStatus: function (serverSitNum, status) {
        if (!this.curGameRoom) {
            return;
        }
        this.curGameRoom.updatePlayerOnlineState(serverSitNum, status);
        if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
            h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_online_state", serverSitNum, status);
        }
    },
});
