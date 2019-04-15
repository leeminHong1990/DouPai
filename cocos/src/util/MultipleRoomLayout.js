"use strict"
var MultipleRoomLayout = cc.Class.extend({

    ctor: function (uiMgr, ui_list) {
        this.curUIMgr = uiMgr;
        this.ui_list = ui_list;
        this.all_show = true;
		this.showObservers = null;
    },

    isShow: function () {
        if (this.ui_list) {
            for (var i = 0; i < this.ui_list.length; i++) {
                if (!this.ui_list[i].is_show) {
                    return false;
                }
            }
            return true;
        }
        return false;
    },

    notifyObserver: function (notification) {
        Array.prototype.shift.apply(arguments);
        for (var i = 0; i < this.ui_list.length; i++) {
            if (cc.isFunction(this.ui_list[i][notification])) {
                this.ui_list[i][notification].apply(this.ui_list[i], arguments)
            } else {
                cc.error("notifyObserver " + notification + " is not found!", this.ui_list[i])
            }
        }
    },

    /**
     * 需要调用的函数第一个参数必须是callback类型
     * @param notification
     * @param callback
     */
    notifyObserverWithCallback: function (notification, callback) {
        let complete = 0;
        let count = this.ui_list.length;

        function proxy() {
            complete++;
            complete = count === complete;
            callback(complete, arguments);
        }

        Array.prototype.shift.apply(arguments);
        arguments[0] = proxy;
        for (var i = 0; i < this.ui_list.length; i++) {
            var ui = this.ui_list[i];
            if (cc.isFunction(ui[notification])) {
                ui[notification].apply(ui, arguments);
            } else {
                cc.error("notifyObserver " + notification + " is not found!", this.ui_list[i])
            }
        }
    },

    iterUI: function (callback) {
        for (var i = 0; i < this.ui_list.length; i++) {
            var ui = this.ui_list[i];
            if (ui && ui.is_show && callback) {
                callback(ui)
            }
        }
    },

	registerShowObserver: function (func) {
		if (this.showObservers === null) {
			this.showObservers = [];
		}
		this.showObservers.push(func);
	},
	
    showGameRoomUI: function (callback) {
        var complete = false;
        var count = 0;
        var self = this;
        this.notifyObserver("show", function () {
            count++;
            complete = count === self.ui_list.length;
            // Note: 在多个ui未加载完成时先隐藏ui，不然会出现ui闪现
            // 但是如果有一套资源出现问题加载不完可能会一直不显示
            if (self.all_show) {
                for (var i = 0; i < self.ui_list.length; i++) {
                    let ui = self.ui_list[i];
                    if (ui.is_show) {
                        ui.setVisible(false);
                        ui.setLocalZOrder(const_val.GameRoomZOrder);
                    }
                }
            }
            if (complete) {
                self.setGameRoomUI2Top(cc.sys.localStorage.getItem(const_val.GAME_NAME+"GAME_ROOM_UI"));
            }
            if (callback) callback(complete);
			if (self.showObservers !== null && complete) {
				for (var i = 0; i < self.showObservers.length; i++) {
					self.showObservers[i]();
				}
				self.showObservers = null;
			}
		})
    },

    updateBackground: function (gameroom_type, gameroombg_type) {
        if (this.curGameRoomType == gameroom_type && this.curGameRoomBgType == gameroombg_type) {
            return true;
        }
        this.curGameRoomType = gameroom_type;
        this.curGameRoomBgType = gameroombg_type;

        var bgImgPath = "res/ui/BackGround/background_1.png";
        // var bgDescImgPath = "res/ui/BackGround/bg_desc3d" + gameroombg_type + ".png";

        var bg_img = this.curUIMgr.getChildByName("bg_img");
        if (!bg_img) {
            bg_img = ccui.ImageView.create();
            bg_img.setName("bg_img");
            bg_img.setAnchorPoint(0.5, 0.5);
            bg_img.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
            bg_img.setLocalZOrder(const_val.GameRoomBgZOrder);
            this.curUIMgr.addChild(bg_img);
        }
        bg_img.loadTexture(bgImgPath);

        var bg_img_content_size = bg_img.getContentSize();
        var scale = cc.winSize.width / bg_img_content_size.width;
        if (cc.winSize.height / bg_img_content_size.height > scale) {
            scale = cc.winSize.height / bg_img_content_size.height;
        }
        bg_img.setScale(scale);

        // var bg_desc_img = this.curUIMgr.getChildByName("bg_desc");
        // if (!bg_desc_img) {
        //     bg_desc_img = ccui.ImageView.create();
        //     bg_desc_img.setName("bg_desc");
        //     bg_desc_img.setAnchorPoint(0.5, 0.5);
        //     bg_desc_img.setLocalZOrder(const_val.GameRoomBgZOrder)
        //     this.curUIMgr.addChild(bg_desc_img);
        // }
        // bg_desc_img.loadTexture(bgDescImgPath);
        //
        // if (gameroom_type === const_val.GAME_ROOM_2D_UI) {
        //     bg_desc_img.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5 - 100);
        // } else {
        //     bg_desc_img.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5 - 88);
        // }
    },

    setGameRoomUI2Top: function (gameroom_type) {
        for (var ui of this.ui_list) {
            if (ui.is_show) {
                ui.setVisible(gameroom_type == ui.uiType)
            }
        }
        var game_room_bg_type = cc.sys.localStorage.getItem(const_val.GAME_NAME+"GAME_ROOM_BG");
        this.updateBackground(gameroom_type, game_room_bg_type);
    },

    startGame: function (callback) {
        var self = this;
        self.count = 0;
        self.complete = false;

        function wrapper() {
            self.count++;
            self.complete = self.count === self.ui_list.length;
            if (self.complete) {
                self.setGameRoomUI2Top(cc.sys.localStorage.getItem(const_val.GAME_NAME+"GAME_ROOM_UI"));
            }
            if (callback) {
                callback(self.complete);
            }
			if (self.complete && self.showObservers != null) {
				for (var i = 0; i < self.showObservers.length; i++) {
					self.showObservers[i]();
				}
				self.showObservers = null;
			}
            if (self.complete) {
                self.count = null;
                self.complete = null;
            }
        }

        for (var i = 0; i < this.ui_list.length; i++) {
            let ui = this.ui_list[i];
            if (ui.is_show) {
                ui.reset();
                ui.setVisible(false);
                ui.startGame();
                wrapper()
            } else {
                ui.show(function () {
                    ui.setVisible(false);
                    ui.setLocalZOrder(const_val.GameRoomZOrder);
                    ui.startGame();
                    wrapper()
                });
            }
        }
    }

});
