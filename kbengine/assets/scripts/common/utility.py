# -*- coding: utf-8 -*-
import KBEngine
import hashlib
import itertools
import json
import random
import re
import time
from datetime import datetime, timedelta

import AsyncRequest
import const
import switch
import x42
from KBEDebug import *


def is_same_day(ts1, ts2):
	d1 = datetime.fromtimestamp(ts1)
	d2 = datetime.fromtimestamp(ts2)

	if (d1.year, d1.month, d1.day) == (d2.year, d2.month, d2.day):
		return True
	return False


def gen_uid(count):
	id_s = str(count)
	size = len(id_s)
	ran_num = pow(10, max(6 - size, 0))
	ran_fix = str(random.randint(ran_num, 10 * ran_num - 1))
	return int(ran_fix + id_s)

def gen_club_id(count):
	id_s = str(count)
	size = len(id_s)
	if size < 5:
		for i in range(1000):
			ran_num = pow(10, max(4 - size, 0))
			ran_fix = str(random.randint(ran_num, 10 * ran_num - 1))
			cid = int(ran_fix + id_s)
			if cid not in x42.ClubStub.clubs:
				return cid
	else:
		return count

def gen_room_id():
	if switch.DEBUG_BASE == 1:
		return 99999
	randomId = random.randint(10000, 99999)
	for i in range(89999):
		val = randomId + i
		if val > 99999:
			val = val%100000 + 10000
		if val not in KBEngine.globalData["GameWorld"].rooms:
			return val
	return 99999


def filter_emoji(nickname):
	try:
		# UCS-4
		highpoints = re.compile(u'[\U00010000-\U0010ffff]')
	except re.error:
		# UCS-2
		highpoints = re.compile(u'[\uD800-\uDBFF][\uDC00-\uDFFF]')
	nickname = highpoints.sub(u'', nickname)
	return nickname


# 发送网络请求
def get_user_info(accountName, callback):
	ts = int(time.mktime(datetime.now().timetuple()))
	tosign = accountName + "_" + str(ts) + "_" + switch.PHP_SERVER_SECRET
	m1 = hashlib.md5()
	m1.update(tosign.encode())
	sign = m1.hexdigest()
	url = switch.PHP_SERVER_URL + 'user_info_server'
	suffix = '?timestamp=' + str(ts) + '&unionid=' + accountName + '&sign=' + sign
	AsyncRequest.Request(url + suffix, lambda x: callback(x))

def get_is_proxy(accountName, callback):
	ts = get_cur_timestamp()
	to_sign = accountName + "_" + str(ts) + "_" + switch.PHP_SERVER_SECRET
	sign = get_md5(to_sign)
	url = switch.PHP_SERVER_URL + 'is_proxy'
	suffix = '?timestamp=' + str(ts) + '&unionid=' + accountName + '&sign=' + sign
	AsyncRequest.Request(url + suffix, lambda x: callback(x))

def update_card_diamond(accountName, deltaCard, deltaDiamond, callback, reason = ""):
	ts = get_cur_timestamp()
	to_sign = accountName + "_" + str(ts) + "_" + str(deltaCard) + "_" + str(deltaDiamond) + "_" + switch.PHP_SERVER_SECRET
	# DEBUG_MSG("to sign::" + to_sign)
	sign = get_md5(to_sign)
	# DEBUG_MSG("MD5::" + sign)
	url = switch.PHP_SERVER_URL + 'update_card_diamond'
	data = {
		"timestamp" : ts,
		"delta_card" : deltaCard,
		"delta_diamond" : deltaDiamond,
		"unionid" : accountName,
		"sign" : sign,
		"reason" : reason
	}
	AsyncRequest.Post(url, data, lambda x: callback(x))


def update_card_diamond_aa(accountList, deltaCard, deltaDiamond, callback, reason=""):
	ts = get_cur_timestamp()
	account_json = json.dumps(accountList)
	to_sign = account_json + "_" + str(ts) + "_" + str(deltaCard) + "_" + str(deltaDiamond) + "_" + switch.PHP_SERVER_SECRET
	# DEBUG_MSG("to sign::" + to_sign)
	sign = get_md5(to_sign)
	# DEBUG_MSG("aa MD5::" + sign)
	url = switch.PHP_SERVER_URL + 'update_card_diamond_aa'
	data = {
		"timestamp": ts,
		"delta_card": deltaCard,
		"delta_diamond": deltaDiamond,
		"unionids": account_json,
		"sign": sign,
		"reason": reason
	}
	AsyncRequest.Post(url, data, lambda x: callback(x))

