"use strict"

var GameRoom2DUI = GameRoomUI.extend({
    className: "GameRoom2DUI",
    uiType: const_val.GAME_ROOM_2D_UI,
    ctor: function () {
        this._super();
        this.resourceFilename = "res/ui/GameRoom2DUI.json";
    },

    get_start_begin_anim_config: function () {
        var options = {};
        options.groupSize = 3;
        options.tileDownImgPaths = [
            "Mahjong2D/mahjong_tile_down.png",
            "Mahjong2D/mahjong_tile_side_down.png",
            "Mahjong2D/mahjong_tile_down.png",
            "Mahjong2D/mahjong_tile_side_down.png"
        ];
        options.downRootNodeScales = [1, 0.95, 0.6, 0.95];
        options.downRootNodeOffsets = [
            cc.p(0, 0), cc.p(0, -30), cc.p(100, 0), cc.p(0, 40)
        ];
        options.downTilePositionFuncs = [
            function (index) {
                return cc.p(76 * index, 0);
            },
            function (index) {
                return cc.p(0, 485 - 38 * index)
            },
            function (index) {
                return cc.p(76 * index, 0)
            },
            function (index) {
                return cc.p(0, 485 - 38 * index)
            }
        ]
        return options;
    },

});