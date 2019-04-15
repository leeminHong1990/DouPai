"use strict"

var GameRoom3DUI = GameRoomUI.extend({
    className: "GameRoom3DUI",
    uiType: const_val.GAME_ROOM_3D_UI,
    ctor: function () {
        this._super();
        this.resourceFilename = "res/ui/GameRoom3DUI.json";
    },

    get_start_begin_anim_config: function () {
        var options = {};
        options.groupSize = 3;
        options.tileDownImgPaths = [
            "Mahjong/mahjong_tile_player_down6.png",
            "Mahjong/mahjong_tile_left_down.png",
            "Mahjong/mahjong_tile_player_down6.png",
            "Mahjong/mahjong_tile_left_down.png"
        ];
        // options.tileDownImgPaths = [
        //     "Mahjong/mahjong_tile_player_down%d.png",
        //     "Mahjong/mahjong_tile_left_down.png",
        //     "Mahjong/mahjong_tile_player_down%d.png",
        //     "Mahjong/mahjong_tile_left_down.png"
        // ];
        // options.tileTopAndDownImgPaths = [
        //     [0,1,2,3,4,5,6,7,8,8,9,10,11],
        //     [],
        //     [0,1,2,3,4,5,6,7,8,8,9,10,11],
        //     []
        // ];
        options.downRootNodeScales = [1, 0.95, 0.6, 0.95];
        options.downRootNodeRotations = [0, 16, 0, -16];
        options.downRootNodeAnchorPointX = [0, 1, 0, 0];
        options.downRootNodeFlippedX = [0, 1, 0, 0];
        options.downRootNodeOffsets = [
            cc.p(0, 0), cc.p(0, -80), cc.p(40, 0), cc.p(-20, -20)
        ];
        options.tilescale = [100, 97, 95, 93, 91, 89, 87, 85, 83, 81, 79, 77, 75, 73];
        options.downTilePositionFuncs = [
            function (index) {
                return cc.p(78 * index, 0);
            },
            function (index) {
                return cc.p(-40, 485 - 32 * index)
            },
            function (index) {
                return cc.p(78 * index, 0)
            },
            function (index) {
                return cc.p(-2 * index, 485 - 32 * index)
            }
        ]
        return options;
    },
});