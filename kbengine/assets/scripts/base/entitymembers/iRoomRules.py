# -*- coding: utf-8 -*-

import random

import const
import utility
from functools import cmp_to_key
from KBEDebug import *


class iRoomRules(object):

	def __init__(self):
		# 房间的牌堆
		self.tiles = []
		self.rules = []

	def swapSeat(self, swap_list):
		random.shuffle(swap_list)
		for i in range(len(swap_list)):
			self.players_list[i] = self.origin_players_list[swap_list[i]]

		for i, p in enumerate(self.players_list):
			if p is not None:
				p.idx = i

	def initTiles(self):
		self.tiles = list(const.POKERS)
		self.shuffle_tiles()

	def init_rules(self):
		# expand_cards: 特殊牌型 花牛×5 炸弹牛×6 五小牛×8 [poker type]
		expand_cards = self.expand_cards
		if len(expand_cards) == 0:
			self.rules.append(utility.is_ten)
		else:
			for poker_type in sorted(expand_cards, reverse=True):
				self.rules.append(utility.POKER_TYPE_DICT[poker_type])

	def shuffle_tiles(self):
		random.shuffle(self.tiles)
		DEBUG_MSG("{} shuffle tiles:{}".format(self.prefixLogStr, self.tiles))

	def deal(self, prefabHandTiles):
		""" 发牌 """
		if prefabHandTiles is not None:
			for i, p in enumerate(self.playing_players):
				if p is not None and len(prefabHandTiles) >= 0:
					p.tiles = prefabHandTiles[i] if len(prefabHandTiles[i]) <= const.INIT_TILE_NUMBER else prefabHandTiles[i][0:const.INIT_TILE_NUMBER]
			all_tiles = []
			for i, p in enumerate(self.playing_players):
				p is not None and all_tiles.extend(p.tiles)
			for t in all_tiles:
				t in self.tiles and self.tiles.remove(t)
			for i in range(const.INIT_TILE_NUMBER):
				for j, p in enumerate(self.playing_players):
					if len(p.tiles) >= const.INIT_TILE_NUMBER:
						continue
					p.tiles.append(self.tiles.pop(0))
		else:
			for i, p in enumerate(self.playing_players):
				cheat_cards = utility.cheat(self.tiles)
				size = len(cheat_cards)
				if size > 0:
					p.tiles.extend(cheat_cards)

				if const.INIT_TILE_NUMBER - size > 0:
					for j in range(const.INIT_TILE_NUMBER - size):
						pop = self.tiles.pop(0)
						p.tiles.append(pop)

		for i, p in enumerate(self.players_list):
			p is not None and DEBUG_MSG("{} idx:{} deal tiles:{}".format(self.prefixLogStr, i, p.tiles))

	def tidy(self):
		""" 整理 """
		for i in range(self.player_num):
			self.players_list[i] and self.players_list[i].role == const.GAME_ROLE_PLAYER and self.players_list[i].tidy()

	def throwDice(self, idxList):
		# diceList = [[0, 0] for i in range(self.player_num)]
		# for i in range(len(diceList)):
		# 	if i in idxList:
		# 		diceList[i][0] = random.randint(1, 6)
		# 		diceList[i][1] = random.randint(1, 6)
		# return diceList
		pass

	def exchange_cards(self, cards, target):
		DEBUG_MSG("{} exchange_cards {} - {}".format(self.prefixLogStr, cards, target))
		count = len(target)
		self.tiles.extend(target)
		self.shuffle_tiles()
		for i in range(0, count):
			cards.remove(target[i])
			cards.append(self.tiles.pop(0))

	def can_operation(self, idx, aid):
		return (self.cur_allow_op & aid) == aid and self.players_list[idx].role == const.GAME_ROLE_PLAYER

	def can_show_card(self, idx, data):
		return (self.cur_allow_op & const.OP_SHOW_CARD) == const.OP_SHOW_CARD and (not self.players_list[idx].is_show_card) and data in const.POKER_STATE

	def can_exchange(self, idx, data):
		return (self.cur_allow_op & const.OP_EXCHANGE) == const.OP_EXCHANGE and all(c in self.players_list[idx].tiles for c in data)

	def can_add_bet(self, idx, score):
		return (self.cur_allow_op & const.OP_ADD_BET) == const.OP_ADD_BET and self.players_list[idx].add_bet_times < const.ADD_BET_LIMIT and self.dealer_idx != idx

	def can_bet(self, idx, score):
		return (self.cur_allow_op & const.OP_BET) == const.OP_BET and self.bet_score_list[idx] == 0 and score > 0 and self.dealer_idx != idx

	def can_fight_dealer(self, idx):
		return (self.cur_allow_op & const.OP_FIGHT_DEALER) == const.OP_FIGHT_DEALER and self.fight_dealer_mul_list[idx] == -1

	def can_cmp_win(self, idx, others):
		return (self.cur_allow_op & const.OP_CMP_WIN) == const.OP_CMP_WIN and all(not self.players_list[idx].is_show_card for i in others)

	def getNotifyOpList(self, aid):
		# notifyOpList 和 self.wait_op_info_list 必须同时操作
		# 数据结构：问询玩家，操作类型，状态，数据
		notify_op_list = [[] for i in range(self.player_num)]
		self.wait_op_info_list = []

		def operation(index, player):
			if player.is_show_card:
				return
			op_dict = None
			if (aid & const.OP_FIGHT_DEALER) == const.OP_FIGHT_DEALER:
				op_dict = {"idx": index, "data": const.FIGHT_DEALER_MUL, "aid": const.OP_FIGHT_DEALER, "state": const.OP_STATE_WAIT}
			if (aid & const.OP_SHOW_CARD) == const.OP_SHOW_CARD:
				op_dict = {"idx": index, "data": const.POKER_STATE, "aid": const.OP_SHOW_CARD, "state": const.OP_STATE_WAIT}
			if (aid & const.OP_BET) == const.OP_BET:  # 下注
				if self.bet_score_list[index] > 0:
					return
				if self.dealer_idx != index:
					scores = list(self.base_score)
					if self.continuous_win_stats[index] > 1 and const.MODULE_RANDOM_SCORE:
						scores.append(self.base_score[-1] * random.randint(2, 6))
					op_dict = {"idx": index, "data": scores, "aid": const.OP_BET, "state": const.OP_STATE_WAIT}
			if (aid & const.OP_ADD_BET) == const.OP_ADD_BET:  # 加注
				if player.add_bet_times < const.ADD_BET_LIMIT and self.dealer_idx != index:
					op_dict = {"idx": index, "data": list(self.base_score), "aid": const.OP_ADD_BET, "state": const.OP_STATE_WAIT}
			elif (aid & const.OP_EXCHANGE) == const.OP_EXCHANGE:  # 换牌
				op_dict = {"idx": index, "data": list(player.tiles), "aid": const.OP_EXCHANGE, "state": const.OP_STATE_WAIT}
			elif (aid & const.OP_CMP_WIN) == const.OP_CMP_WIN:  # 比牌
				op_dict = {"idx": index, "data": list(map(lambda p: p.idx, filter(lambda p: p.can_do_operation(const.OP_CMP_WIN), self.playing_players))), "aid": const.OP_CMP_WIN, "state": const.OP_STATE_WAIT}
			if op_dict is not None:
				notify_op_list[index].append(op_dict)
				self.wait_op_info_list.append(op_dict)

		self.iter_playing_player(operation)
		return notify_op_list

	def cal_next_dealer(self, cur_dealer):
		def random_dealer():
			players = self.playing_players
			dealer_player = players[random.randrange(0, len(players))]
			return self.players_list.index(dealer_player)

		if self.game_mode == const.GAME_MODE_RANDOM:
			return random_dealer()
		if self.game_mode == const.GAME_MODE_BULLFIGHT:
			if self.last_ten_idx == -1:
				# Note: 如果没有人牛牛， 连庄
				if cur_dealer == -1:
					cur_dealer = self.first_player_idx
				if self.players_list[cur_dealer] is None:
					cur_dealer = self.first_player_idx
				return cur_dealer
			else:
				return self.last_ten_idx
		if self.game_mode == const.GAME_MODE_FIXED:
			return self.first_player_idx
		if self.game_mode == const.GAME_MODE_DEALER or self.game_mode == const.GAME_MODE_SEEN_DEALER:
			return -1
		if self.game_mode == const.GAME_MODE_LOOP:
			index = cur_dealer
			index = (index + 1) % self.player_num
			count = self.player_num + 2
			while count > 0:
				count -= 1
				if self.players_list[index] is not None and self.players_list[index].role == const.GAME_ROLE_PLAYER:
					return index
				index = (index + 1) % self.player_num
		ERROR_MSG("{} not support game mode {}".format(self.prefixLogStr, self.game_mode))
		return self.first_player_idx

	def match_poker_type(self, idx, hand_cards):
		if const.MODULE_CONFIRM_POKER_STATE and self.players_list[idx].confirm_poker_state == const.POKER_STATE_NONE:
			return const.POKER_TYPE_NONE, 0
		for rule in self.rules:
			poker_type, state, points = rule(hand_cards)
			if state:
				return poker_type, points
		return const.POKER_TYPE_NONE, 0

	def can_win(self, my_idx, hand_cards, other_idx, other_hand_cards):
		my_type, my_points = self.match_poker_type(my_idx, list(map(utility.get_poker_num, hand_cards)))
		other_type, other_points = self.match_poker_type(other_idx, list(map(utility.get_poker_num, other_hand_cards)))

		if my_type - other_type == 0:
			if my_points - other_points > 0:
				return True, my_type, my_points
			elif my_points - other_points < 0:
				return False, my_type, my_points
			else:
				cmp = utility.poker_list_compare(hand_cards, other_hand_cards)
				if cmp > 0:
					return True, my_type, my_points
				elif cmp < 0:
					return False, my_type, my_points
				ERROR_MSG("{} invalid cards: my:{} other:{}".format(self.prefixLogStr, hand_cards, other_hand_cards))
				raise Exception("invalid cards")
		elif my_type - other_type < 0:
			return False, my_type, my_points
		return True, my_type, my_points

	def cal_win_score(self):
		dealer = self.players_list[self.dealer_idx]
		result = [0] * self.player_num
		hand_data_list = [[] for i in range(self.player_num)]
		dealer_mul = max(1, self.fight_dealer_mul_list[self.dealer_idx])
		# expand_cards: 特殊牌型 花牛×5 炸弹牛×6 五小牛×8
		# mul_mode: 翻倍规则 牛牛×4 牛九×3 牛八×2 牛七×2	牛牛×3 牛九×2 牛八×2  10->0 [4,3,2]
		hand_data_list[self.dealer_idx] = self.match_poker_type(self.dealer_idx, list(map(utility.get_poker_num, dealer.tiles)))
		for i, p in enumerate(self.players_list):
			if p is not None and p != dealer and p.role == const.GAME_ROLE_PLAYER:
				hand_data_list[i] = self.match_poker_type(i, list(map(utility.get_poker_num, p.tiles)))
				is_win, poker_type, points = self.can_win(self.dealer_idx, dealer.tiles, i, p.tiles)
				if is_win:
					# 计算牌型翻倍
					if poker_type in const.EXPAND_CARDS_MUL:
						card_mul = const.EXPAND_CARDS_MUL[poker_type]
					else:
						index = 10 - points
						card_mul = self.mul_mode[index] if index < len(self.mul_mode) else 1
					result[i] -= self.bet_score_list[i] * dealer_mul * card_mul
					result[self.dealer_idx] += self.bet_score_list[i] * dealer_mul * card_mul
				else:
					# 计算牌型翻倍
					if hand_data_list[i][0] in const.EXPAND_CARDS_MUL:
						card_mul = const.EXPAND_CARDS_MUL[hand_data_list[i][0]]
					else:
						index = 10 - hand_data_list[i][1]
						card_mul = self.mul_mode[index] if index < len(self.mul_mode) else 1
					result[i] += self.bet_score_list[i] * dealer_mul * card_mul
					result[self.dealer_idx] -= self.bet_score_list[i] * dealer_mul * card_mul

		DEBUG_MSG("{} cal_win_score: {} {} {}".format(self.prefixLogStr, self.dealer_idx, result, hand_data_list))

		for i, p in enumerate(self.players_list):
			if p is not None and p.role == const.GAME_ROLE_PLAYER:
				p.add_score(result[i])

		return hand_data_list, result

	def cal_last_ten(self, hand_data_list):
		""" 取牛最大的一个"""
		target_data = max(filter(lambda x: len(x) != 0, hand_data_list))
		if target_data[0] <= const.POKER_TYPE_TEN and target_data[1] < 10:
			DEBUG_MSG("{} last ten:  -1".format(self.prefixLogStr))
			return -1
		count = hand_data_list.count(target_data)

		if count == 1:
			last_ten_idx = hand_data_list.index(target_data)
		else:
			indexs = []
			tile_list = []
			for i, item in enumerate(hand_data_list):
				if item == target_data:
					indexs.append(i)
					tile_list.append(self.players_list[i].tiles)

			max_tiles = max(tile_list, key=cmp_to_key(utility.poker_list_compare))
			last_ten_idx = indexs[tile_list.index(max_tiles)]
		DEBUG_MSG("{} last ten:{}".format(self.prefixLogStr, last_ten_idx))
		return last_ten_idx

	def is_poker_type(self, target_type, hand_cards):
		expands = self.expand_cards
		if target_type in expands:
			if utility.POKER_TYPE_DICT[target_type](hand_cards)[1]:
				return True
		return False
