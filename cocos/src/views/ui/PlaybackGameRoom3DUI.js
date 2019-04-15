"use strict"
var PlaybackGameRoom3DUI = GameRoom3DUI.extend({
    ctor: function () {
        this._super();
        this.playbackGame = new PlaybackGameRoom(this);
        this.addChild(this.playbackGame)
    },

    initUI: function () {
        this._super();
        this.playbackGame.init()
    },

    update_playback_operation_panel: function (serverSitNum, op_dict, doOP) {
    }
});