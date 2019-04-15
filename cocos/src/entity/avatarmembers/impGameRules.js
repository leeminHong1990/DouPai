"use strict";
/*-----------------------------------------------------------------------------------------
 interface
 -----------------------------------------------------------------------------------------*/
var impGameRules = impGameOperation.extend({
    __init__: function () {
        this._super();
        KBEngine.DEBUG_MSG("Create impGameRules");
    },

    getWaitOpDict: function (wait_aid_list, data_list, serverSitNum) {
        serverSitNum = serverSitNum || this.serverSitNum;
        var op_dict = {};
        for (var i = 0; i < wait_aid_list.length; i++) {
            op_dict[wait_aid_list[i]] = data_list[i];
        }
        if (Object.keys(op_dict).length > 0) {
            op_dict[const_val.OP_PASS] = []
        }
        cc.log("getWaitOpDict==>", wait_aid_list, data_list, op_dict, serverSitNum);
        return op_dict
    },

    isTargetPokerType: function (targetType) {
        if (!this.curGameRoom) {
            return false;
        }
        let expands = this.curGameRoom.expand_cards;
        if (expands.indexOf(targetType) >= 0) {
            let handTilesList = this.curGameRoom.handTilesList[this.serverSitNum];
            handTilesList = collections.map(handTilesList , rules.get_poker_num);
            if (rules.POKER_TYPE_DICT[targetType](handTilesList)[1]) {
                return true;
            }
        }
        return false;
    }

});
// Note: 为了播放开局动画时使用
impGameRules.waitOpDict = function (wait_aid_list, data_list, serverSitNum) {
    var op_dict = {};
    for (var i = 0; i < wait_aid_list.length; i++) {
        op_dict[wait_aid_list[i]] = data_list[i];
    }
    if (Object.keys(op_dict).length > 0) {
        op_dict[const_val.OP_PASS] = []
    }
    cc.log("waitOpDict==>", wait_aid_list, data_list, op_dict, serverSitNum);
    return op_dict
};
