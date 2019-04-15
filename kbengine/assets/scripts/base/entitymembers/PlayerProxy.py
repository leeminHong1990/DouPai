# -*- coding: utf-8 -*-

import weakref
from functools import cmp_to_key

import const
import utility
from KBEDebug import *


class PlayerProxy(object):

	def __init__(self, avt_mb, owner, idx):
		# 玩家的mailbox
		self.mb = avt_mb
		# 所属的游戏房间
		self.owner = owner if isinstance(owner, weakref.ProxyType) else weakref.proxy(owner)
		# 玩家的座位号
		self.idx = idx
		# 新增一个房主标记位 代开房 和 玩家座位号会发生改变
		self.is_creator = 1 if ((idx == 0 and not self.owner.room_type) or (self.owner.agent and self.userId == self.owner.agent.userId)) else 0
		# 玩家在线状态
		self.online = 1
		# 玩家的手牌
		self.tiles = []
		# 玩家的所有操作记录 (cid, [tiles,])
		# 包括抢庄，下注，加注，比牌，显示牌
		self.op_r = []
		# 玩家在这一局的角色 （观众，参与者）
		self.role = const.GAME_ROLE_VIEWER
		# 是否已经提交显示手牌
		self.is_show_card = False
		# 是否已经和玩家比过牌失败了
		self.is_cmp_lose = False
		self.is_exchanged = False
		# 一局加注次数
		self.add_bet_times = 0
		# 玩家当局的总得分
		self.score = 0
		# 玩家该房间总得分
		self.total_score = 0
		# 胡牌次数
		self.win_times = 0
		# 失败次数
		self.lose_times = 0
		# 每局牌类型的次数
		self.poker_type_stats = {}
		self.confirm_poker_state = const.POKER_STATE_NONE

	# 用于UI显示的信息
	@property
	def head_icon(self):
		DEBUG_MSG("{} PlayerProxy {}: {} get head_icon = {}".format(self.owner.prefixLogStr, self.idx, self.nickname, self.mb.head_icon))
		return self.mb.head_icon

	@property
	def nickname(self):
		return self.mb.name

	@property
	def sex(self):
		return self.mb.sex

	@property
	def userId(self):
		return self.mb.userId

	@property
	def uuid(self):
		return self.mb.uuid

	@property
	def ip(self):
		return self.mb.ip

	@property
	def location(self):
		return self.mb.location

	@property
	def lat(self):
		return self.mb.lat

	@property
	def lng(self):
		return self.mb.lng

	def add_score(self, score):
		if self.owner.game_max_lose > 0 and self.score + score < -self.owner.game_max_lose:
			real_lose = -self.owner.game_max_lose - self.score
			self.score = -self.owner.game_max_lose
			return real_lose
		else:
			self.score += score
			return score

	def settlement(self):
		self.total_score += self.score

	def tidy(self):
		self.tiles = sorted(self.tiles, key=cmp_to_key(utility.poker_compare))

	def reset(self):
		""" 每局开始前重置 """
		self.tiles = []
		self.op_r = []
		self.score = 0
		self.add_bet_times = 0
		self.is_show_card = False
		self.is_cmp_lose = False
		self.is_exchanged = False
		self.confirm_poker_state = const.POKER_STATE_NONE

	def reset_all(self):
		self.reset()
		self.total_score = 0
		self.win_times = 0
		self.lose_times = 0
		self.poker_type_stats = {}
		self.confirm_poker_state = const.POKER_STATE_NONE
		if self.is_creator:
			self.role = const.GAME_ROLE_PLAYER
		else:
			self.role = const.GAME_ROLE_VIEWER

	def get_init_client_dict(self):
		return {
			'nickname': self.nickname,
			'head_icon': self.head_icon,
			'sex': self.sex,
			'idx': self.idx,
			'userId': self.userId,
			'uuid': self.uuid,
			'online': self.online,
			'ip': self.ip,
			'location': self.location,
			'lat': self.lat,
			'lng': self.lng,
			'is_creator': self.is_creator,
			'role': self.role
		}

	def get_simple_client_dict(self):
		return {
			'nickname': self.nickname,
			'head_icon': self.head_icon,
			'sex': self.sex,
			'idx': self.idx,
			'userId': self.userId,
			'uuid': self.uuid,
			'score': self.total_score,
			'is_creator': self.is_creator,
		}

	def get_club_client_dict(self):
		return {
			'nickname': self.nickname,
			'idx': self.idx,
			'userId': self.userId,
			'score': self.total_score,
		}

	def get_round_client_dict(self):
		DEBUG_MSG("{} get_round_client_dict,{},{},{},{}".format(self.owner.prefixLogStr, self.idx, self.tiles, self.score, self.total_score))
		return {
			'idx': self.idx,
			'tiles': self.tiles,
			'score': self.score,
			'total_score': self.total_score,
		}

	def get_final_client_dict(self):
		return {
			'idx': self.idx,
			'win_times': self.win_times,
			'score': self.total_score,
			'lose_times': self.lose_times,
			'type_none_times': self.poker_type_stats[const.POKER_TYPE_NONE] if const.POKER_TYPE_NONE in self.poker_type_stats else 0,
			'type_ten_times': sum(map(lambda x: self.poker_type_stats[x] if x != const.POKER_TYPE_NONE else 0, self.poker_type_stats))
		}

	def get_reconnect_client_dict(self, userId):
		# 掉线重连时需要知道所有玩家打过的牌以及自己的手牌
		return {
			'idx': self.idx,
			'score': self.score,
			'total_score': self.total_score,
			'tiles': self.tiles if userId == self.userId or self.is_show_card else [0] * len(self.tiles),
			'op_list': self.process_op_record(),
			'final_op': self.op_r[-1][0] if len(self.op_r) > 0 else -1,
			'role': self.role,
			'show_state': 1 if self.is_show_card else 0
		}

	def get_round_result_info(self):
		# 记录信息后累计得分
		return {
			'userID': self.userId,
			'score': self.score,
		}

	def get_basic_user_info(self):
		return {
			'userID': self.userId,
			'nickname': self.nickname
		}

	def save_game_result(self, json_result):
		self.mb.saveGameResult(json_result)

	def process_op_record(self):
		""" 处理断线重连时候的牌局记录 """
		ret = []
		# Note: 处理加注记录
		# for i, op in enumerate(self.op_r):
		# 	pass
		return ret

	def can_do_operation(self, aid):
		if aid == const.OP_ADD_BET:
			if self.is_show_card or self.is_cmp_lose or self.add_bet_times >= const.ADD_BET_LIMIT or self.idx == self.owner.dealer_idx:
				return False
		elif aid == const.OP_CMP_WIN:
			if self.is_show_card or self.is_cmp_lose:
				return False
		elif aid == const.OP_SHOW_CARD:
			if self.is_show_card or self.is_cmp_lose:
				return False
		elif aid == const.OP_EXCHANGE:
			if self.is_show_card or self.is_cmp_lose or self.is_exchanged:
				return False
		elif aid == const.OP_BET:
			if self.idx == self.owner.dealer_idx or self.owner.bet_score_list[self.idx] > 0 or self.is_show_card or self.is_cmp_lose:
				return False
		return True

	def show_card(self, notify_all, poker_state):
		""" Note: 下发数组第6位表示u有牛和没牛的确认状态 """
		self.op_r.append((const.OP_SHOW_CARD, [poker_state]))
		self.is_show_card = True
		self.confirm_poker_state = poker_state
		data = list(self.tiles)
		data.append(poker_state)
		if notify_all:
			self.owner.broadcastOperation(self.idx, const.OP_SHOW_CARD, data)
		else:
			self.owner.broadcastOperation2(self.idx, const.OP_SHOW_CARD, data)

	def cmp_with_other(self, other_list):
		"""
		和其他玩家比牌
		:param other_list: []玩家座位号
		"""
		self.op_r.append((const.OP_CMP_WIN, other_list))
		pass

	def exchange_cards(self, cards):
		"""
		交换自己的手牌
		:param cards: []要交换的手牌列表
		"""
		self.op_r.append((const.OP_EXCHANGE, cards))
		self.is_exchanged = True
		self.owner.exchange_cards(self.tiles, cards)
		self.mb.postOperation(self.idx, const.OP_EXCHANGE, self.tiles)
