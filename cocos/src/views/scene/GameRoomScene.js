// cc.loader.loadJs("src/views/uimanager/LoginSceneUIManager.js")

var GameRoomScene = cc.Scene.extend({
    className: "GameRoomScene",
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
        if (!cc.audioEngine.isMusicPlaying()) {
            cc.audioEngine.playMusic("res/sound/music/game_bgm.mp3", true);
        }
    },

    loadUIManager: function () {
        var curUIManager = new GameRoomSceneUIManager();
        curUIManager.setAnchorPoint(0, 0);
        curUIManager.setPosition(0, 0);
        this.addChild(curUIManager, const_val.curUIMgrZOrder);
        h1global.curUIMgr = curUIManager;

        // h1global.curUIMgr.roomLayoutMgr.notifyObserver(const_val.GAME_ROOM_UI_NAME, "hide");
        if (h1global.curUIMgr.roomLayoutMgr) {
            function callback(complete) {
                if (complete) {
                    let player = h1global.entityManager.player();
                    if (player && player.startActions["GameRoomScene"]) {
                        player.startActions["GameRoomScene"]();
                        player.startActions["GameRoomScene"] = undefined;
                    } else if (player && player.curGameRoom && player.curGameRoom.room_state === const_val.ROOM_PLAYING) {
                        // curUIManager.gameroomprepare_ui.hide();
                        if (player && player.startActions["GameRoomUI"]) {
                            player.startActions["GameRoomUI"]();
                            player.startActions["GameRoomUI"] = undefined;
                        }
                    } else {
                        curUIManager.gameroomprepare_ui.show_prepare();
                    }
                }
            }

            let player = h1global.entityManager.player();
            if (player && player.curGameRoom) {
                if (player.curGameRoom.room_state === const_val.ROOM_PLAYING) {
                    h1global.curUIMgr.roomLayoutMgr.startGame(callback);
                } else {
                    h1global.curUIMgr.roomLayoutMgr.showGameRoomUI(callback);
                }
            }
            else {
                // Note: 如果现在掉线，显示准备界面
                // curUIManager.gameroomprepare_ui.show_prepare();
            }
        }


        if (!onhookMgr) {
            onhookMgr = new OnHookManager();
        }

        onhookMgr.init(this);
        this.scheduleUpdateWithPriority(0);

		if (onhookMgr.applyCloseLeftTime > 0) {
			curUIManager.applyclose_ui.show_by_sitnum(h1global.player().curGameRoom.applyCloseFrom);
		}
    },

    update: function (delta) {
        // if (physicsUpdate) {
        //     physicsUpdate();
        // }
        onhookMgr.update(delta);
    }
});