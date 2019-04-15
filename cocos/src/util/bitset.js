// copy from java BitSet
var BitSet = cc.Class.extend({
    ctor: function () {
        this.addressBitsPerWord = 6;
        this.words = [];
    },

    wordIndex: function (pos) {
        return pos >> this.addressBitsPerWord;
    },

    set: function (pos) {
        this.words[this.wordIndex(pos)] |= (1 << pos);
    },

    clear: function (pos) {
        this.words[this.wordIndex(pos)] &= ~(1 << pos);
    },

    get: function (pos) {
        return (this.words[this.wordIndex(pos)] & 1 << pos) != 0

    },
});