def update_valid_account(accountName, callback):
	to_sign = accountName + "_" + switch.PHP_SERVER_SECRET
	# DEBUG_MSG("to sign::" + to_sign)
	sign = get_md5(to_sign)
	# DEBUG_MSG("valid MD5::" + sign)
	url = switch.PHP_SERVER_URL + 'update_valid'
	data = {
		"unionid": accountName,
		"sign": sign,
	}
	AsyncRequest.Post(url, data, lambda x: callback(x))


def get_md5(data):
	m = hashlib.md5()
	m.update(data.encode())
	return m.hexdigest()


def get_cur_timestamp():
	return int(time.time())

def update_data_statistics(ts, avatar_num, online_num, room_num, callback):
	to_sign = const.GAME_NAME + "_" + str(ts) + "_" + str(avatar_num) + "_" + str(online_num) + "_" + str(room_num) + "_"  + switch.PHP_SERVER_SECRET
	# INFO_MSG("stats to sign::" + to_sign)
	sign = get_md5(to_sign)
	# INFO_MSG("stats MD5::" + sign)
	url = switch.PHP_SERVER_URL + 'update_data_statistics'
	data = {
		"game_name": const.GAME_NAME,
		"timestamp": ts,
		"avatar_num": avatar_num,
		"online_num": online_num,
		"room_num": room_num,
		"sign": sign,
	}
	AsyncRequest.Post(url, data, lambda x: callback(x))

def update_dau(dau, callback):
	ts = get_cur_timestamp()
	to_sign = const.GAME_NAME + "_" + str(ts) + "_" + str(dau) + "_" + switch.PHP_SERVER_SECRET
	# INFO_MSG("dau to sign::" + to_sign)
	sign = get_md5(to_sign)
	# INFO_MSG("dau MD5::" + sign)
	url = switch.PHP_SERVER_URL + 'update_dau'
	data = {
		"game_name": const.GAME_NAME,
		"timestamp": ts,
		"num": dau,
		"sign": sign,
	}
	AsyncRequest.Post(url, data, lambda x: callback(x))

# 获取测试模式 初始信息
def getDebugPrefab(owner, callback):
	ts = int(time.mktime(datetime.now().timetuple()))
	url = '{}?timestamp={}&from=py&game={}&owner={}'.format(switch.PHP_DEBUG_URL, ts, const.DEBUG_JSON_NAME, owner)
	AsyncRequest.Request(url, lambda x: callback(x))


def valid_poker(cards):
	return all(c in const.POKERS for c in cards)


def get_poker_color(value):
	"""
	花色： 黑桃 4 红桃 3 草花 2 方块 1
	"""
	return (value & 0x0000ff00) >> 8


def get_poker_num(value):
	return value & 0x000000ff


def to_poker(color, num):
	return (color << 8) | num


def parse_poker_card(value):
	return get_poker_color(value), get_poker_num(value)


def plus_pokers(pokers):
	return sum(map(get_poker_num, pokers))


############################### 斗牛规则 ##################################
"""
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
"""


def poker_compare(a, b):
	color1, num1 = parse_poker_card(a)
	color2, num2 = parse_poker_card(b)
	if num1 == num2:
		return color1 - color2
	return num1 - num2


def poker_list_compare(a, b):
	if len(a) != len(b):
		raise Exception("poker_list_compare: must a.len == b.len")
	from functools import cmp_to_key
	hand_cards = sorted(a, reverse=True, key=cmp_to_key(poker_compare))
	other_hand_cards = sorted(b, reverse=True, key=cmp_to_key(poker_compare))
	for i in range(len(hand_cards)):
		cmp = poker_compare(hand_cards[i], other_hand_cards[i])
		if cmp != 0:
			return cmp
	return 0


DRAGON = [1, 2, 3, 4, 5]


def is_dragon(cards):
	"""
	一条龙 [1,2,3,4,5]
	:return:
	"""
	return const.POKER_TYPE_DRAGON, sorted(cards) == DRAGON, 0


