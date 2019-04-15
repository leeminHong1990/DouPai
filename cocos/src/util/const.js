"use strict";

var const_val = function () {
};

const_val.GAME_NAME = "DOUPAI";

// 为了便于UI管理，globalUIMgr的ZOrder一定要大于curUIMgrZOrder
const_val.globalUIMgrZOrder = 90000;
const_val.curUIMgrZOrder = 10000;

const_val.GameRoomBgZOrder = -100;
const_val.GameRoomZOrder = -80;
const_val.GameConfigZOrder = 100;
const_val.SettlementZOrder = 120;
const_val.PlayerInfoZOrder = 100;
const_val.CommunicateZOrder = 100;

const_val.GameHallZOrder = -10;
const_val.GameHallBroadcastZOrder = -5;

const_val.MAX_LAYER_NUM = 99999999;


// 房间操作id
const_val.OP_NONE = 0;                  // 不允许执行操作
const_val.OP_PASS = 1 << 3;             // 过
const_val.OP_FIGHT_DEALER = 1 << 4;     // 抢庄
const_val.OP_BET = 1 << 5;              // 下注
const_val.OP_ADD_BET = 1 << 6;          // 加注
const_val.OP_SHOW_CARD = 1 << 7;        // 开牌
const_val.OP_CMP_WIN = 1 << 8;          // 和其他玩家比牌
const_val.OP_EXCHANGE = 1 << 9;         // 交换手牌
const_val.OP_CONFIRM_DEALER = 1 << 10;  // 确认x抢到庄家

//
const_val.SHOW_FIGHT_DEALER = 4;
const_val.SHOW_BET = 5;
const_val.SHOW_ADD_BET = 7;
const_val.SHOW_OPEN_CARD = 13;
const_val.SHOW_CMP_WIN = 8;
const_val.SHOW_PASS = 1;
const_val.SHOW_OP_LIST = [const_val.SHOW_FIGHT_DEALER, const_val.SHOW_BET, const_val.SHOW_ADD_BET, const_val.SHOW_OPEN_CARD, const_val.SHOW_CMP_WIN, const_val.SHOW_PASS];

const_val.SHOW_DO_OP = 0; 	//	doOperation
const_val.SHOW_CONFIRM_OP = 1; 	// 	confirmOperation

// 是否显示 交换位置
const_val.SHOW_SWAP_SEAT = 0;
// 是否显示GPS ui
const_val.SHOW_GPSUI = false;

// 服务端 投票状态机，客户端暂时用不到
const_val.OP_STATE_PASS = 0; 	//放弃操作
const_val.OP_STATE_WAIT = 1; 	//等待确认
const_val.OP_STATE_SURE = 2; 	//确认操作

// 牌局状态
const_val.ROOM_WAITING = 0;		// 牌局未开始
const_val.ROOM_PLAYING = 1;		// 牌局已开始

const_val.MESSAGE_LIST = [
    "唉,一手烂牌臭到底",
    "不怕神一样的对手,就怕猪一样的队友",
    "和你合作真是太愉快啦",
    "投降输一半,速度投降吧",
    "快点吧,我等的花儿都谢了",
    "你的牌打得也太好了",
    "大清早的,鸡都还没叫，慌什么嘛",
    "吐了个槽的,整个一个杯具啊",
    "不要吵了,有什么好吵的,专心玩牌吧"
];

const_val.SIGNIN_MAX = 10;

const_val.GAME_RECORD_MAX = 10;
const_val.DISMISS_ROOM_WAIT_TIME = 90; // 申请解散房间后等待的时间, 单位为秒

const_val.BEGIN_ANIMATION_TIME = 5;

const_val.GAME_ROOM_2D_UI = 0;
const_val.GAME_ROOM_3D_UI = 1;

const_val.GAME_ROOM_BG_CLASSIC = 0;
const_val.GAME_ROOM_BG_BULE = 1;
const_val.GAME_ROOM_BG_GREEN = 2;

const_val.NOT_DISPLAY_CANWIN_PANEL = 0;		//传入0时不显示canwin_panel
const_val.WINTIPS_BTN_DISPLAY = 10;		//传入10时代表此时wintips_btn显示

const_val.mark_same_color = cc.color(191, 191, 191);
const_val.mark_none_color = cc.color(255, 255, 255);
const_val.mark_king_color = cc.color(255, 220, 220);

const_val.PLAYER_TOUCH_SELF_STATE = 0;
const_val.PLAYER_TOUCH_FORCE_STATE = 1;
const_val.PLAYER_TOUCH_OTHER_STATE = 2;

const_val.GAME_ROOM_GAME_MODE = 0;
const_val.GAME_ROOM_PLAYBACK_MODE = 1;

