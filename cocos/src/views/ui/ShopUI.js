// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
var ShopUI = UIBase.extend({
    ctor:function() {
        this._super();
        this.resourceFilename = "res/ui/ShopUI.json";
    },

    initUI:function(){
        this.shop_panel = this.rootUINode.getChildByName("shop_panel");
        this.card_panel0 = this.shop_panel.getChildByName("card_panel0");
        this.card_panel1 = this.shop_panel.getChildByName("card_panel1");
        this.card_panel2 = this.shop_panel.getChildByName("card_panel2");
        var self = this;
        var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
        this.shop_panel.getChildByName("return_btn").addTouchEventListener(function (sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                self.hide();
                cutil.get_user_info("wx_" + info_dict["unionid"], function(content){
                    if(content[0] != '{'){
                        return;
                    }
                    var info = eval('(' + content + ')');
                    h1global.curUIMgr.gamehall_ui.update_roomcard(info["card"].toString());
                });

            }
        });

        //购买房卡相关 --start
        this.card_panel0.getChildByName("card_btn_0").addTouchEventListener(function (sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                cutil.lock_ui();
                // cutil.get_pay_url(1);
                if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
                    var funcId = cutil.addFunc(function(result){
                        cutil.unlock_ui();
                        cc.log(result);
                        if (result == 'YES') {
                            h1global.curUIMgr.gamehall_ui.updateCharacterCard();
                        }
                    });
                    cutil.lock_ui();
                    jsb.reflection.callStaticMethod("IAPOcBridge", "startPurchWithID:completeHandle:", "4_cards", funcId);
                }
            }
        });

        this.card_panel1.getChildByName("card_btn_1").addTouchEventListener(function (sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                cutil.lock_ui();
                // cutil.get_pay_url(2);
                if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
                    var funcId = cutil.addFunc(function(result){
                        cutil.unlock_ui();
                        cc.log(result);
                        if (result == 'YES') {
                            h1global.curUIMgr.gamehall_ui.updateCharacterCard();
                        }
                    });
                    cutil.lock_ui();
                    jsb.reflection.callStaticMethod("IAPOcBridge", "startPurchWithID:completeHandle:", "15_cards", funcId);
                }
            }
        });

        this.card_panel2.getChildByName("card_btn_2").addTouchEventListener(function (sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                cutil.lock_ui();
                // cutil.get_pay_url(3);
                if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
                    var funcId = cutil.addFunc(function(result){
                        cutil.unlock_ui();
                        cc.log(result);
                        if (result == 'YES') {
                            h1global.curUIMgr.gamehall_ui.updateCharacterCard();
                        }
                    });
                    cutil.lock_ui();
                    jsb.reflection.callStaticMethod("IAPOcBridge", "startPurchWithID:completeHandle:", "60_cards", funcId);
                }
            }
        });
        //购买房卡相关 --end
    },
});