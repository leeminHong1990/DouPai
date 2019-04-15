"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var impRoomOperation = impGameRules.extend({
    __init__: function () {
        this._super();
        this.curGameRoom = undefined;
        KBEngine.DEBUG_MSG("Create impRoomOperation");
    },

	createRoom : function(roomParams) {
		cc.log("createRoom:", roomParams);
		this.baseCall("createRoom", roomParams);
	},

    createRoomSucceed: function (roomInfo) {
        cc.log("createRoomSucceed!");
        this.runMode = const_val.GAME_ROOM_GAME_MODE;
        this.curGameRoom = new GameRoomEntity(roomInfo['player_num']);
        this.curGameRoom.updateRoomData(roomInfo);
        this.serverSitNum = 0;
        if(roomInfo["room_type"] == const_val.AGENT_ROOM){
            this.serverSitNum = -1;
        } else if (this.curGameRoom.hand_prepare == 1) {//不需要手动准备
            this.curGameRoom.updatePlayerState(this.serverSitNum, 1);
        }
        h1global.runScene(new GameRoomScene());
    },

    createRoomFailed: function (err) {
        cc.log("createRoomFailed!", err);
        switch (err) {
            case const_val.CREATE_FAILED_NO_ENOUGH_CARDS:
                h1global.globalUIMgr.info_ui.show_by_info("房卡不足!", cc.size(300, 200));
                break;
            case const_val.CREATE_FAILED_ALREADY_IN_ROOM:
                h1global.globalUIMgr.info_ui.show_by_info("已经在房间中!", cc.size(300, 200));
                break;
            case const_val.CREATE_FAILED_AGENT_ROOM_LIMIT:
                h1global.globalUIMgr.info_ui.show_by_info("代开房间数量达到上限!", cc.size(300, 200));
                break;
            case const_val.CREATE_FAILED_PERMISSION_DENIED:
                h1global.globalUIMgr.info_ui.show_by_info("不是代理，无法代开房!", cc.size(300, 200));
                break;
            // case const_val.CREATE_FAILED_NET_SERVER_ERROR:
            //     h1global.globalUIMgr.info_ui.show_by_info("服务器错误!", cc.size(300, 200));
            //     break;
            default:
                h1global.globalUIMgr.info_ui.show_by_info("创建房间失败!", cc.size(300, 200));
                break;
        }
    },

    getPlayingRoomInfo: function () {
        this.baseCall("getPlayingRoomInfo");
    },

    getCompleteRoomInfo: function () {
        this.baseCall("getCompleteRoomInfo");
    },

    // s2c
    createAgentRoomSucceed: function (playingRoomList) {
        cutil.unlock_ui();
        var agentRoomUI = h1global.curUIMgr.createagentroom_ui;
        if (agentRoomUI && agentRoomUI.is_show) {
            agentRoomUI.updatePlayingRoom(playingRoomList);
        }
    },

    // s2c
    gotPlayingRoomInfo: function (playingRoomList) {
        var agentRoomUI = h1global.curUIMgr.createagentroom_ui;
        if (agentRoomUI && agentRoomUI.is_show) {
            agentRoomUI.updatePlayingRoom(playingRoomList);
        }
    },

    // s2c
    gotCompleteRoomInfo: function (completeRoomList) {
        var agentRoomUI = h1global.curUIMgr.createagentroom_ui;
        if (agentRoomUI && agentRoomUI.is_show) {
            agentRoomUI.updateCompleteRoom(completeRoomList);
        }
    },

    agentDismissRoom: function (room_id) {
        this.baseCall("agentDismissRoom", room_id)
    },

    server2CurSitNum: function (serverSitNum) {
        if (this.curGameRoom) {
            return (serverSitNum - this.serverSitNum + const_val.MAX_PLAYER_NUM) % const_val.MAX_PLAYER_NUM;
        } else {
            return -1;
        }
    },

    enterRoom: function (roomId) {
        this.baseCall("enterRoom", roomId);
    },

    enterRoomSucceed: function (serverSitNum, roomInfo) {
        cc.log("enterRoomSucceed!", roomInfo)
        this.runMode = const_val.GAME_ROOM_GAME_MODE;
        this.curGameRoom = new GameRoomEntity(roomInfo['player_num']);
        this.curGameRoom.updateRoomData(roomInfo);

        this.serverSitNum = serverSitNum;
        this.curGameRoom.playerStateList = roomInfo["player_state_list"];
        if (cc.director.getRunningScene().className == "GameRoomScene") {
            h1global.runScene(new GameRoomScene());
            cutil.unlock_ui();
        } else {
            h1global.runScene(new GameRoomScene());
        }
        cutil.clearEnterRoom();
    },

    enterRoomFailed: function (err) {
        cc.log("enterRoomFailed!");
		if(err === const_val.ENTER_FAILED_ROOM_NO_EXIST || err === const_val.ENTER_FAILED_ROOM_DESTROYED){
            h1global.globalUIMgr.info_ui.show_by_info("房间不存在！", cc.size(300, 200));
		} else if(err === const_val.ENTER_FAILED_ROOM_FULL){
            h1global.globalUIMgr.info_ui.show_by_info("房间人数已满！", cc.size(300, 200));
        } else if (err === const_val.ENTER_FAILED_ROOM_DIAMOND_NOT_ENOUGH) {
            h1global.globalUIMgr.info_ui.show_by_info("该房间为AA制付费房间，您的房卡不足！", cc.size(300, 200));
        }
        else if(err === const_val.ENTER_FAILED_NOT_CLUB_MEMBER){
            h1global.globalUIMgr.info_ui.show_by_info("您不是该茶楼成员！", cc.size(300, 200));
        }
         else if (err === const_val.ENTER_FAILED_ROOM_STARTING) {
            h1global.globalUIMgr.info_ui.show_by_info("该房间正在游戏中！", cc.size(300, 200));
        }
        if (h1global.curUIMgr && h1global.curUIMgr.joinroom_ui && h1global.curUIMgr.joinroom_ui.is_show) {
        	h1global.curUIMgr.joinroom_ui.clear_click_num();
        }
        cutil.clearEnterRoom();
    },

    quitRoom: function () {
        if (!this.curGameRoom) {
            return;
        }
        this.baseCall("quitRoom");
    },

	quitRoomSucceed: function () {
		let canContinue = false;
		let isRoomController = false;
		if (this.curGameRoom && this.curGameRoom.curRound === 0) {
			isRoomController = this.curGameRoom.room_controller === this.serverSitNum;
			canContinue = this.curGameRoom.canContinue === true;
		}
        let fromData = null;
		if (this.club_id) {
			fromData = {'from_scene': 'GameHallScene', 'club_id': this.club_id};
			this.club_id = null;
		}else if(this.curGameRoom){
			fromData = {'from_scene': 'GameHallScene', 'club_id': this.curGameRoom.club_id};
		}
		this.curGameRoom = null;
		if (onhookMgr) {
			onhookMgr.setApplyCloseLeftTime(null);
			onhookMgr.setWaitLeftTime(null);
		}
		if (canContinue) {
			if (h1global.curUIMgr && h1global.curUIMgr.result_ui && h1global.curUIMgr.result_ui.is_show) {
				if (isRoomController !== true) {
					h1global.curUIMgr.result_ui.update_when_creator_quit();
				}
			} else {
				h1global.runScene(new GameHallScene(fromData));
			}
		} else {
			h1global.runScene(new GameHallScene(fromData));
		}
	},

    quitRoomFailed: function (err) {
        cc.log("quitRoomFailed!");
    },

    othersQuitRoom: function (serverSitNum) {
        if (this.curGameRoom) {
            this.curGameRoom.playerInfoList[serverSitNum] = null;
            if (h1global.curUIMgr && h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show) {
                h1global.curUIMgr.gameroomprepare_ui.update_player_info_panel(serverSitNum, this.curGameRoom.playerInfoList[serverSitNum]);
                h1global.curUIMgr.gameroomprepare_ui.update_location();
            }
            if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
                h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_info_panel", serverSitNum, null);
            }
        }
    },

    othersEnterRoom: function (playerInfo) {
        cc.log("othersEnterRoom");
        cc.log(playerInfo);
        this.curGameRoom.updatePlayerInfo(playerInfo["idx"], playerInfo);
        this.curGameRoom.updatePlayerState(playerInfo["idx"], this.curGameRoom.hand_prepare);
        if (h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show) {
            h1global.curUIMgr.gameroomprepare_ui.update_player_info_panel(playerInfo["idx"], playerInfo);
            h1global.curUIMgr.gameroomprepare_ui.update_location();
            h1global.curUIMgr.gameroomprepare_ui.update_player_state(playerInfo["idx"], this.curGameRoom.hand_prepare);
        }

        if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
            h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_info_panel", playerInfo['idx'], playerInfo);
            h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_ready_state", playerInfo['idx'], this.curGameRoom.hand_prepare);
        }

        this.curGameRoom.updateDistanceList();
    },

    upLocationInfo: function () {
        cc.log("upLocationInfo");
        var location = cutil.get_location_geo() || "";
        var lat = cutil.get_location_lat() || "";
        var lng = cutil.get_location_lng() || "";
        this.baseCall("upLocationInfo", location, lat, lng);
    },

    handleReconnect: function (recRoomInfo) {
        this.upLocationInfo();
        this.runMode = const_val.GAME_ROOM_GAME_MODE;
        this.curGameRoom = new GameRoomEntity(recRoomInfo['init_info']['player_num']);
        this.curGameRoom.reconnectRoomData(recRoomInfo);
        var player_base_info_list = recRoomInfo["init_info"]["player_base_info_list"];
		for (var i = 0; i < player_base_info_list.length; i++) {
			if (player_base_info_list[i]["userId"] === this.userId) {
				this.serverSitNum = player_base_info_list[i]['idx'];
				break;
			}
		}
        this.curGameRoom.handTilesList[this.serverSitNum].sort(rules.poker_compare);
        h1global.runScene(new GameRoomScene());
    },

    applyDismissRoom: function () {
        if (this.curGameRoom) {
            this.baseCall("applyDismissRoom");
            this.curGameRoom.applyCloseLeftTime = const_val.DISMISS_ROOM_WAIT_TIME + 1; // 本地操作先于服务端，所以增加1s防止网络延迟
            this.curGameRoom.applyCloseFrom = this.serverSitNum;
            this.curGameRoom.applyCloseStateList[this.serverSitNum] = 1;
            h1global.curUIMgr.applyclose_ui.show_by_sitnum(this.serverSitNum);
            onhookMgr.setApplyCloseLeftTime(const_val.DISMISS_ROOM_WAIT_TIME + 1); // 本地操作先于服务端，所以增加1s防止网络延迟
        }
    },

    reqDismissRoom: function (serverSitNum) {
        if (this.curGameRoom) {
            this.curGameRoom.applyCloseLeftTime = const_val.DISMISS_ROOM_WAIT_TIME;
            this.curGameRoom.applyCloseFrom = serverSitNum
            this.curGameRoom.applyCloseStateList = [0, 0, 0, 0, 0, 0];
            this.curGameRoom.applyCloseStateList[serverSitNum] = 1;
            h1global.curUIMgr.applyclose_ui.show_by_sitnum(serverSitNum);
            onhookMgr.setApplyCloseLeftTime(const_val.DISMISS_ROOM_WAIT_TIME);
        }
    },

    voteDismissRoom: function (vote) {
        // cc.log("voteDismissRoom")
        this.baseCall("voteDismissRoom", vote);
    },

    voteDismissResult: function (serverSitNum, vote) {
        // cc.log("voteDismissResult")
        if (this.curGameRoom) {
            this.curGameRoom.applyCloseStateList[serverSitNum] = vote;
            var vote_agree_num = 0;
            var vote_disagree_num = 0;
            for (var i = 0; i < this.curGameRoom.playerInfoList.length; i++) {
                if (this.curGameRoom.applyCloseStateList[i] == 1) {
                    vote_agree_num = vote_agree_num + 1;
                } else if (this.curGameRoom.applyCloseStateList[i] == 2) {
                    vote_disagree_num = vote_disagree_num + 1;
                }
            }
            // if(vote_agree_num >= 3){

            // }

            let playingNum = this.curGameRoom.getPlayingPlayerNum();
            if ((playingNum > 2 && playingNum - vote_agree_num <= 1 && playingNum > 2) || (vote_agree_num === 2 && playingNum === 2)) {
                this.quitRoom();
            } else if (vote_disagree_num >= 2 || (playingNum <= 3 && vote_disagree_num >= 1)) {
                if (h1global.curUIMgr.applyclose_ui && h1global.curUIMgr.applyclose_ui.is_show) {
                    h1global.curUIMgr.applyclose_ui.hide();
                    onhookMgr.applyCloseLeftTime = 0;
                    for (var i = 0; i < this.curGameRoom.playerInfoList.length; i++) {
                        this.curGameRoom.applyCloseStateList[i] = 0;
                    }
                }
            }
            if (h1global.curUIMgr.applyclose_ui && h1global.curUIMgr.applyclose_ui.is_show) {
                h1global.curUIMgr.applyclose_ui.update_vote_state();
            }
        }
    },
});