const_val.ANIM_LIST = [3, 6, 4, 6, 5, 4, 4, 2, 2];	//表情的帧数
const_val.EXPRESSION_ANIM_LIST = ["flower", "kiss", "pie", "bomb"];	//魔法表情
const_val.EXPRESSION_ANIMNUM_LIST = [32, 23, 21, 16];	//魔法表情的帧数


const_val.FAKE_COUNTDOWN = 15; //假的倒计时开关
const_val.FAKE_BEGIN_ANIMATION_TIME = 5;	//假的倒计时开局动画延迟

const_val.PUTONG = "PuTong";	//普通话
const_val.LOCAL = "Local";		//地方话
const_val.LANGUAGE = [const_val.LOCAL, const_val.PUTONG];

//####################################  房间的一些错误码  #####################################
// 进入房间失败错误码
const_val.ENTER_FAILED_ROOM_NO_EXIST				= -1; // 房间不存在
const_val.ENTER_FAILED_ROOM_FULL					= -2; // 房间已经满员
const_val.ENTER_FAILED_ROOM_DIAMOND_NOT_ENOUGH		= -3; // 进入AA制付费房间时，代币不足
const_val.ENTER_FAILED_NOT_CLUB_MEMBER				= -4; // 不是茶楼成员
const_val.ENTER_FAILED_ROOM_STARTING				= -5; // 房间已经开始
const_val.ENTER_FAILED_ROOM_DESTROYED				= -9; // 房间已经销毁

// 创建房间失败错误码
const_val.CREATE_FAILED_NO_ENOUGH_CARDS = -1;  // 房卡不足
const_val.CREATE_FAILED_ALREADY_IN_ROOM = -2;  // 已经在房间中
const_val.CREATE_FAILED_AGENT_ROOM_LIMIT = -3; // 代开房达到上限
const_val.CREATE_FAILED_NET_SERVER_ERROR = -4;  // 访问外部网络结果失败
const_val.CREATE_FAILED_PERMISSION_DENIED = -5;  // 不是代理, 不能代开房
const_val.CREATE_FAILED_OTHER = -9;

//############################################ 牌型 ##########################################

const_val.POKER_TYPE_NONE = 0;// 没牛
const_val.POKER_TYPE_TEN = 1;// 有牛
const_val.POKER_TYPE_FLOWER4 = 2;// 4花
const_val.POKER_TYPE_FLOWER5 = 3;// 5花
const_val.POKER_TYPE_CALF = 4;// 五小
const_val.POKER_TYPE_BOMB = 5;// 炸弹
const_val.POKER_TYPE_DRAGON = 6;// 一条龙

const_val.ALL_POKER_TYPE = [const_val.POKER_TYPE_NONE, const_val.POKER_TYPE_TEN, const_val.POKER_TYPE_FLOWER4, const_val.POKER_TYPE_FLOWER5, const_val.POKER_TYPE_CALF, const_val.POKER_TYPE_BOMB, const_val.POKER_TYPE_DRAGON];
//############################################################################################

//####################################  房间开房的一些模式 ####################################

// 规则
const_val.GAME_MODE_BULLFIGHT = 0;// 牛牛坐庄
const_val.GAME_MODE_FIXED = 1;// 固定
const_val.GAME_MODE_DEALER = 2;// 自由抢庄
const_val.GAME_MODE_SEEN_DEALER = 3;// 明牌抢庄
const_val.GAME_MODE_LOOP = 4;// 轮庄
const_val.GAME_MODE_RANDOM = 5;// 随机坐庄
const_val.GAME_MODE_WIN = 6;// 赢家坐庄

const_val.GAME_MODE = [const_val.GAME_MODE_BULLFIGHT, const_val.GAME_MODE_FIXED, const_val.GAME_MODE_DEALER, const_val.GAME_MODE_SEEN_DEALER, const_val.GAME_MODE_LOOP, const_val.GAME_MODE_RANDOM, const_val.GAME_MODE_WIN];
const_val.GAME_MODE_STRING = [
	"牛牛上庄",
	"固定庄家",
	"自由抢庄",
	"明牌抢庄",
	"轮流坐庄",
	"随机坐庄",
	"赢家坐庄"
];
//# 局数
const_val.GAME_ROUND = [10, 20];
//# 带入
const_val.GAME_MAX_LOSE = [40, 50, 60];

//# 底分
const_val.BASE_SCORE = [
    [[1, 2], [2, 4], [3, 6]],
    [[1, 2], [2, 4], [3, 6]],
    [[1, 2, 3, 4], [2, 4, 6, 8], [3, 6, 9, 12]],  // 1, 2, 3
    [[1, 2, 3, 4], [2, 4, 6, 8], [3, 6, 9, 12]],  //1, 2, 3
    // never use
    [[1, 2], [2, 4], [3, 6]],
    [[1, 2], [2, 4], [3, 6]],
    [[1, 2], [2, 4], [3, 6]],
];

