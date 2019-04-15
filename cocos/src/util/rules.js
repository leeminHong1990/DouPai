"use strict";
var rules = function () {
};
/*
    牌型：一条龙> 炸弹> 五小 > 五花 > 四花 > 牛牛 > 有分 > 没分
    花色： 黑桃 > 红桃 > 草花 > 方块
    单张：K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3 > 2 > A
    无牛：比单张大小。
    有牛：比分数大小，牛九 > 牛八 > 牛七 > 牛六 > 牛五 > 牛四 > 牛三 > 牛二 > 牛一。
    牛牛：比单张+花色大小。
    四花：比单张+花色大小。
    五花：比单张+花色大小。
    五小：比点数+单张+花色大小。（有些地区不支持。）
    炸弹：大牌吃小牌，K最大，A最小。
*/

rules.get_poker_color = function (value) {
    return (value & 0x0000ff00) >>> 8;
};

rules.get_poker_num = function (value) {
    return value & 0x000000ff;
};
rules.to_poker = function (color, num) {
    return (color << 8) | num;
};

rules.poker_compare = function (a, b) {
    let color1 = rules.get_poker_color(a);
    let num1 = rules.get_poker_num(a);
    let color2 = rules.get_poker_color(b);
    let num2 = rules.get_poker_num(b);
    if (num1 === num2) {
        return color1 - color2;
    }
    return num1 - num2;
};

rules.POKER_NUM_STRING_DICT = {
    1: "1",
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: '10',
    11: 'J',
    12: 'Q',
    13: 'K',
    14: '$',
    15: '$',
};

rules.get_poker_string = function (value) {
    let num = rules.get_poker_num(value);
    return rules.POKER_NUM_STRING_DICT[num];
};

rules.DRAGON = [1, 2, 3, 4, 5];
// 一条龙 [1,2,3,4,5]
rules.is_dragon = function (cards) {
    cards = cards.slice(0);
    cards.sort(collections.compare);
    for (var i = 0; i < cards.length; i++) {
        if (cards[i] !== rules.DRAGON[i]) {
            return [const_val.POKER_TYPE_DRAGON, false, 0];
        }
    }
    return [const_val.POKER_TYPE_DRAGON, true, 0]
};

//炸弹 5张牌有4张牌一样
rules.is_bomb = function (cards) {
    let dict = collections.groupBy(cards);
    let points = 0;
    let flag = false;
    for (var c in dict) {
        if (dict[c] === 4) {
            flag = true;
        } else {
            points = parseInt(c);
        }
    }
    return [const_val.POKER_TYPE_BOMB, flag, flag ? points : 0];
};

//五小 5张牌都小于5,并且全部加起来小于10
rules.is_calf = function (cards) {
    let points = collections.sum(cards);
    return [const_val.POKER_TYPE_CALF, points <= 10 && collections.max(cards) <= 5, points];
};

//四花 5张牌中一张为10，另外4张为花（如10，J，J，Q，K）
rules.is_flower4 = function (cards) {
    cards = cards.slice(0);
    cards.sort(collections.compare);
    if (cards[0] === 10) {
        return [const_val.POKER_TYPE_FLOWER4, true, 10];
    }
    return [const_val.POKER_TYPE_FLOWER4, false, 0];
};

//五花 5张牌全为花（如Q，J，J，Q，K）
rules.is_flower5 = function (cards) {
    for (var i = 0; i < cards.length; i++) {
        if (cards[i] < 11) {
            return [const_val.POKER_TYPE_FLOWER5, false, 0];
        }
    }
    return [const_val.POKER_TYPE_FLOWER5, true, 10];
};

//牛 5张牌中的任意3张加起来为10的倍数，且另外2张也为10的倍数
rules.is_ten = function (cards) {
    cards = collections.map(cards, function (a) {
        return Math.min(10, a);
    });
    var target = null;
    collections.combinations(cards, 3, function (arr) {
        if (collections.sum(arr) % 10 === 0) {
            target = arr;
            return true;
        }
    });

    if (target === null) {
        return [const_val.POKER_TYPE_TEN, false, 0];
    } else {
        let points = collections.sum(cards) % 10;
        points = points !== 0 ? points : 10;
        return [const_val.POKER_TYPE_TEN, true, points];
    }
};

rules.POKER_TYPE_DICT = {};
rules.POKER_TYPE_DICT[const_val.POKER_TYPE_TEN] = rules.is_ten;
rules.POKER_TYPE_DICT[const_val.POKER_TYPE_FLOWER4] = rules.is_flower4;
rules.POKER_TYPE_DICT[const_val.POKER_TYPE_FLOWER5] = rules.is_flower5;
rules.POKER_TYPE_DICT[const_val.POKER_TYPE_CALF] = rules.is_calf;
rules.POKER_TYPE_DICT[const_val.POKER_TYPE_BOMB] = rules.is_bomb;
rules.POKER_TYPE_DICT[const_val.POKER_TYPE_DRAGON] = rules.is_dragon;
