// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
"use strict"
var CreateRoomSnippet = UISnippet.extend({
    initUI: function () {
        var self = this;
		this.room_type = undefined;
        this.initCreateInfo();

        this.createroom_panel = this.rootUINode.getChildByName("createroom_panel");
        this.gamename_panel = this.createroom_panel.getChildByName("gamename_panel");

        this.updateCardDiamond();

        var group_parent_panel_list = [
            this.gamename_panel.getChildByName("round_panel"),
            this.gamename_panel.getChildByName("game_mode_panel"),
            this.gamename_panel.getChildByName("pay_panel"),
        ];
        var group_chx_list = ["round_chx", "game_mode_chx", "pay_mode_chx"];
        var group_label_list = ["round_num_label_", "game_mode_label_", "pay_mode_label_"];
        var group_chx_num_list = [2, 5, 2];
        var group_chx_func_list = [
            function (i) {
                self.game_round = 10 * (i + 1);
                self.updateCardDiamond();
            },
            function (i) {
                self.game_mode = i;
            },
            function (i) {
				if (self.room_type === const_val.CLUB_ROOM) {
					self.pay_mode = i === 0 ? const_val.CLUB_PAY_MODE : const_val.AA_PAY_MODE;
				} else if (self.room_type === const_val.AGENT_ROOM) {
					self.pay_mode = i === 0 ? const_val.AGENT_PAY_MODE : const_val.AA_PAY_MODE;
				} else {
					self.pay_mode = i === 0 ? const_val.NORMAL_PAY_MODE : const_val.AA_PAY_MODE;
				}
                self.updateCardDiamond();
            },
        ];
        var group_select_list = [
            self.game_round / 10 - 1,
            self.game_mode,
			self.pay_mode,
        ];
        var start_index_list = [1, 0, 1, 1];
        this.update_check_box_group_panel(group_parent_panel_list, group_chx_list, group_chx_num_list, group_chx_func_list, group_select_list, group_label_list, start_index_list);

        var single_parent_panel_list = [
            this.gamename_panel.getChildByName("prepare_panel"),
            this.gamename_panel.getChildByName("expand_cards_panel"),
            this.gamename_panel.getChildByName("second_panel"),
        ];
        var single_chx_list = ["prepare_chx", "expand_cards_chx", "second_chx"];
        var single_label_list = ["prepare_label", "expand_cards_label_1", "second_label_1"];
        var single_chx_func_list = [
            function (is_select) {
                self.hand_prepare = is_select ? 0 : 1;
            },
            function (is_select) {
                self.expand_cards = is_select ? 0 : 1;
            },
            function (is_select) {
                self.op_seconds = is_select ? 1 : 0;
            }
        ];
        var single_select_list = [
            self.hand_prepare ? 0 : 1,
            self.expand_cards ? 0 : 1,
            self.op_seconds > 0 ? 1 : 0,
        ];
        this.update_check_box_single_panel(single_parent_panel_list, single_chx_list, single_chx_func_list, single_select_list, single_label_list);
        this.update_mode_option();
    },

    initCreateInfo: function () {
        var default_info_json = '{"game_round":10, "pay_mode":0, "game_mode": 3 ,"hand_prepare":0 ,"op_seconds":1 ,"expand_cards":0}';
        var info_json = cc.sys.localStorage.getItem(const_val.GAME_NAME + "_CREATE_INFO_JSON");
        if (!info_json) {
            cc.sys.localStorage.setItem(const_val.GAME_NAME + "_CREATE_INFO_JSON", default_info_json);
            info_json = cc.sys.localStorage.getItem(const_val.GAME_NAME + "_CREATE_INFO_JSON");
        }
        var info_dict = eval("(" + info_json + ")");

        this.game_round = info_dict["game_round"] || 10; 				    // 局数 10局、20局
        this.pay_mode = info_dict["pay_mode"] || 0;					    //付费方式，0代表房主支付，1代表AA支付
        this.hand_prepare = info_dict["hand_prepare"] || 0;				// 0代表需要手动准备，1代表不需要手动准备，因为在玩家的state中0代表没有准备,1代表已经准备
        this.game_mode = info_dict["game_mode"];                    // 坐庄模式对应const的定义值
        this.expand_cards = info_dict["expand_cards"] || 0;               // 0 代表有特殊牌型 1 代表没有特殊牌型
        this.op_seconds = info_dict["op_seconds"] || 0;
		switch (this.room_type) {
			case const_val.CLUB_ROOM:
				if (info_dict['pay_mode'] === const_val.AA_PAY_MODE) {
					this.pay_mode = const_val.AA_PAY_MODE;
				} else {
					this.pay_mode = const_val.CLUB_PAY_MODE;
				}
				break;
			case const_val.AGENT_ROOM:
				if (info_dict['pay_mode'] === const_val.AA_PAY_MODE) {
					this.pay_mode = const_val.AA_PAY_MODE;
				} else {
					this.pay_mode = const_val.AGENT_PAY_MODE;
				}
				break;
			default:
				if (info_dict['pay_mode'] === const_val.AA_PAY_MODE) {
					this.pay_mode = const_val.AA_PAY_MODE;
				} else {
					this.pay_mode = const_val.NORMAL_PAY_MODE;
				}
		}
    },

    setCreateInfo: function () {
        var attribute_list = [];
        attribute_list.push('"game_round":' + this.game_round.toString());
        attribute_list.push('"pay_mode":' + this.pay_mode.toString());
        attribute_list.push('"hand_prepare":' + this.hand_prepare.toString());
        attribute_list.push('"game_mode":' + this.game_mode.toString());
        attribute_list.push('"op_seconds":' + this.op_seconds.toString());
        attribute_list.push('"expand_cards":' + this.expand_cards.toString());
        var json_str = "{" + attribute_list.join(",") + "}";
        cc.sys.localStorage.setItem(const_val.GAME_NAME + "_CREATE_INFO_JSON", json_str);
    },

    //参数分别是一种游戏的面板、复选框名字的列表、对应复选框的个数列表、对应要执行的语句的列表
    update_check_box_group_panel: function (parent_pane_list, chx_list, chx_num_list, chx_func_list, select_list, label_list, start_index_list) {
        for (var i = 0; i < chx_list.length; i++) {
            var select_idx = select_list ? select_list[i] : 0;
            UICommonWidget.create_check_box_group(parent_pane_list[i], chx_list[i], chx_num_list[i], chx_func_list[i], select_idx, label_list[i], start_index_list[i]);
        }
    },

    update_check_box_single_panel: function (parent_pane_list, chx_list, chx_func_list, select_list, label_list) {
        for (var i = 0; i < chx_list.length; i++) {
            var is_select = select_list ? select_list[i] : 0;
            UICommonWidget.create_check_box_single(parent_pane_list[i], chx_list[i], chx_func_list[i], is_select, label_list[i]);
        }
    },

    updateCardDiamond: function () {
		var cost_num_label = this.gamename_panel.getChildByName("cost_panel").getChildByName("cost_num_label");
		let val = null;
		if (this.pay_mode === const_val.AA_PAY_MODE) {
			val = "每人消耗 x " + (this.game_round / 10 * 1);
		} else {
			if (this.room_type === const_val.CLUB_ROOM) {
				val = "楼主消耗 x " + (this.game_round / 10 * 4);
			} else if (this.room_type === const_val.AGENT_ROOM) {
				val = "代理消耗 x " + (this.game_round / 10 * 4);
			} else {
				val = "房主消耗 x " + (this.game_round / 10 * 4);
			}
		}
		cost_num_label.setString(val.toString());
    },

    update_mode_option: function () {

    },

	update_default_pay_mode: function () {
		switch (this.room_type) {
			case const_val.CLUB_ROOM:
				if (this.pay_mode !== const_val.AA_PAY_MODE) {
					this.pay_mode = const_val.CLUB_PAY_MODE;
				}
				break;
			case const_val.AGENT_ROOM:
				if (this.pay_mode !== const_val.AA_PAY_MODE) {
					this.pay_mode = const_val.AGENT_PAY_MODE;
				}
				break;
			default:
				if (this.pay_mode !== const_val.AA_PAY_MODE) {
					this.pay_mode = const_val.NORMAL_PAY_MODE;
				}
		}
	},

	getParameters: function () {
        this.setCreateInfo();
        return {
            "game_mode": this.game_mode,
            "game_round": this.game_round,
            "hand_prepare": this.hand_prepare,
            "pay_mode": this.pay_mode,
            "expand_cards": this.expand_cards === 0 ? [6, 5, 4, 3, 2, 1] : [1],
            'base_score': [1, 2, 3, 4],
            'mul_mode': [3, 2, 2],
            'enter_mode': 0,
            'op_seconds': this.op_seconds * 15,
            'player_num': 6,
        }
    },

	updateRoomType: function (r_type) {
		this.room_type = r_type;
		var pay_panel = this.gamename_panel.getChildByName("pay_panel");
		var label_1 = pay_panel.getChildByName("pay_mode_label_1");
		if (r_type === const_val.CLUB_ROOM) {
			label_1.setString("楼主支付");
		} else if (r_type === const_val.AGENT_ROOM) {
			label_1.setString("代理支付");
		} else {
			label_1.setString("房主支付");
		}
		this.update_default_pay_mode();
		// this.update_mode_option();
		this.updateCardDiamond();
	}
});