def is_bomb(cards):
	"""
	炸弹 5张牌有4张牌一样
	:return:
	"""
	groups = itertools.groupby(sorted(cards))
	points = None
	flag = False
	for key, group in groups:
		# Note: group 不能重复使用
		if len(tuple(group)) == 4:
			if points is not None:
				return const.POKER_TYPE_BOMB, True, points
			flag = True
		else:
			points = key
	if flag:
		return const.POKER_TYPE_BOMB, True, points
	return const.POKER_TYPE_BOMB, False, 0


def is_calf(cards):
	"""
	五小 5张牌都小于5,并且全部加起来小于10
	:return:
	"""
	point = sum(cards)
	return const.POKER_TYPE_CALF, point <= 10 and max(cards) <= 5, point


def is_flower4(cards):
	"""
	四花 5张牌中一张为10，另外4张为花（如10，J，J，Q，K）
	:return:
	"""
	cards = sorted(cards)
	if cards[0] == 10:
		return const.POKER_TYPE_FLOWER4, True, 10
	return const.POKER_TYPE_FLOWER4, False, 0


def is_flower5(cards):
	"""
	五花 5张牌全为花（如Q，J，J，Q，K）
	:return:
	"""
	for card in cards:
		if card < 11:
			return const.POKER_TYPE_FLOWER5, False, 0
	return const.POKER_TYPE_FLOWER5, True, 10


def is_ten(cards):
	"""
	牛 5张牌中的任意3张加起来为10的倍数，且另外2张也为10的倍数
	:return:
	"""
	cards = tuple(map(lambda c: 10 if c > 10 else c, cards))
	items = itertools.combinations(cards, 3)
	target = None
	for item in items:
		if sum(item) % 10 == 0:
			target = item
			break
	if target:
		p = sum(cards) % 10
		return const.POKER_TYPE_TEN, True, 10 if p == 0 else p
	return const.POKER_TYPE_TEN, False, 0


POKER_TYPE_DICT = {
	const.POKER_TYPE_TEN: is_ten,
	const.POKER_TYPE_FLOWER4: is_flower4,
	const.POKER_TYPE_FLOWER5: is_flower5,
	const.POKER_TYPE_CALF: is_calf,
	const.POKER_TYPE_BOMB: is_bomb,
	const.POKER_TYPE_DRAGON: is_dragon
}


########################################################################

def cheat(src):
	value = random.random()
	result = []
	if value > const.POKER_WEIGHT:
		result.append(src.pop())
		result.append(src.pop())
		need_point = 10 - plus_pokers(result) % 10
		cards = list(filter(lambda x: get_poker_num(x) >= 10 if need_point == 10 else get_poker_num(x) == need_point, src))
		select = 0
		for card in cards:
			if need_point == 10 and get_poker_num(card) >= 10:
				select = card
				break
			if get_poker_num(card) == need_point:
				select = card
				break
		if select == 0:
			select = src[0]
		result.append(select)
		src.remove(select)

		if value > const.POKER_WEIGHT_7:
			c = src.pop()
			result.append(c)
			need_point = 7 - c
			select = 0
			for card in src:
				if get_poker_num(card) > need_point:
					select = card
					break
			result.append(select)
			src.remove(select)
	return result

def get_seconds_till_n_days_later(begin, day, hour=0, minute=0, second=0):
	""" 获取第几天后的几点几分几秒的delta_time """
	dt = timedelta(days=day, hours=hour - begin.hour, minutes=minute - begin.minute, seconds=second - begin.second)
	seconds = dt.total_seconds()
	seconds = 0 if seconds <= 0 else seconds
	return seconds

def getRoomParams(create_dict):
	return {
		'base_score'			: create_dict['base_score'],
		'game_round'			: create_dict['game_round'],
		'game_mode'				: create_dict['game_mode'],
		'expand_cards'			: create_dict['expand_cards'],
		'mul_mode'				: create_dict['mul_mode'],
		'enter_mode'			: create_dict['enter_mode'],
		'player_num'			: create_dict['player_num'],
		'hand_prepare'			: create_dict['hand_prepare'],
		'op_seconds'			: create_dict['op_seconds'],
		'room_type'				: create_dict['room_type'],
		'pay_mode'				: create_dict['pay_mode'],
	}

def isValidUid(uid):
	if not isinstance(uid, int):
		return False
	if len(str(uid)) != 7:
		return False
	return True
