var GPSUI = UIBase.extend({
    ctor: function () {
        this._super();
        this.resourceFilename = "res/ui/GPSUI.json";
    },

    initUI: function () {
        if (h1global.curUIMgr.gameplayerinfo_ui && h1global.curUIMgr.gameplayerinfo_ui.is_show) {
            h1global.curUIMgr.gameplayerinfo_ui.hide();
        }
        this.gps_panel = this.rootUINode.getChildByName("gps_panel");
        var self = this;
        var scanning_img = this.gps_panel.getChildByName("scanning_img");
        scanning_img.runAction(cc.RepeatForever.create(cc.Sequence.create(
            cc.RotateTo.create(2, 720)
        )));
        for (var i = 0; i < 4; i++) {
            var flash_point_img = this.gps_panel.getChildByName("flash_point_img_" + i.toString());
            flash_point_img.runAction(cc.RepeatForever.create(cc.Sequence.create(
                cc.FadeIn.create(0.5 + i * 0.1),
                cc.FadeOut.create(0.5)
                ))
            );
        }
        this.check_list = ["系统防作弊检测开始", "玩家IP地址检测中...", "玩家定位距离检测中..."];
        this.check_idx = 0;
        var detect_label = this.gps_panel.getChildByName("detect_label");
        detect_label.setString(this.check_list[this.check_idx]);
        detect_label.setPosition(cc.p(detect_label.getPositionX(), this.gps_panel.getContentSize().height * 0.26));
        this.runAction(cc.Sequence.create(
            cc.DelayTime.create(0.2),
            cc.CallFunc.create(function () {
                self.update_detect_label(detect_label);
            })
        ));
        this.runAction(cc.Sequence.create(
            cc.DelayTime.create(6),
            cc.Spawn.create(
                cc.FadeOut.create(0.3),
                cc.ScaleTo.create(0.3, 0.01)
            ),
            cc.CallFunc.create(function () {
                self.hide();
                if (h1global.curUIMgr.roomLayoutMgr) {
                    cc.error("gps startgame")
                    h1global.curUIMgr.roomLayoutMgr.startGame(function (complete) {
                        if (complete) {
                            if (complete && self.player && self.player.startActions["GameRoomUI"]) {
                                self.player.startActions["GameRoomUI"]();
                                self.player.startActions["GameRoomUI"] = undefined;
                                self.player = null;
                            }
                        }
                    });
                }
            })
        ));
    },

    update_detect_label: function (detect_label) {
        var self = this;
        detect_label.runAction(cc.Sequence.create(
            cc.Spawn.create(
                cc.FadeIn.create(0.2),
                cc.MoveTo.create(0.2, cc.p(detect_label.getPositionX(), this.gps_panel.getContentSize().height * 0.32))
            ),
            cc.DelayTime.create(1),
            cc.Spawn.create(
                cc.FadeOut.create(0.2),
                cc.MoveTo.create(0.2, cc.p(detect_label.getPositionX(), this.gps_panel.getContentSize().height * 0.39))
            ),
            cc.CallFunc.create(function () {
                detect_label.setPosition(cc.p(detect_label.getPositionX(), self.gps_panel.getContentSize().height * 0.26));
                self.check_idx++;
                if (self.check_idx > 2) {
                    self.check_ip_same();
                    if (self.check_idx > 3) {
                        detect_label.setString("");
                        // self.update_detect_label(detect_label);
                        detect_label.runAction(cc.Sequence.create(
                            cc.Spawn.create(
                                cc.FadeIn.create(0.3),
                                cc.MoveTo.create(0.3, cc.p(detect_label.getPositionX(), self.gps_panel.getContentSize().height * 0.32))
                            ),
                            cc.DelayTime.create(3),
                            cc.CallFunc.create(function () {
                                detect_label.removeFromParent();
                                return;
                            })
                        ))
                    } else {
                        detect_label.removeFromParent();
                        return;
                    }
                    return;
                }
                detect_label.setString(self.check_list[self.check_idx]);
                self.update_detect_label(detect_label);
            })
        ));
    },

    check_ip_same: function () {
        var self = this;
        var playerInfoList = this.curGameRoom.playerInfoList;
        var ip_list = [];
        var idx_ip_list = [];
        var distance_list = this.curGameRoom.playerDistanceList;
        var idx_distance_list = [];

        let serverSitNum = this.serverSitNum;

        for (var i = 0; i < this.curGameRoom.player_num; i++) {
            if (i === serverSitNum) {
                ip_list.push("0");
            } else {
                if (playerInfoList[i]) {
                    ip_list.push(playerInfoList[i]["ip"]);
                } else {
                    ip_list.push("0");
                }
            }
        }

        collections.combinations([0, 1, 2, 3, 4, 5], 2, function (comb) {
            let a = comb[0];
            let b = comb[1];
            if (ip_list[a] === ip_list[b] && ip_list[a] !== "0") {
                if (idx_ip_list.indexOf(a) < 0) {
                    idx_ip_list.push(a);
                }
                if (idx_ip_list.indexOf(b) < 0) {
                    idx_ip_list.push(b);
                }
            }

            if (distance_list[a][b] < 100 && distance_list[a][b] >= 0 && a !== serverSitNum && b !== serverSitNum) {
                if (idx_distance_list.indexOf(a) < 0) {
                    idx_distance_list.push(a);
                }
                if (idx_distance_list.indexOf(b) < 0) {
                    idx_distance_list.push(b);
                }
            }

        });

        if (idx_ip_list.length === 0 && idx_distance_list.length === 0) {
            self.check_idx++;
        }
        for (var i = 0; i < idx_ip_list.length; i++) {
            if (playerInfoList[idx_ip_list[i]] && i !== serverSitNum) {
                let index = i;
                cutil.loadPortraitTexture(playerInfoList[idx_ip_list[i]]["head_icon"], playerInfoList[idx_ip_list[i]]["sex"], function (img) {
                    if (h1global.curUIMgr.gps_ui && h1global.curUIMgr.gps_ui.is_show && cc.sys.isObjectValid(self.gps_panel)) {
                        var old = self.gps_panel.getChildByName("portrait_sprite_ip_" + index.toString());
                        let oldPos = old.getPosition();
                        var portrait_sprite = new cc.Sprite(img);
                        portrait_sprite.setName("portrait_sprite_ip_" + index.toString());
                        // portrait_sprite.setScale(50/portrait_sprite.getContentSize().width);
                        portrait_sprite.setScale(0.001);
                        portrait_sprite.setPosition(oldPos);
                        portrait_sprite.setVisible(true);
                        self.gps_panel.addChild(portrait_sprite);
                        portrait_sprite.runAction(cc.Sequence.create(
                            cc.DelayTime.create(0.1 * index),
                            // cc.ScaleTo.create(0.5,50/portrait_sprite.getContentSize().width),
                            cc.EaseIn.create(cc.scaleTo(0.5, 50 / portrait_sprite.getContentSize().width), 0.3)
                        ));
                    }
                }, playerInfoList[idx_ip_list[i]]["uuid"].toString() + ".png");
                self.gps_panel.getChildByName("ip_label").setVisible(true);
            }
        }

        for (var i = 0; i < idx_distance_list.length; i++) {
            if (!playerInfoList[idx_distance_list[i]] || i === serverSitNum) {
                continue;
            }
            let index = i;
            cutil.loadPortraitTexture(playerInfoList[idx_distance_list[i]]["head_icon"], playerInfoList[idx_distance_list[i]]["sex"], function (img) {
                if (h1global.curUIMgr.gps_ui && h1global.curUIMgr.gps_ui.is_show && cc.sys.isObjectValid(self.gps_panel)) {
                    // self.gps_panel.getChildByName("portrait_sprite_ip_"+ i.toString()).setVisible(true);
                    var old = self.gps_panel.getChildByName("portrait_sprite_dt_" + index);
                    let oldPos = old.getPosition();
                    var portrait_sprite = new cc.Sprite(img);
                    portrait_sprite.setName("portrait_sprite_dt_" + index.toString());
                    // portrait_sprite.setScale(50/portrait_sprite.getContentSize().width);
                    portrait_sprite.setScale(0.001);
                    portrait_sprite.setPosition(oldPos);
                    portrait_sprite.setVisible(true);
                    self.gps_panel.addChild(portrait_sprite);
                    portrait_sprite.runAction(cc.Sequence.create(
                        cc.DelayTime.create(0.1 * index + 0.1),
                        // cc.ScaleTo.create(0.5,50/portrait_sprite.getContentSize().width),
                        cc.EaseIn.create(cc.scaleTo(0.5, 50 / portrait_sprite.getContentSize().width), 0.3)
                    ));
                }
            }, playerInfoList[idx_distance_list[i]]["uuid"].toString() + ".png");
            self.gps_panel.getChildByName("distance_label").setVisible(true);
        }
    },


    show_by_start: function (player, gameRoom, func) {
        this.curGameRoom = gameRoom;
        this.player = player;
        this.show(func)
    }
});