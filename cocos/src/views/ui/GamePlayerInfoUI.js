// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
"use strict"
var GamePlayerInfoUI = UIBase.extend({
	ctor:function() {
		this._super();
		this.resourceFilename = "res/ui/PlayerInfoUI.json";
	},

	initUI:function() {
        var self = this;
        this.gameplayerinfo_panel = this.rootUINode.getChildByName("gameplayerinfo_panel");
        if(cc.director.getRunningScene().constructor == GameHallScene){
            BasicDialogUI.addColorMask(this.rootUINode , undefined, function () {
                self.hide();
            }, cc.color(255,255,255,0));
        }

		this.posx_list = [0.09, 0.91, 0.83, 0.5, 0.15, 0.08];
		this.posy_list = [0.21, 0.50, 1, 0.6, 0.5, 0.3];
		this.anchor_list = [[0, 1, 1, 0.5, 0, 0], [0, 0, 1, 0.5, 0, 0]];
	},

	show_by_info:function(info_dict, serverSitNum){
	    var idx = /*serverSitNum >= 10 ? serverSitNum : */h1global.player().server2CurSitNum(serverSitNum);
		var self = this;
        this.show(function(){
        	cc.log("info_dict:",info_dict);
        	cc.log("idx:",idx);
            self.rootUINode.getChildByName("playerinfo_panel").setVisible(false);
            self.rootUINode.getChildByName("gameselfplayerinfo_panel").setVisible(false);
            self.rootUINode.getChildByName("gameplayerinfo_panel").setVisible(false);
            self.rootUINode.getChildByName("prepareplayerinfo_panel").setVisible(false);
			self.gameplayerinfo_panel = self.rootUINode.getChildByName("gameplayerinfo_panel");
			if(idx === 0){self.gameplayerinfo_panel = self.rootUINode.getChildByName("gameselfplayerinfo_panel");}
			var contentSize = self.getContentSize();
			for (var i = 0; i < const_val.MAX_PLAYER_NUM; i++) {
				if (i === idx) {
					self.gameplayerinfo_panel.setAnchorPoint(self.anchor_list[0][i], self.anchor_list[1][i]);
					self.gameplayerinfo_panel.setPosition(contentSize.width * self.posx_list[i], contentSize.height * self.posy_list[i]);
				}
			}
            self.gameplayerinfo_panel.setVisible(true);
            var player = h1global.player();
            var distance = parseInt(player.curGameRoom.playerDistanceList[player.serverSitNum][serverSitNum >= 10 ? serverSitNum - 10 : serverSitNum]);
            cc.log("playerinfo distance:",distance);
			if (idx !== 0) {
                cutil.loadPortraitTexture(info_dict["head_icon"], info_dict["sex"], function(img){
					if (cc.sys.isObjectValid(self.gameplayerinfo_panel) && h1global.curUIMgr.gameplayerinfo_ui && h1global.curUIMgr.gameplayerinfo_ui.is_show) {
                        h1global.curUIMgr.gameplayerinfo_ui.rootUINode.getChildByName("gameplayerinfo_panel").getChildByName("portrait_sprite").removeFromParent();
                        var portrait_sprite  = new cc.Sprite(img);
                        portrait_sprite.setName("portrait_sprite");
                        portrait_sprite.setScale(100/portrait_sprite.getContentSize().width);
                        portrait_sprite.x = self.gameplayerinfo_panel.getContentSize().width * 0.16;
                        portrait_sprite.y = self.gameplayerinfo_panel.getContentSize().height * 0.72;
                        h1global.curUIMgr.gameplayerinfo_ui.rootUINode.getChildByName("gameplayerinfo_panel").addChild(portrait_sprite);
                    }
                });
                self.init_expression_action(serverSitNum);
                self.gameplayerinfo_panel.getChildByName("distance_label").setString("距离：" + (distance !== -1 ? (distance > 1000 ? parseInt(distance / 1000) + "k" : distance) + "m" : "未知"));
			}

			var ip_label = self.gameplayerinfo_panel.getChildByName("ip_label");
			if(info_dict["ip"]){
				ip_label.setString("IP:" + info_dict["ip"]);
				ip_label.setVisible(true);
			} else {
				ip_label.setVisible(false);
			}

			self.gameplayerinfo_panel.getChildByName("id_label").setString("ID: " + info_dict["userId"].toString());
			self.gameplayerinfo_panel.getChildByName("gps_label").setString(info_dict["location"] ? info_dict["location"].toString() : "未获得");
            self.gameplayerinfo_panel.runAction(cc.Sequence.create(
                cc.DelayTime.create(5.0),
                cc.CallFunc.create(function () {
                    self.hide();
                })
            ));
		});
	},

    init_expression_action : function(idx){
        var self = this;
        this.expression_list = [];
		function expression_event(sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				for(var j = 0 ; j < self.expression_list.length ; j ++) {
					if(sender === self.expression_list[j]) {
						var player = h1global.player();
						if (player) {
							player.sendExpression(player.serverSitNum, idx, j);
							self.hide();
						}
					}
				}
			}
		}
        for(var i = 0 ; i < const_val.EXPRESSION_ANIM_LIST.length ; i++) {
            var expression = this.rootUINode.getChildByName("gameplayerinfo_panel").getChildByName("expression_img_" + i.toString());
            this.expression_list.push(expression);
            expression.setTouchEnabled(true);
            expression.addTouchEventListener(expression_event);
        }
    },
});