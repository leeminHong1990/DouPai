"use strict";

var GameRoomEntity = KBEngine.Entity.extend({
    ctor: function (player_num) {

        this._super();
        this.roomID = undefined;
        this.curRound = 0;

        this.game_round = 8;
        this.ownerId = undefined;
        this.dealerIdx = -1;
		this.room_type = undefined;
        this.player_num = player_num || 6;
        this.pay_mode = 0;
        this.game_mode = 0;
        this.game_max_lose = 999999;
        this.base_score = 0;
        this.hand_prepare = 1;
		this.club_id = 0;

        this.playerInfoList = [null, null, null, null, null, null];
        this.playerDistanceList = [[-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1]];
        this.playerStateList = [0, 0, 0, 0, 0, 0];
        this.handTilesList = [[], [], [], [], [], []];

        this.fight_dealer_mul_list = [-1, -1, -1, -1, -1, -1];
        this.bet_score_list = [0, 0, 0, 0, 0, 0];
        this.room_state = const_val.ROOM_WAITING;
        this.confirm_poker_state_list = [0, 0, 0, 0, 0, 0];
        this.show_state_list = [0, 0, 0, 0, 0, 0];
        this.expand_cards = [];
        this.rulesList = []; //判断牌型的算法
        this.applyCloseLeftTime = 0;
        this.applyCloseFrom = 0;
        this.applyCloseStateList = [0, 0, 0, 0, 0, 0];
        this.waitAidList = []; // 玩家操作列表，[]表示没有玩家操作
        this.waitDataList = [];// 表示等待操作的需要数据
        this.msgList = [];		//所有的聊天记录
		this.room_controller = -1;
        KBEngine.DEBUG_MSG("Create GameRoomEntity")
    },

    reconnectRoomData: function (recRoomInfo) {
        cc.log("reconnectRoomData", recRoomInfo);
        this.room_state = recRoomInfo["room_state"];
        this.playerStateList = recRoomInfo["player_state_list"];
        this.bet_score_list = recRoomInfo["bet_score_list"];
        this.fight_dealer_mul_list = recRoomInfo["fight_dealer_mul_list"];
        this.confirm_poker_state_list = recRoomInfo["confirm_poker_state_list"];

        for (var i = 0; i < recRoomInfo["player_advance_info_list"].length; i++) {

            var curPlayerInfo = recRoomInfo["player_advance_info_list"][i];
            let idx = curPlayerInfo['idx']
            this.handTilesList[idx] = curPlayerInfo["tiles"];
            this.show_state_list[idx] = curPlayerInfo["show_state"];
            // for (var j = 0; j < curPlayerInfo["op_list"].length; j++) {
            //     var op_info = curPlayerInfo["op_list"][j]; //[opId, [tile]]
            // }
        }

        this.applyCloseLeftTime = recRoomInfo["applyCloseLeftTime"];
        this.applyCloseFrom = recRoomInfo["applyCloseFrom"];
        this.applyCloseStateList = recRoomInfo["applyCloseStateList"];
        if (onhookMgr && this.applyCloseLeftTime > 0) {
            onhookMgr.setApplyCloseLeftTime(this.applyCloseLeftTime);
        }
        this.waitAidList = recRoomInfo["waitAidList"];
        this.waitDataList = recRoomInfo["waitDataList"];
        this.updateRoomData(recRoomInfo["init_info"]);
        for (var i = 0; i < recRoomInfo["player_advance_info_list"].length; i++) {
            var curPlayerInfo = recRoomInfo["player_advance_info_list"][i];
            let idx = curPlayerInfo['idx'];
            this.playerInfoList[idx]["score"] = curPlayerInfo["score"];
            this.playerInfoList[idx]["total_score"] = curPlayerInfo["total_score"];
            this.playerInfoList[idx]["role"] = curPlayerInfo["role"];
        }

        if (onhookMgr && this.op_seconds > 0) {
            onhookMgr.setWaitLeftTime(recRoomInfo["waitTimeLeft"])
        } else if (onhookMgr && const_val.FAKE_COUNTDOWN > 0) {
            onhookMgr.setWaitLeftTime(const_val.FAKE_COUNTDOWN);
        }
    },

    updateRoomData: function (roomInfo) {
        cc.log('updateRoomData:', roomInfo);
        this.roomID = roomInfo["roomID"];
        this.ownerId = roomInfo["ownerId"];
        this.dealerIdx = roomInfo["dealerIdx"];
        this.curRound = roomInfo["curRound"];
        this.game_round = roomInfo["game_round"];
        this.player_num = roomInfo["player_num"];
        this.pay_mode = roomInfo["pay_mode"];
        this.game_mode = roomInfo["game_mode"];
  		this.room_type = roomInfo["room_type"];
        this.hand_prepare = roomInfo["hand_prepare"];
        this.club_id = roomInfo["club_id"];
        this.expand_cards = roomInfo["expand_cards"];
        this.game_max_lose = roomInfo["game_max_lose"];
        this.base_score = roomInfo["base_score"];
        this.room_state = roomInfo["room_state"];
        this.op_seconds = roomInfo["op_seconds"];
		this.room_controller = roomInfo["room_controller"];
        for (var i = 0; i < roomInfo["player_base_info_list"].length; i++) {
            this.updatePlayerInfo(roomInfo["player_base_info_list"][i]["idx"], roomInfo["player_base_info_list"][i]);
        }
        this.updateDistanceList();
        this.updateRules();
        this.addMenuShareAppMsg()
    },

    updateRules: function () {
        this.rulesList = [];
        let types = this.expand_cards.slice(0);

        types.sort(function (a, b) {
            return b - a;
        });

        for (var i = 0; i < types.length; i++) {
            this.rulesList.push(rules.POKER_TYPE_DICT[types[i]])
        }
        if (this.rulesList.length === 0) {
            this.rulesList.push(rules.is_ten);
        }
    },

    updatePlayerInfo: function (serverSitNum, playerInfo) {
        this.playerInfoList[serverSitNum] = playerInfo;
        if (this.playerInfoList[serverSitNum]['role'] === undefined) {
            if (this.room_controller === serverSitNum) {
                this.playerInfoList[serverSitNum]["role"] = const_val.GAME_ROLE_PLAYER;
            } else {
                this.playerInfoList[serverSitNum]["role"] = const_val.GAME_ROLE_VIEWER;
            }
        }
    },

    updatePlayerState: function (serverSitNum, state) {
        this.playerStateList[serverSitNum] = state;
    },

    updatePlayerOnlineState: function (serverSitNum, state) {
        this.playerInfoList[serverSitNum]["online"] = state;
    },

    updateDistanceList: function () {
        for (var i = 0; i < this.playerInfoList.length; i++) {
            for (var j = 0; j < this.playerInfoList.length; j++) {
                if (i === j) {
                    this.playerDistanceList[i][j] = -1;
                    continue;
                }
                if (this.playerInfoList[i] && this.playerInfoList[j]) {
                    var distance = cutil.calc_distance(parseFloat(this.playerInfoList[i]["lat"]), parseFloat(this.playerInfoList[i]["lng"]), parseFloat(this.playerInfoList[j]["lat"]), parseFloat(this.playerInfoList[j]["lng"]));
                    this.playerDistanceList[i][j] = (distance || distance == 0 ? distance : -1);
                } else {
                    this.playerDistanceList[i][j] = -1;
                }
            }
        }
    },

    getPlayingPlayerNum: function (includeViewer) {
        return this.getPlayingPlayer(includeViewer).length;
    },

    getPlayingPlayer: function (includeViewer) {
        includeViewer = includeViewer || false;
        let out = [];
        for (var i = 0; i < this.playerInfoList.length; i++) {
            let info = this.playerInfoList[i];
            if (info && (includeViewer || info.role === const_val.GAME_ROLE_PLAYER)) {
                out.push(info)
            }
        }
        return out;
    },

	getRoomCreateDict:function () {
  		return {
  			"room_type"			: this.room_type,
  			"game_mode" 		: this.game_mode,
            "game_round" 		: this.game_round,
			"op_seconds" 		: this.op_seconds,
			"expand_cards" 	    : this.expand_cards,
			"pay_mode"			: this.pay_mode
		};
    },

    startGame: function () {
        this.curRound = this.curRound + 1;
        this.room_state = const_val.ROOM_PLAYING;
        this.handTilesList = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]];
        this.show_state_list = [0, 0, 0, 0, 0, 0];
        this.waitAidList = [];
        this.waitDataList = [];
        this.bet_score_list = [0, 0, 0, 0, 0, 0];
        this.confirm_poker_state_list = [0, 0, 0, 0, 0, 0];
        this.fight_dealer_mul_list = [-1, -1, -1, -1, -1, -1];
    },

    swap_seat: function (swap_list) {
        if (true) {
            return;
        }
        if (!swap_list) {
            return;
        }
        var tempPlayerInfoList = [];
        var tempPlayerDistanceList = [];
        for (var i = 0; i < swap_list.length; i++) {
            tempPlayerInfoList[i] = this.playerInfoList[swap_list[i]];
            tempPlayerInfoList[i].idx = i;
            tempPlayerDistanceList[i] = this.playerDistanceList[swap_list[i]];
        }
        cc.log(tempPlayerInfoList);
        this.playerInfoList = tempPlayerInfoList;
		this.playerDistanceList = tempPlayerDistanceList;
    },

    endGame: function () {
        // 重新开始准备
        this.room_state = const_val.ROOM_WAITING;
        this.playerStateList = [0, 0, 0, 0, 0, 0];
        this.waitAidList = [];
        this.waitDataList = [];
    },

    addMenuShareAppMsg: function () {
        var self = this;
        if (!((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) || switches.TEST_OPTION) {
            var share_title = ' 房间号【' + self.roomID.toString() + '】，成功邀请一位好友赠送两张房卡！';
            var share_list = [];
            share_list.push('一吊冲');
            share_list.push(self.game_round + '局');
            share_list.push('白板财神');
            share_list.push('四人');
            cutil.share_func(share_title, share_list.join(","));
        }
    },
});