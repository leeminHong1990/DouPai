var PlaybackGameRoomScene = cc.Scene.extend({
    className: "PlaybackGameRoomScene",

    onEnter: function () {
        this._super();
        if (cc.sys.localStorage.getItem(const_val.GAME_NAME+"GAME_ROOM_UI") == null) {
            cc.sys.localStorage.setItem(const_val.GAME_NAME+"GAME_ROOM_UI", const_val.GAME_ROOM_2D_UI)
        }
        if (cc.sys.localStorage.getItem(const_val.GAME_NAME+"GAME_ROOM_BG") == null) {
            cc.sys.localStorage.setItem(const_val.GAME_NAME+"GAME_ROOM_BG", const_val.GAME_ROOM_BG_CLASSIC);
        }
        this.loadUIManager();
        cutil.unlock_ui();

        if (cc.audioEngine.isMusicPlaying()) {
            cc.audioEngine.stopMusic();
        }

        if (h1global.curUIMgr.roomLayoutMgr) {
            h1global.curUIMgr.startGame(function (complete) {
                if (complete) {
                    var player = h1global.entityManager.player();
                    h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_kingtile_panel");
                    h1global.curUIMgr.roomLayoutMgr.notifyObserver("throwTheDice", player.diceList, player.curGameRoom.dealerIdx);
                    var roomUI = h1global.curUIMgr.playbackgameroom2d_ui || h1global.curUIMgr.playbackgameroom3d_ui;
                    if (roomUI) {
                        roomUI.playbackGame.startPlayback();
                    } else {
                        cc.error("playback room not show");
                    }
                }
            });
        }
    },

    loadUIManager: function () {
        var curUIManager = new PlaybackGameRoomSceneUIManager();
        curUIManager.setAnchorPoint(0, 0);
        curUIManager.setPosition(0, 0);
        this.addChild(curUIManager, const_val.curUIMgrZOrder);
        h1global.curUIMgr = curUIManager;
    },
});