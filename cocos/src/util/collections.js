"use strict";
var collections = function () {

};

collections.batch_replace = function (array, val, repVal) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === val) {
            array[i] = repVal
        }
    }
};

collections.batch_delete = function (array, val) {
    for (var i = array.length - 1; i >= 0; i--) {
        if (array[i] === val) {
            array.splice(i, 1)
        }
    }
};

collections.shuffle = function (arr) {
    for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x) ;
    return arr;
};


/**
 * 将一个数组排列组合输出
 * @param arr
 * @param count 组合长度
 * @param callback
 */
collections.combinations = function (arr, count, callback) {
    if (count < 2) {
        return;
    }

    function moveNext(bs, m) {
        var start = -1;
        while (start < m) {
            start++;
            if (bs.get(start)) {
                break;
            }
        }
        if (start >= m)
            return false;

        var end = start;
        while (end < m) {
            end++;
            if (!bs.get(end)) {
                break;
            }
        }
        if (end >= m)
            return false;
        for (var i = start; i < end; i++) {
            bs.clear(i);
        }
        for (var j = 0; j < end - start - 1; j++) {
            bs.set(j);
        }
        bs.set(end);
        return true;
    }

    var m = arr.length;
    if (m < count) {
        cc.error("arrayCombinations: m < n ", arr, count);
        return;
    }
    var bs = new BitSet();
    for (var i = 0; i < count; i++) {
        bs.set(i)
    }

    do {
        var out = [];
        for (var j = 0; j < arr.length; j++) {
            if (bs.get(j)) {
                out.push(arr[j])
            }
        }
        if (callback && callback(out)) {
            return;
        }
    } while (moveNext(bs, m))
};

collections.sum = function (arr) {
    let length = arr.length;
    if (length === 0) {
        return 0;
    }
    if (length === 1) {
        return arr[0];
    }
    let s = 0;
    for (var i = 0; i < length; i++) {
        s += arr[i];
    }
    return s;
};
collections.compare = function (a, b) {
    return a - b;
};

collections.max = function (arr, compareFn) {
    let length = arr.length;
    if (length === 0) {
        return null;
    }
    if (length === 1) {
        return arr[0];
    }
    compareFn = compareFn || collections.compare;
    let max = arr[0];
    for (var i = 1; i < length; i++) {
        if (compareFn(arr[i], max) > 0) {
            max = arr[i];
        }
    }
    return max;
};

collections.min = function (arr, compareFn) {
    let length = arr.length;
    if (length === 0) {
        return null;
    }
    if (length === 1) {
        return arr[0];
    }
    compareFn = compareFn || collections.compare;
    let min = arr[0];
    for (var i = 1; i < length; i++) {
        if (compareFn(arr[i], min) < 0) {
            min = arr[i];
        }
    }
    return min;
};

collections.contains = function (arr, element) {
    if (cc.isArray(arr)) {
        return arr.indexOf(element) >= 0;
    } else {
        for (var i in arr) {
            if (arr[i] === element) {
                return true;
            }
        }
        return false;
    }
};

collections.binarySearch = function (targetList, val, func) {
    func = func || function (x, val) {
        return val - x;
    };
    var curIndex = 0;
    var fromIndex = 0;
    var toIndex = targetList.length - 1;
    while (toIndex > fromIndex) {
        curIndex = Math.floor((fromIndex + toIndex) / 2);
        if (func(targetList[curIndex], val) < 0) {
            toIndex = curIndex;
        } else if (func(targetList[curIndex], val) > 0) {
            fromIndex = curIndex + 1;
        } else if (func(targetList[curIndex], val) === 0) {
            return curIndex + 1;
        }
    }
    return toIndex;
};

collections.count = function (arr, element) {
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === element) {
            sum++;
        }
    }
    return sum;
};

//获取同样牌的张数 dict
collections.groupBy = function (arr) {
    var tileDict = {};
    for (var i = 0; i < arr.length; i++) {
        var t = arr[i];
        if (!tileDict[t]) {
            tileDict[t] = 1
        } else {
            tileDict[t] += 1
        }
    }
    return tileDict
};

collections.map = function (arr, func) {
    var newArr = [];
    for (var i = 0; i < arr.length; i++) {
        newArr.push(func(arr[i]));
    }
    return newArr;
};

collections.any = function (arr, func) {
    for (var i = 0; i < arr.length; i++) {
        if (func(arr[i]) === true) {
            return true;
        }
    }
    return false;
};

collections.all = function (arr, func) {
    for (var i = 0; i < arr.length; i++) {
        let result = func(arr[i]);
        if (cc.isUndefined(result) || result == null || result === false) {
            return false;
        }
    }
    return true;
};