//# 是否手动准备开局
const_val.HAND_PREPARE = 0;	//# 手动准备
const_val.AUTO_PREPARE = 1;	//# 自动准备
const_val.PREPARE_MODE = [const_val.AUTO_PREPARE, const_val.HAND_PREPARE];
//# 谁开的房
const_val.NORMAL_ROOM = 0;	//# 普通开房
const_val.AGENT_ROOM = 1;	//# 代理开房
const_val.CLUB_ROOM = 2;    //# 茶楼开房
const_val.OPEN_ROOM_MODE = [const_val.NORMAL_ROOM, const_val.AGENT_ROOM, const_val.CLUB_ROOM];
//# 支付模式
const_val.NORMAL_PAY_MODE = 0; //# 正常房间, 房主支付
const_val.AA_PAY_MODE = 1;		//# 开房, AA支付
const_val.AGENT_PAY_MODE = 2;	//# 代理开房, 代理支付
const_val.CLUB_PAY_MODE = 3;	//# 茶楼开房, 老板支付
/****************************************************************************************************/
// 正在游戏的玩家
const_val.GAME_ROLE_PLAYER = 0;
// 观众
const_val.GAME_ROLE_VIEWER = 1;


const_val.MAX_PLAYER_NUM = 6;
const_val.HAND_CARD_NUM = 5;

// 手动确认有没有牛
const_val.POKER_STATE_NONE = 0;// 没牛
const_val.POKER_STATE_TEN = 1;// 有牛

const_val.POKER_COLOR_DICT = {
    4: "a",
    3: "c",
    2: "b",
    1: "d",
};


// 不需要算牛的牌型
const_val.AUTO_COMPUTER_TEN_LIST = [const_val.POKER_TYPE_DRAGON, const_val.POKER_TYPE_BOMB, const_val.POKER_TYPE_CALF];

// 牌局状态
const_val.ROOM_END = 0;		// 房间不可以继续
const_val.ROOM_CONTINUE = 1;// 房间可以继续


// ################################### 茶楼相关 ########################################
//茶楼相关字符长度
const_val.CLUB_MAX_MEM_NUM 	= 500; 		// 茶楼人数限制
const_val.CLUB_MAX_MARK_LEN = 11; 		// 玩家备注最大长度
const_val.CLUB_NAME_LEN 	= 8;		// 茶楼名字最大长度
const_val.CLUB_NUM_LIMIT 	= 10;		// 加入茶楼最大数量
const_val.CLUB_NOTICE_LEN 	= 18;		// 公告最大长度
// 茶楼相关错误码
const_val.CLUB_OP_ERR_PERMISSION_DENY	= -1; // 权限不足
const_val.CLUB_OP_ERR_INVALID_OP		= -2; // 非法操作
const_val.CLUB_OP_ERR_NUM_LIMIT			= -3; // 茶楼数量限制
const_val.CLUB_OP_ERR_WRONG_ARGS		= -4; // 参数错误
const_val.CLUB_OP_ERR_CLUB_NOT_EXIST	= -5; // 茶楼不存在

// 茶楼相关操作码
const_val.CLUB_OP_AGREE_IN			= 1; // 同意玩家加入茶楼
const_val.CLUB_OP_REFUSE_IN			= 2; // 拒绝玩家加入茶楼
const_val.CLUB_OP_INVITE_IN			= 3; // 邀请玩家茶楼
const_val.CLUB_OP_KICK_OUT			= 4; // 将玩家踢出茶楼
const_val.CLUB_OP_APPLY_IN			= 5; // 申请加入茶楼
const_val.CLUB_OP_APPLY_OUT			= 6; // 离开茶楼
const_val.CLUB_OP_SET_NAME			= 7; // 茶楼改名
const_val.CLUB_OP_GET_MEMBERS		= 8; // 获取成员列表
const_val.CLUB_OP_GET_APPLICANTS	= 9; // 获取申请者列表
const_val.CLUB_OP_SET_NOTICE		= 10;// 设置茶楼公告
const_val.CLUB_OP_SET_MEMBER_NOTES	= 11;// 设置成员备注
const_val.CLUB_OP_SIT_DOWN			= 12;// 选择一张桌子坐下
const_val.CLUB_OP_GET_TABLE_DETAIL	= 13;// 获取桌子详情
const_val.CLUB_OP_GET_RECORDS		= 14;// 获取桌子详情

// activity
const_val.SHOW_ACTIVITY_INTERVAL = 3 * 60 * 60 * 1000;

// 没牛是否真实有效
const_val.MODULE_CONFIRM_POKER_STATE = false;