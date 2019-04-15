# -*- coding: utf-8 -*-

import json
import random
import time
import traceback
from datetime import datetime

import const
import switch
import utility
from BaseEntity import BaseEntity
from Functor import Functor
from KBEDebug import *
from entitymembers.PlayerProxy import PlayerProxy
from entitymembers.iRoomRules import iRoomRules
from interfaces.GameObject import GameObject


class GameRoom(BaseEntity, GameObject, iRoomRules):
	"""
	这是一个游戏房间/桌子类
	该类处理维护一个房间中的实际游戏， 例如：斗地主、麻将等
	该房间中记录了房间里所有玩家的mailbox，通过mailbox我们可以将信息推送到他们的客户端。
	"""

	def __init__(self):
		BaseEntity.__init__(self)
		GameObject.__init__(self)
		iRoomRules.__init__(self)

		self.agent = None
		self.roomID = utility.gen_room_id()

		# 状态0：未开始游戏， 1：某一局游戏中
		self.state = const.ROOM_WAITING

		# 存放该房间内的玩家mailbox
		self.players_dict = {}
		self.players_list = [None] * self.player_num
		self.origin_players_list = [None] * self.player_num

		# 庄家index
		self.dealer_idx = -1
		# 对当前打出的牌可以进行操作的玩家的index, 服务端会限时等待他的操作
		# 房间基础轮询timer
		self._poll_timer = None
		# 玩家操作限时timer
		self._op_timer = None
		# 玩家操作限时timer 启动时间
		self._op_timer_timestamp = 0
		# 一局游戏结束后, 玩家准备界面等待玩家确认timer
		self._next_game_timer = None

		self.current_round = 0
		self.last_player_idx = -1
		# 房间开局所有操作的记录(aid, src, [data])
		self.op_record = []
		# 房间开局操作的记录对应的记录id
		self.record_id = -1
		# 确认继续的玩家
		self.confirm_next_idx = []
		# 解散房间操作的发起者
		self.dismiss_room_from = -1
		# 解散房间操作开始的时间戳
		self.dismiss_room_ts = 0
		# 解散房间操作投票状态
		self.dismiss_room_state_list = [0] * self.player_num
		self.dismiss_timer = None
		# 房间创建时间
		self.roomOpenTime = time.time()
		# 玩家操作列表
		self.wait_op_info_list = []
		# 牌局记录
		self.game_result = {}
		# 房间所属的茶楼桌子, 仅茶楼中存在
		self.club_table = None
		# 增加房间销毁定时器
		self.timeout_timer = self.add_timer(const.ROOM_TTL, self.timeoutDestroy)
		# 上一把牛牛的人
		self.last_ten_idx = -1
		# 抢庄倍数(0不抢， 1：一倍....)
		self.fight_dealer_mul_list = [-1] * self.player_num
		# 下注的分数(包含加注分数)
		self.bet_score_list = [0] * self.player_num
		self.cur_allow_op = const.OP_NONE
		# 连胜次数
		self.continuous_win_stats = [0] * self.player_num
		# 续房的标记
		self._continue_room_flag = False
		# 房间开始控制人的座位号
		self.room_controller = -1
		self.init_rules()

	def _reset(self):
		self.room_controller = -1
		self.cur_allow_op = const.OP_NONE
		self.state = const.ROOM_WAITING
		self.agent = None
		self.players_list = [None] * self.player_num
		self.origin_players_list = [None] * self.player_num
		self.continuous_win_stats = [0] * self.player_num
		self.players_dict = {}
		self.dealer_idx = -1
		self._poll_timer = None
		self._op_timer = None
		self._next_game_timer = None
		self.current_round = 0
		self.confirm_next_idx = []
		self.dismiss_timer = None
		self.dismiss_room_ts = 0
		self.dismiss_room_state_list = [0] * self.player_num
		self.wait_op_info_list = []
		KBEngine.globalData["GameWorld"].delRoom(self)
		# 茶楼座位信息变更
		if self.room_type == const.CLUB_ROOM and self.club_table:
			self.club_table.seatInfoChanged()
			self.club_table.room = None
		self.destroySelf()

	def _reset2init(self):
		# Note: 续房的时候代开房的怎么办？
		if self.dismiss_timer:
			self.cancel_timer(self.dismiss_timer)
			self.dismiss_timer = None
		if self._op_timer:
			DEBUG_MSG("{} _reset_not_destroy cancel op timer".format(self.prefixLogStr))
			self.cancel_timer(self._op_timer)
			self._op_timer = None

		self.timeout_timer = self.add_timer(const.ROOM_TTL, self.timeoutDestroy)

		self.cur_allow_op = const.OP_NONE
		self.state = const.ROOM_WAITING
		# self.agent = None
		self.dealer_idx = -1
		self._poll_timer = None
		self._next_game_timer = None
		self.current_round = 0
		self.confirm_next_idx = []
		self.dismiss_timer = None
		self.dismiss_room_ts = 0
		self.dismiss_room_state_list = [0] * self.player_num
		self.wait_op_info_list = []
		self.continuous_win_stats = [0] * self.player_num
		self.game_result = {}
		for p in self.players_list:
			p is not None and p.reset_all()

	@property
	def prefixLogStr(self):
		""" only on Log """
		return 'room:{},curround:{} '.format(self.roomID, self.current_round)

	@property
	def isFull(self):
		count = sum([1 for i in self.players_list if i is not None])
		return count == self.player_num

	@property
	def isEmpty(self):
		count = sum([1 for i in self.players_list if i is not None])
		return count == 0 and self.room_type != const.AGENT_ROOM

	@property
	def playing_players(self):
		""" 房间里正在玩的玩家，不包含观众"""
		return [p for p in self.players_list if p is not None and p.role == const.GAME_ROLE_PLAYER]

	@property
	def room_players(self):
		""" 所有在房间里的玩家 """
		return [p for p in self.players_list if p is not None]

	@property
	def club(self):
		try:
			if self.club_table:
				return self.club_table.club
		except:
			# 引用代理的对象可能已经被destroy, 比如解散茶楼时
			pass
		return None

	@property
	def first_player_idx(self):
		""" 第一个座位号不为空的玩家"""
		for i, j in enumerate(self.players_list):
			if j is not None and j.role == const.GAME_ROLE_PLAYER:
				return i
		return None

	def getSit(self):
		for i, j in enumerate(self.players_list):
			if j is None:
				return i
		return None

	def _get_player_idx(self, avt_mb):
		for i, p in enumerate(self.players_list):
			if p and avt_mb.userId == p.userId:
				return i

	def iter_playing_player(self, func):
		for i, p in enumerate(self.players_list):
			p is not None and p.role == const.GAME_ROLE_PLAYER and func(i, p)

	def sendEmotion(self, avt_mb, eid):
		""" 发表情 """
		# DEBUG_MSG("Room.Player[%s] sendEmotion: %s" % (self.roomID, eid))
		idx = None
		for i, p in enumerate(self.players_list):
			if p and avt_mb == p.mb:
				idx = i
				break
		if idx is None:
			return

		for i, p in enumerate(self.players_list):
			if p and i != idx:
				p.mb.recvEmotion(idx, eid)

	def sendMsg(self, avt_mb, mid, msg):
		""" 发消息 """
		# DEBUG_MSG("Room.Player[%s] sendMsg: %s" % (self.roomID, mid))
		idx = None
		for i, p in enumerate(self.players_list):
			if p and avt_mb == p.mb:
				idx = i
				break
		if idx is None:
			return

		for i, p in enumerate(self.players_list):
			if p and i != idx:
				p.mb.recvMsg(idx, mid, msg)

	def sendExpression(self, avt_mb, fromIdx, toIdx, eid):
		""" 发魔法表情 """
		# DEBUG_MSG("Room.Player[%s] sendEmotion: %s" % (self.roomID, eid))
		idx = None
		for i, p in enumerate(self.players_list):
			if p and avt_mb == p.mb:
				idx = i
				break
		if idx is None:
			return

		for i, p in enumerate(self.players_list):
			if p and i != idx:
				p.mb.recvExpression(fromIdx, toIdx, eid)

	def sendVoice(self, avt_mb, url):
		# DEBUG_MSG("Room.Player[%s] sendVoice" % (self.roomID))
		idx = None
		for i, p in enumerate(self.players_list):
			if p and avt_mb.userId == p.userId:
				idx = i
				break
		if idx is None:
			return

		for i, p in enumerate(self.players_list):
			if p and p.mb:
				p.mb.recvVoice(idx, url)

	def sendAppVoice(self, avt_mb, url, time):
		# DEBUG_MSG("Room.Player[%s] sendVoice" % (self.roomID))
		idx = None
		for i, p in enumerate(self.players_list):
			if p and avt_mb.userId == p.userId:
				idx = i
				break
		if idx is None:
			return

		for i, p in enumerate(self.players_list):
			if p and p.mb and i != idx:
				p.mb.recvAppVoice(idx, url, time)

	def apply_dismiss_room(self, avt_mb):
		""" 游戏开始后玩家申请解散房间 """
		if self.dismiss_timer is not None:
			self.vote_dismiss_room(avt_mb, 1)
			return
		self.dismiss_room_ts = time.time()
		src = None
		for i, p in enumerate(self.players_list):
			if p is not None and p.userId == avt_mb.userId:
				src = p
				break

		if src.role == const.GAME_ROLE_VIEWER:
			DEBUG_MSG("{} apply_dismiss_room: {} viewer not allow".format(self.prefixLogStr, src.idx))
			return

		# 申请解散房间的人默认同意
		self.dismiss_room_from = src.idx
		self.dismiss_room_state_list[src.idx] = 1

		def dismiss_callback():
			self.saveRoomResult()
			self.give_up_record_game()
			# self.dropRoom()
			self.do_drop_room()

		self.dismiss_timer = self.add_timer(const.DISMISS_ROOM_WAIT_TIME, dismiss_callback)

		for p in self.players_list:
			if p and p.mb and p.userId != avt_mb.userId and p.role == const.GAME_ROLE_PLAYER:
				p.mb.req_dismiss_room(src.idx)

	def vote_dismiss_room(self, avt_mb, vote):
		""" 某位玩家对申请解散房间的投票 """
		src = None
		for p in self.players_list:
			if p and p.userId == avt_mb.userId:
				src = p
				break

		if src.role == const.GAME_ROLE_VIEWER:
			DEBUG_MSG("{} vote_dismiss_room: {} viewer not allow".format(self.prefixLogStr, src.idx))
			return

		self.dismiss_room_state_list[src.idx] = vote
		for p in self.players_list:
			if p and p.mb:
				p.mb.vote_dismiss_result(src.idx, vote)

		yes = self.dismiss_room_state_list.count(1)
		no = self.dismiss_room_state_list.count(2)
		# Note: 房间可能存在6人房只有3人开局，这个时候投票人数设定为超过1人不同意及不同意当房间只有有2人时必须全部同意
		if (len(self.playing_players) > 2 and len(self.playing_players) - yes <= 1 and self.player_num > 2) or (len(self.playing_players) == 2 and yes == 2):
			if self.dismiss_timer:
				self.cancel_timer(self.dismiss_timer)
				self.dismiss_timer = None
			self.dismiss_timer = None

			# 玩家牌局记录存盘
			self.saveRoomResult()
			self.give_up_record_game()
			if self.room_type == const.AGENT_ROOM and self.agent:
				self.save_agent_complete_result()
				self.agent.agentRoomDropped(self.roomID)
			# self.dropRoom()
			self.do_drop_room()

		if no >= 2 or (len(self.playing_players) <= 3 and no >= 1):
			if self.dismiss_timer:
				self.cancel_timer(self.dismiss_timer)
				self.dismiss_timer = None
			self.dismiss_timer = None
			self.dismiss_room_from = -1
			self.dismiss_room_ts = 0
			self.dismiss_room_state_list = [0] * self.player_num

	def notify_player_online_status(self, userId, status):
		src = -1
		for idx, p in enumerate(self.players_list):
			if p and p.userId == userId:
				p.online = status
				src = idx
				break

		if src == -1:
			return

		for idx, p in enumerate(self.players_list):
			if p and p.mb and p.userId != userId:
				p.mb.notifyPlayerOnlineStatus(src, status)

	def reqEnterRoom(self, avt_mb, first=False):
		"""
		defined.
		客户端调用该接口请求进入房间/桌子
		"""
		if self.isFull:
			avt_mb.enterRoomFailed(const.ENTER_FAILED_ROOM_FULL)
			return

		if self.room_type == const.CLUB_ROOM:
			if self.club and not self.club.isMember(avt_mb.userId):
				avt_mb.enterRoomFailed(const.ENTER_FAILED_NOT_CLUB_MEMBER)
				return

		if (self.enter_mode == const.ENTERING_MODE_BEFORE_START and self.current_round > 0) or self.state != const.ROOM_WAITING:
			avt_mb.enterRoomFailed(const.ENTER_FAILED_ROOM_STARTING)
			return

		def _check_user_info(content):
			if content is None:
				DEBUG_MSG("{0} userId:{1} enterRoomFailed callback error: content is None".format(self.prefixLogStr, avt_mb.userId))
				if not first:
					avt_mb.enterRoomFailed(const.ENTER_FAILED_NET_SERVER_ERROR)
				return False
			try:
				data = json.loads(content)
				card_cost, diamond_cost = switch.calc_cost(self.game_round, self.getCalCostNeed())
				if card_cost > data["card"]:
					avt_mb.enterRoomFailed(const.ENTER_FAILED_ROOM_DIAMOND_NOT_ENOUGH)
					return False
			except:
				err, msg, stack = sys.exc_info()
				DEBUG_MSG("{0} _check_user_info callback error:{1} , exc_info: {2} ,{3}".format(self.prefixLogStr, content, err, msg))
				avt_mb.enterRoomFailed(const.CREATE_FAILED_OTHER)
				return False
			return True

		def callback():
			if self.state != const.ROOM_WAITING:
				avt_mb.enterRoomFailed(const.ENTER_FAILED_ROOM_STARTING)
				return
			if self.isDestroyed:
				avt_mb.enterRoomFailed(const.ENTER_FAILED_ROOM_DESTROYED)
				return
			if self.isFull:
				avt_mb.enterRoomFailed(const.ENTER_FAILED_ROOM_FULL)
				return
			for i, p in enumerate(self.players_list):
				if p and p.mb and p.mb.userId == avt_mb.userId:
					p.mb = avt_mb
					avt_mb.enterRoomSucceed(self, i)
					return

			DEBUG_MSG("{0} userId:{1} reqEnterRoom".format(self.prefixLogStr, avt_mb.userId))
			idx = self.getSit()
			n_player = PlayerProxy(avt_mb, self, idx)
			self.players_dict[avt_mb.userId] = n_player
			self.players_list[idx] = n_player

			# 茶楼座位信息变更
			if self.club_table:
				self.club_table.seatInfoChanged()
			# 如果进入房间时没有设置过开始按钮控制权
			if self.room_controller == -1:
				self.room_controller = idx
				self.update_room_controller(-1, idx)

			if not first:
				self.broadcastEnterRoom(idx)
			else:
				n_player.role = const.GAME_ROLE_PLAYER
				avt_mb.createRoomSucceed(self)

			# if self.state == const.ROOM_WAITING:
			# 	n_player.role = const.GAME_ROLE_PLAYER

			# 确认准备,不需要手动准备
			# Note: 房主需要确认开始 直接不允许准备
			if self.hand_prepare == const.AUTO_PREPARE and not first:
				self.prepare(avt_mb)

			self.ready_after_prepare()

		if switch.DEBUG_BASE:
			callback()
		else:
			if first or self.pay_mode != const.AA_PAY_MODE:
				callback()
			else:
				def _user_info_callback(content):
					if _check_user_info(content):
						callback()

				utility.get_user_info(avt_mb.accountName, _user_info_callback)

	def client_prepare(self, avt_mb):
		DEBUG_MSG("{0} client_prepare userId:{1}".format(self.prefixLogStr, avt_mb.userId))
		self.prepare(avt_mb)
		self.ready_after_prepare()

	def prepare(self, avt_mb):
		""" 第一局/一局结束后 玩家准备 """
		if self.state == const.ROOM_PLAYING or self.state == const.ROOM_TRANSITION:
			return

		idx = self._get_player_idx(avt_mb)
		if idx == 0:
			count = 0
			for p in self.players_list:
				if p is not None:
					count += 1
			if count == 1:
				DEBUG_MSG("{} only one player".format(self.prefixLogStr))
				return
		self.players_list[idx].role = const.GAME_ROLE_PLAYER
		if idx not in self.confirm_next_idx:
			self.confirm_next_idx.append(idx)
			for p in self.players_list:
				# if p and p.idx != idx:
				# 为了保证自己的状态正确，必须通知自己
				p and p.mb.readyForNextRound(idx)

	def ready_after_prepare(self):
		confirm_count = len(self.confirm_next_idx)
		if self.enter_mode == const.ENTERING_MODE_BEFORE_START:
			# if self.state == const.ROOM_WAITING and confirm_count == self.player_num:
			if self.state == const.ROOM_WAITING and const.MINI_START_PLAYER_NUM <= confirm_count == len(self.room_players):
				self.pay2StartGame()
		else:
			if self.state == const.ROOM_WAITING and const.MINI_START_PLAYER_NUM <= confirm_count == len(self.room_players):
				self.pay2StartGame()

	def cancel_prepare(self, idx):
		if self.state != const.ROOM_WAITING:
			return
		self.players_list[idx].role = const.GAME_ROLE_VIEWER
		idx in self.confirm_next_idx and self.confirm_next_idx.remove(idx)

	def update_room_controller(self, old_idx, new_idx):
		self.cancel_prepare(new_idx)
		for p in self.players_list:
			if p and p.mb:
				p.mb.updateRoomController(old_idx, new_idx)

	def reqReconnect(self, avt_mb):
		DEBUG_MSG("{0} avt_mb reqReconnect userid:{1}".format(self.prefixLogStr, avt_mb.userId))
		if avt_mb.userId not in self.players_dict.keys():
			return

		DEBUG_MSG("{0} avt_mb reqReconnect player:{1} is in room".format(self.prefixLogStr, avt_mb.userId))
		# 如果进来房间后牌局已经开始, 就要传所有信息
		# 如果还没开始, 跟加入房间没有区别
		player = self.players_dict[avt_mb.userId]
		player.mb = avt_mb
		player.online = 1
		if self.state == const.ROOM_PLAYING or 0 < self.current_round <= self.game_round:
			if self.state == const.ROOM_WAITING:
				# 重连回来直接准备
				self.prepare(avt_mb)
			rec_room_info = self.get_reconnect_room_dict(player.mb.userId)
			player.mb.handle_reconnect(rec_room_info)
			if self.state == const.ROOM_WAITING:
				self.ready_after_prepare()
		else:
			sit = 0
			for idx, p in enumerate(self.players_list):
				if p and p.mb and p.mb.userId == avt_mb.userId:
					sit = idx
					break
			avt_mb.enterRoomSucceed(self, sit)
			# 如果是续房后的第一局自动准备，执行准备
			if self._continue_room_flag and self.current_round == 0 and self.hand_prepare == const.AUTO_PREPARE and sit != self.room_controller:
				self.prepare(avt_mb)

	def reqLeaveRoom(self, player):
		"""
		defined.
		客户端调用该接口请求离开房间/桌子
		"""
		DEBUG_MSG("{0} reqLeaveRoom userId:{1}, room_type:{2} , state:{3}".format(self.prefixLogStr, player.userId, self.room_type, self.state))
		if self.state != const.ROOM_WAITING:
			player.quitRoomFailed(-1)
			return

		if player.userId in self.players_dict.keys():
			n_player = self.players_dict[player.userId]
			idx = n_player.idx

			if not (0 < self.current_round <= self.game_round) and idx == 0 and self.room_type == const.NORMAL_ROOM:
				if self._continue_room_flag:
					for i, p in enumerate(self.players_list):
						if i > 0 and p is not None:
							try:
								p.mb.showTip("$房间已解散")
							except:
								pass
				# 房主离开房间, 则解散房间
				self.give_up_record_game()
				# self.dropRoom()
				self.do_drop_room()
			else:
				# Note: 不是第一局的已经准备的玩家不允许调用这个接口  中途加入的玩家点准备后也不允许
				if n_player.role == const.GAME_ROLE_PLAYER and self.current_round > 0:
					DEBUG_MSG("{0} reqLeaveRoom role player not all, userId:{1}, room_type:{2}".format(self.prefixLogStr, player.userId, self.room_type))
					return
				n_player.mb.quitRoomSucceed()
				self.players_list[idx] = None
				del self.players_dict[player.userId]
				if idx in self.confirm_next_idx:
					self.confirm_next_idx.remove(idx)
				# 通知其它玩家该玩家退出房间
				for i, p in enumerate(self.players_list):
					if i != idx and p and p.mb:
						p.mb.othersQuitRoom(idx)

				if idx == self.room_controller and not self.isEmpty:
					for i, p in enumerate(self.players_list):
						if p and p.mb:
							self.update_room_controller(self.room_controller, i)
							self.room_controller = i
							break

		# 茶楼座位信息变更
		if self.room_type == const.CLUB_ROOM and self.club_table:
			self.club_table.seatInfoChanged()

		if self.isEmpty:
			self.give_up_record_game()
			# self.dropRoom()
			self.do_drop_room()

	def dropRoom(self):
		self.dismiss_timer = None
		for i, p in enumerate(self.players_list):
			if p and p.mb:
				try:
					p.mb.quitRoomSucceed()
				except:
					pass

		if self.room_type == const.AGENT_ROOM and self.agent:
			# 将房间从代理房间中删除
			if not self.agent.isDestroyed:
				self.agent.agentRoomDropped(self.roomID)

			try:
				# 如果是代开房, 没打完一局返还房卡
				if switch.DEBUG_BASE == 0 and self.current_round < 1 and self.agent and self.pay_mode == const.AGENT_PAY_MODE:
					card_cost, diamond_cost = switch.calc_cost(self.game_round, self.getCalCostNeed())

					def callback(room_id, user_id, content):
						try:
							content = content.decode()
							if content[0] != '{':
								DEBUG_MSG(content)
								return
							DEBUG_MSG("dropRoom{} AgentRoom, userID = {}. return {} back".format(self.roomID, self.agent.userId, (card_cost, diamond_cost)))
						except:
							DEBUG_MSG("dropRoom{} AgentRoom return Failed, userID = {}. return {} back".format(room_id, user_id, (card_cost, diamond_cost)))

					utility.update_card_diamond(self.agent.accountName, card_cost, diamond_cost,
												Functor(callback, self.roomID, self.agent.userId), "DouPai drop AgentRoomID:{}".format(self.roomID))  # reason 必须为英文
			except:
				pass

		self._reset()

	def do_drop_room(self):
		if self.game_result:
			if len(self.game_result['round_result']) == 0:
				self.dropRoom()
			else:
				self.subtotal_result()
		else:
			self.dropRoom()

	def broadcastOperation2(self, idx, aid, tile_list=None):
		""" 将操作广播除了自己之外的其他人 """
		for i, p in enumerate(self.players_list):
			if p and i != idx:
				p.mb.postOperation(idx, aid, tile_list)

	def broadcastMultiOperation(self, idx_list, aid_list, tile_list=None):
		for i, p in enumerate(self.players_list):
			if p is not None:
				p.mb.postMultiOperation(idx_list, aid_list, tile_list)

	def broadcastRoundEnd(self, info):
		# 广播胡牌或者流局导致的每轮结束信息, 包括算的扎码和当前轮的统计数据

		# 先记录玩家当局战绩, 会累计总得分
		self.record_round_result()

		DEBUG_MSG("{0} broadcastRoundEnd state:{1}".format(self.prefixLogStr, self.state))
		self.state = const.ROOM_WAITING
		info['player_info_list'] = [p.get_round_client_dict() for p in self.players_list if p is not None and p.role == const.GAME_ROLE_PLAYER]

		DEBUG_MSG("{0}=={1}".format(self.prefixLogStr, "&" * 30))
		DEBUG_MSG("{0} RoundEnd info:{1}".format(self.prefixLogStr, info))

		self.confirm_next_idx = []
		for p in self.players_list:
			if p:
				p.mb.roundResult(info)

		self.end_record_game(info)

	def pay2StartGame(self):
		""" 开始游戏 """
		DEBUG_MSG("{} game_mode:{},game_max_lose:{},game_round:{},hand_prepare:{} pay2StartGame state:{}"
				  .format(self.prefixLogStr, self.game_mode, self.game_max_lose, self.game_round, self.hand_prepare, self.state))

		if self.timeout_timer:
			self.cancel_timer(self.timeout_timer)
			self.timeout_timer = None

		self.state = const.ROOM_TRANSITION

		# 仅仅在第1局扣房卡, 不然每局都会扣房卡
		if self.current_round == 0:
			self.origin_players_list = self.players_list[:]
			if switch.DEBUG_BASE != 0:
				self.paySuccessCbk()
				return

			card_cost, diamond_cost = switch.calc_cost(self.game_round, self.getCalCostNeed())
			if self.pay_mode == const.NORMAL_PAY_MODE:
				def pay_callback(content):
					if self._check_pay_callback(content):
						self.paySuccessCbk()

				utility.update_card_diamond(self.origin_players_list[0].mb.accountName, -card_cost, -diamond_cost, pay_callback, "DouPai RoomID:{}".format(self.roomID))
			elif self.pay_mode == const.AGENT_PAY_MODE:
				# 开房的时候已经扣了房卡 续房的时候需要再扣一次，这个时候房卡不足怎么办？
				if self._continue_room_flag:
					def pay_callback(content):
						if self._check_pay_callback(content):
							self.paySuccessCbk()

					utility.update_card_diamond(self.agent.accountName, -card_cost, -diamond_cost, pay_callback, "DouPai RoomID:{}".format(self.roomID))  # reason 必须为英文
			elif self.pay_mode == const.CLUB_PAY_MODE:
				pay_account = self.club.owner['accountName']
				reason = "DouPai Club:{} RoomID:{}".format(self.club.clubId, self.roomID)

				def pay_callback(content):
					if self._check_pay_callback(content):
						self.paySuccessCbk()

				utility.update_card_diamond(pay_account, -card_cost, -diamond_cost, pay_callback, reason)
			elif self.pay_mode == const.AA_PAY_MODE:
				pay_accounts = [p.mb.accountName for p in self.players_list if p is not None and p.role == const.GAME_ROLE_PLAYER]
				if self.club:
					reason = "DouPai Club:{} AA RoomID:{}".format(self.club.clubId, self.roomID)
				else:
					reason = "DouPai AA RoomID:{}".format(self.roomID)

				def pay_callback(content):
					if self._check_aa_pay_callback(content):
						self.paySuccessCbk()

				utility.update_card_diamond_aa(pay_accounts, -card_cost, -diamond_cost, pay_callback, reason)
			else:
				ERROR_MSG("pay2StartGame Error: No this PayMode:{}".format(self.pay_mode))
				return
		else:
			self.paySuccessCbk()

	def _check_aa_pay_callback(self, content):
		res = True
		try:
			ret = json.loads(content)
			if ret['errcode'] != 0:
				res = False
				DEBUG_MSG('room:{},cur_round:{} aa pay callback error code={}, msg={}'.format(self.roomID, self.current_round, ret['errcode'], ret['errmsg']))
		except:
			res = False
			import traceback
			ERROR_MSG(traceback.format_exc())

		if not res:
			self.give_up_record_game()
			self.do_drop_room()
			return False
		return True

	def _check_pay_callback(self, content):
		if content is None or content[0] != '{':
			DEBUG_MSG('{} pay callback {}'.format(self.prefixLogStr, content))
			self.give_up_record_game()
			# self.dropRoom()
			self.do_drop_room()
			return False
		return True

	# 扣房卡/钻石成功后开始游戏(不改动部分)
	def paySuccessCbk(self):
		DEBUG_MSG("{} paySuccessCbk state:{}".format(self.prefixLogStr, self.state))
		# 第一局时房间默认房主庄家, 之后谁上盘赢了谁是, 如果臭庄, 上一把玩家继续坐庄
		swap_list = [-1 if p is None or p.role == const.GAME_ROLE_VIEWER else p.idx for p in self.players_list]
		# if self.current_round == 0:
		# 	self.dealer_idx = 0
		# 	self.swapSeat(swap_list)
		# 	pass
		self.on_before_begin_round()

		def begin(prefab_hand_tiles=None):
			self.state = const.ROOM_PLAYING
			self.initTiles()  # 牌堆
			self.deal(prefab_hand_tiles)  # 发牌
			self.tidy()  # 整理
			self.startGame(swap_list)

		if switch.DEBUG_BASE == 0:
			begin()
		elif switch.DEBUG_BASE == 1:  # 开发模式 除去不必要的通信时间 更接近 真实环境
			begin()
		else:
			def callback(content):
				DEBUG_MSG("{} debugmode,content:{}".format(self.prefixLogStr, content))
				if content is None or content == "10000" or content[0:2] != "ok":  # 10000代表找不到该文件
					begin()
				else:
					try:
						content = content[2:]
						data = json.loads(content)
						DEBUG_MSG("{} data:{}".format(self.prefixLogStr, data))
						hand_tiles = [[] for i in range(self.player_num)]
						for k, v in enumerate(data["handTiles"]):
							k < self.player_num and hand_tiles[k].extend(v)
						begin(hand_tiles)
					except:
						err, msg, stack = sys.exc_info()
						DEBUG_MSG("{} try begin error; exc_info: {}, {}, {}".format(self.prefixLogStr, err, msg, traceback.extract_tb(stack)))

			utility.getDebugPrefab(self.origin_players_list[self.room_controller].mb.accountName, callback)

	# 玩家开始游戏
	def startGame(self, swap_list):
		DEBUG_MSG("{} start game swap_list:{}".format(self.prefixLogStr, swap_list))
		# diceList = self.throwDice([self.dealer_idx])
		# idx, num = self.getMaxDiceIdx(diceList)
		DEBUG_MSG("{} start game info:{} {}".format(self.prefixLogStr, self.dealer_idx, self.bet_score_list))
		for i, p in enumerate(self.players_list):
			if p and p.mb:
				DEBUG_MSG("{} start begin tiles:{}".format(self.prefixLogStr, p.tiles))
				p.mb.startGame(self.dealer_idx, p.tiles, swap_list)
		self.begin_record_game()

		self.do_next_operation()

	def on_before_begin_round(self):
		self.op_record = []
		self.dealer_idx = self.cal_next_dealer(self.dealer_idx)
		# self.state = const.ROOM_PLAYING
		self.cur_allow_op = const.OP_NONE
		self.current_round += 1
		self.fight_dealer_mul_list = list(map(lambda i: -1 if self.players_list[i] and self.players_list[i].role == const.GAME_ROLE_PLAYER else 0, range(0, self.player_num)))

		for p in self.players_list:
			p is not None and p.reset()
		self.bet_score_list = [0] * self.player_num

	def winGame(self, hand_data_list, scores):
		"""
		:param hand_data_list [(poker_type, point), ...] size = player_num
		:param scores: [0,1...] size = player_num
		"""
		DEBUG_MSG("{} winGame: mul {} bet {}".format(self.prefixLogStr, self.fight_dealer_mul_list, self.bet_score_list))
		for i in range(self.player_num):
			if self.players_list[i] is not None and self.players_list[i].role == const.GAME_ROLE_PLAYER:
				p = self.players_list[i]
				if scores[i] > 0:
					self.continuous_win_stats[i] += 1
					p.win_times += 1
				elif scores[i] < 0:
					self.continuous_win_stats[i] = 0
					p.lose_times += 1

				poker_type = hand_data_list[i][0]
				p.poker_type_stats[poker_type] = p.poker_type_stats.get(poker_type, 0) + 1

		self.settlement()
		info = dict()
		info['result_list'] = scores
		info['dealer_idx'] = self.dealer_idx

		self.last_ten_idx = self.cal_last_ten(hand_data_list)

		# self.dealer_idx = self.cal_next_dealer()
		if self.current_round < self.game_round:
			self.broadcastRoundEnd(info)
		else:
			self.endAll(info)

	def begin_record_game(self):
		DEBUG_MSG("{} begin record game".format(self.prefixLogStr))
		self.begin_record_room()
		KBEngine.globalData['GameWorld'].begin_record_room(self, self.roomID, self)

	def begin_record_callback(self, record_id):
		self.record_id = record_id

	def end_record_game(self, result_info):
		DEBUG_MSG("{} end record game".format(self.prefixLogStr))
		KBEngine.globalData['GameWorld'].end_record_room(self.roomID, self, result_info)
		self.record_id = -1

	def give_up_record_game(self):
		DEBUG_MSG("{} give up record game".format(self.prefixLogStr))
		KBEngine.globalData['GameWorld'].give_up_record_room(self.roomID)

	def settlement(self):
		for i, p in enumerate(self.playing_players):
			if p is not None:
				p.settlement()

	def get_continue_list(self, callback, playing_players):
		# 如果时代开房需要检查代理的房卡
		# 如果时房主 需要检查房主放房卡
		# 如果时AA 需要检查所有人的房卡
		card_cost, diamond_cost = switch.calc_cost(self.game_round, self.getCalCostNeed())

		def _check_user_info(user_id, content):
			if self.club and not self.club.isMember(user_id):
				DEBUG_MSG("{0} userId:{1} get_continue_list callback error: not in club {2}".format(self.prefixLogStr, user_id, self.club.clubId))
				return False
			if content is None:
				DEBUG_MSG("{0} userId:{1} get_continue_list callback error: content is None".format(self.prefixLogStr, user_id))
				return False
			try:
				data = json.loads(content)
				if diamond_cost > data["diamond"] and card_cost > data["card"]:
					return False
			except:
				err, msg, stack = sys.exc_info()
				DEBUG_MSG("{0} _check_user_info callback error:{1} {4}, exc_info: {2} ,{3}".format(self.prefixLogStr, content, err, msg, user_id))
				return False
			return True

		def _user_info_callback(user_id, content):
			if _check_user_info(user_id, content):
				callback and callback([const.ROOM_CONTINUE] * self.player_num)
			else:
				callback and callback([const.ROOM_END] * self.player_num)

		if switch.DEBUG_BASE > 0:
			if self.pay_mode == const.CLUB_PAY_MODE:
				if self.club is None:
					callback and callback([const.ROOM_END] * self.player_num)
					return
			callback and callback([random.randint(0, 1) if i % 2 == 0 and i > 0 else 1 for i in range(self.player_num)])
		elif self.room_type == const.AGENT_ROOM and self.agent:
			# user_id = self.agent.userId
			# utility.get_user_info(self.agent.accountName, _user_info_callback)
			# FIXME 代开房时开始按钮控制权和续房检测存在问题，因为房间内的玩家都不是房主
			pass
		elif self.pay_mode == const.NORMAL_PAY_MODE:
			utility.get_user_info(self.players_list[0].mb.accountName, Functor(_user_info_callback, self.players_list[0].mb.userId))
		elif self.pay_mode == const.AA_PAY_MODE:
			count = len(playing_players)
			stats = 0
			result = [const.ROOM_END] * self.player_num
			for p in playing_players:
				result[p.idx] = const.ROOM_CONTINUE

			def _find_idx(user_id):
				for p in playing_players:
					if p.userId == user_id:
						return p.idx
				return -1

			def _check_callback_aa(roomId, user_id, content):
				nonlocal stats
				nonlocal result
				stats += 1
				if not _check_user_info(user_id, content):
					idx = _find_idx(user_id)
					if idx != -1:
						result[idx] = const.ROOM_END
				if count == stats:
					callback and callback(result)

			for p in playing_players:
				utility.get_user_info(p.mb.accountName, Functor(_check_callback_aa, self.roomID, p.userId))
		elif self.pay_mode == const.CLUB_PAY_MODE:
			if self.club is None:
				callback and callback([const.ROOM_END] * self.player_num)
			else:
				pay_account = self.club.owner['accountName']
				utility.get_user_info(pay_account, Functor(_user_info_callback, self.club.owner['userId']))
		else:
			ERROR_MSG("{} get_continue_list: not support {} {}".format(self.prefixLogStr, self.room_type, self.pay_mode))
			callback and callback([0] * self.player_num)

	def endAll(self, info):
		""" 游戏局数结束, 给所有玩家显示最终分数记录 """

		# 先记录玩家当局战绩, 会累计总得分
		self.record_round_result()

		info['player_info_list'] = [p.get_round_client_dict() for p in self.players_list if p is not None and p.role == const.GAME_ROLE_PLAYER]
		player_info_list = [p.get_final_client_dict() for p in self.players_list if p is not None and p.role == const.GAME_ROLE_PLAYER]
		DEBUG_MSG("{} endAll player_info_list = {}  info = {}".format(self.prefixLogStr, player_info_list, info))

		players = self.playing_players

		self.end_record_game(info)
		# 玩家牌局记录存盘
		self.saveRoomResult()
		# 有效圈数加一
		for p in self.players_list:
			if p and p.mb:
				if self.room_type == const.CLUB_ROOM:
					p.mb.addGameCount()

		self._reset2init()
		self.state = const.ROOM_TRANSITION

		def callback(continue_list):
			self.state = const.ROOM_WAITING
			copy_list = self.players_list[:]
			for i, state in enumerate(continue_list):
				if state == const.ROOM_END and self.players_list[i]:
					user_id = self.players_list[i].userId
					self.players_list[i] = None
					del self.players_dict[user_id]
				elif state == 1 and self.players_list[i]:
					if self.hand_prepare == const.AUTO_PREPARE and i != 0:
						self.players_list[i].role = const.GAME_ROLE_PLAYER

			continue_info = {}
			continue_info['init_info'] = self.get_init_client_dict()
			continue_info['continue_list'] = continue_list
			DEBUG_MSG("{} continue info {}".format(self.prefixLogStr, continue_info))
			for i, p in enumerate(copy_list):
				if p and p.mb:
					if continue_info['continue_list'][i] == const.ROOM_END:
						p.mb.room = None
					p.mb.finalResult(player_info_list, info, continue_info)

			# 必须执行完finalResult 再执行prepare 不然剩下的玩家收到的prepare消息再finalResult之前
			# for i, p in enumerate(copy_list):
			# 	if p and p.mb:
			# 		if self.hand_prepare == const.AUTO_PREPARE and continue_list[i] == const.ROOM_CONTINUE and i != 0:
			# 			self.prepare(p.mb)

			# 如果所有玩家都不能继续，则解散房间
			if max(continue_list) == const.ROOM_END:
				if self.room_type == const.AGENT_ROOM and self.agent:
					# 将房间从代理房间中删除
					self.agent.agentRoomDropped(self.roomID)
				self._reset()
			else:
				self._continue_room_flag = True
				if self.room_controller == -1 or (self.room_controller != -1 and continue_list[self.room_controller] == const.ROOM_END):
					for i, s in enumerate(continue_list):
						if s == const.ROOM_CONTINUE:
							self.update_room_controller(self.room_controller, i)
							self.room_controller = i
							break

		self.get_continue_list(callback, players)

	def subtotal_result(self):
		self.dismiss_timer = None
		player_info_list = [p.get_final_client_dict() for p in self.players_list if p is not None]
		DEBUG_MSG("{} subtotal_result,player_info_list:{}".format(self.prefixLogStr, player_info_list))

		for p in self.players_list:
			if p and p.mb:
				try:
					p.mb.subtotalResult(player_info_list)
				except:
					pass
		self._reset()

	def auto_confirm_operation(self):
		self._op_timer = None
		DEBUG_MSG("{} auto_confirm_operation: wait op: {}".format(self.prefixLogStr, len(self.wait_op_info_list)))
		if len(self.wait_op_info_list) == 0:
			return

		for op_dict in self.wait_op_info_list:
			aid = op_dict['aid']
			if op_dict["state"] == const.OP_STATE_WAIT:
				if aid in const.AUTO_CONFIRM_OP_LIST:
					if aid == const.OP_SHOW_CARD:
						state = const.POKER_STATE_NONE
						tiles = list(map(utility.get_poker_num, self.players_list[op_dict['idx']].tiles))
						if any(self.is_poker_type(i, tiles) for i in const.AUTO_COMPUTER_TEN_LIST):
							state = const.POKER_STATE_TEN
						self.selfConfirmOperation(self.players_list[op_dict['idx']].mb, aid, [state], False)
					else:
						self.selfConfirmOperation(self.players_list[op_dict['idx']].mb, aid, [op_dict['data'][0]], False)
				else:
					op_dict['state'] = const.OP_STATE_PASS

	def add_operation_timer(self):
		if self.op_seconds > 0:
			self._op_timer_timestamp = time.time()
			seconds = self.op_seconds
			# 如果操作数为0 表示时第一个操作，需要加上客户端动画时间
			if len(self.op_record) == 0:
				seconds += const.BEGIN_ANIMATION_TIME
			# if self.current_round == 1:
			# 	seconds += const.BEGIN_ANIMATION_TIME

			DEBUG_MSG("{} add_operation_timer: {}".format(self.prefixLogStr, seconds))
			self._op_timer = self.add_timer(seconds, self.auto_confirm_operation)

	def self_confirm_dealer(self):
		""" 确认抢庄结果并广播所有人 """
		max_mul = max(self.fight_dealer_mul_list)
		index = random.randint(0, self.player_num - 1)
		while True:
			if self.fight_dealer_mul_list[index] == max_mul and self.players_list[index] is not None and self.players_list[index].role == const.GAME_ROLE_PLAYER:
				self.dealer_idx = index
				break
			else:
				index = (index + 1) % self.player_num

		self.broadcastOperation(self.dealer_idx, const.OP_CONFIRM_DEALER, [])

	def do_next_operation(self):
		DEBUG_MSG("{} do_next_operation: {}".format(self.prefixLogStr, self.cur_allow_op))

		def cancel():
			if self._op_timer:
				DEBUG_MSG("{} do_next_operation cancel op timer".format(self.prefixLogStr))
				self.cancel_timer(self._op_timer)
				self._op_timer = None

		def on_next_operation():
			cancel()
			self.add_operation_timer()
			self.waitForOperation(self.cur_allow_op)
			for i, p in enumerate(self.players_list):
				if p is not None and p.role == const.GAME_ROLE_PLAYER and self.op_seconds > 0:
					p.mb.showWaitOperationTime()

		if self.cur_allow_op == const.OP_NONE:
			if self.dealer_idx == -1:
				self.cur_allow_op = const.OP_FIGHT_DEALER
			else:
				self.cur_allow_op = const.OP_BET
			on_next_operation()
		if self.cur_allow_op == const.OP_FIGHT_DEALER:
			if min(self.fight_dealer_mul_list) != -1:
				self.self_confirm_dealer()
				self.cur_allow_op = const.OP_BET
				on_next_operation()
		if self.cur_allow_op == const.OP_BET:
			# 当所有玩家都下注才进行下一个动作 排除庄
			if not any(p.can_do_operation(const.OP_BET) for p in self.playing_players):
				if const.MODULE_ADD_BET:
					self.cur_allow_op = const.OP_ADD_BET
					if const.MODULE_CMP_WIN:
						if len(self.playing_players) >= 3:
							self.cur_allow_op |= const.OP_CMP_WIN
				else:
					self.cur_allow_op = const.OP_SHOW_CARD
				on_next_operation()
		if (self.cur_allow_op & const.OP_ADD_BET) == const.OP_ADD_BET:
			players = self.playing_players
			can_add = any(p.can_do_operation(const.OP_ADD_BET) for p in players)
			if not can_add:
				self.cur_allow_op = const.OP_SHOW_CARD
				on_next_operation()
		if self.cur_allow_op == const.OP_SHOW_CARD:
			players = self.playing_players
			can_cmp = all(p.is_show_card for p in players)
			if can_cmp:
				cancel()
				self.cur_allow_op = const.OP_NONE
				hand_data_list, scores = self.cal_win_score()
				self.winGame(hand_data_list, scores)

		DEBUG_MSG("{} do_next_operation: next: {}".format(self.prefixLogStr, self.cur_allow_op))

	def doOperation(self, avt_mb, aid, data):
		"""
		当前可以操作的玩家向服务端确认的操作
		:param data 不同的操作会上传不同的数据，但都是int数组格式
		"""
		idx = self._get_player_idx(avt_mb)
		DEBUG_MSG("{} idx:{} doOperation aid:{} data:{} allow:{}".format(self.prefixLogStr, idx, aid, data, self.cur_allow_op))
		if not self.can_operation(idx, aid):
			DEBUG_MSG("{} idx:{}-role:{} doOperation can not operation aid:{}".format(self.prefixLogStr, idx, self.players_list[idx].role, aid))
			avt_mb.doOperationFailed(const.OP_ERROR_ILLEGAL)
			return
		if self.dismiss_room_ts != 0 and int(time.time() - self.dismiss_room_ts) < const.DISMISS_ROOM_WAIT_TIME:
			# 说明在准备解散投票中,不能进行其他操作
			DEBUG_MSG("{} idx:{} doOperationFailed dismiss_room_ts:{}".format(self.prefixLogStr, idx, self.dismiss_room_ts))
			avt_mb.doOperationFailed(const.OP_ERROR_VOTE)
			return
		if self.state == const.ROOM_WAITING or self.state == const.ROOM_TRANSITION:
			DEBUG_MSG("{} idx:{} doOperationFailed state:{}".format(self.prefixLogStr, idx, self.state))
			avt_mb.doOperationFailed(const.OP_ERROR_STATE)
			return

		# p = self.players_list[idx]
		if aid == const.OP_PASS:
			pass
		elif aid == const.OP_SHOW_CARD and self.can_show_card(idx, data[0]):
			pass
		elif aid == const.OP_FIGHT_DEALER and self.can_fight_dealer(idx):  # 抢庄
			pass
		elif aid == const.OP_BET and self.can_bet(idx, data[0]):  # 下注
			pass
		elif aid == const.OP_ADD_BET and self.can_add_bet(idx, data[0]):  # 加注
			pass
		elif aid == const.OP_EXCHANGE and self.can_exchange(idx, data):  # 换牌
			pass
		elif aid == const.OP_CMP_WIN:  # 比牌
			# poker_type, win_state, points = self.can_win(list(p.tiles), list(self.players_list[data[0]]))
			# DEBUG_MSG("{} idx:{} do OP_CMP_WIN==>{}, {}, {}".format(self.prefixLogStr, idx, points, win_state, points))
			pass
		else:
			avt_mb.doOperationFailed(const.OP_ERROR_ILLEGAL)

	def broadcastOperation(self, idx, aid, tile_list=None):
		"""
		将操作广播给所有人, 包括当前操作的玩家
		:param idx: 当前操作玩家的座位号
		:param aid: 操作id
		:param tile_list: 出牌的list
		"""
		for i, p in enumerate(self.players_list):
			if p is not None:
				p.mb.postOperation(idx, aid, tile_list)

	def confirmOperation(self, avt_mb, aid, data):
		self.selfConfirmOperation(avt_mb, aid, data, True)

	def selfConfirmOperation(self, avt_mb, aid, data, from_client):
		idx = self._get_player_idx(avt_mb)
		DEBUG_MSG("{} idx:{} confirmOperation aid:{} data:{} allow:{}".format(self.prefixLogStr, idx, aid, data, self.cur_allow_op))
		if not self.can_operation(idx, aid):
			DEBUG_MSG("{} idx:{}-role:{} confirmOperation can not operation aid:{}".format(self.prefixLogStr, idx, self.players_list[idx].role, aid))
			avt_mb.doOperationFailed(const.OP_ERROR_ILLEGAL)
			return
		""" 被轮询的玩家确认了某个操作 """
		if self.dismiss_room_ts != 0 and int(time.time() - self.dismiss_room_ts) < const.DISMISS_ROOM_WAIT_TIME:
			# 说明在准备解散投票中,不能进行其他操作
			DEBUG_MSG("{} idx:{} confirmOperation dismiss_room_ts:{}".format(self.prefixLogStr, idx, self.dismiss_room_ts))
			avt_mb.doOperationFailed(const.OP_ERROR_VOTE)
			return

		# 玩家是否可以操作
		DEBUG_MSG("{} idx:{} wait_op_info_list:{}".format(self.prefixLogStr, idx, self.wait_op_info_list))
		if len(self.wait_op_info_list) <= 0 or sum([1 for waitOpDict in self.wait_op_info_list if (waitOpDict["idx"] == idx and waitOpDict["state"] == const.OP_STATE_WAIT)]) <= 0:
			DEBUG_MSG("{} idx:{} confirmOperation not current".format(self.prefixLogStr, idx))
			avt_mb.doOperationFailed(const.OP_ERROR_NOT_CURRENT)
			return

		broadcast = self.broadcastOperation2 if from_client else self.broadcastOperation

		# 有玩家可以操作
		DEBUG_MSG("{} commit {}.".format(self.prefixLogStr, self.wait_op_info_list))
		p = self.players_list[idx]
		if aid == const.OP_FIGHT_DEALER and self.can_fight_dealer(idx):
			self.fight_dealer_mul_list[idx] = data[0]
			self.op_record.append((aid, idx, list(data)))
			p.op_r.append((const.OP_FIGHT_DEALER, [data[0]]))
			broadcast(idx, aid, data)
		elif aid == const.OP_BET and self.can_bet(idx, data[0]):
			self.bet_score_list[idx] += data[0]
			self.op_record.append((aid, idx, list(data)))
			p.op_r.append((const.OP_BET, [data[0]]))
			broadcast(idx, aid, data)
		elif aid == const.OP_ADD_BET and self.can_add_bet(idx, data[0]):
			self.bet_score_list[idx] += data[0]
			p.add_bet_times += 1
			self.op_record.append((aid, idx, list(data)))
			p.op_r.append((const.OP_ADD_BET, [data[0]]))
			broadcast(idx, aid, data)
		elif aid == const.OP_SHOW_CARD and self.can_show_card(idx, data[0]):
			self.op_record.append((aid, idx, list(data)))
			p.show_card(not from_client, data[0])
		elif aid == const.OP_CMP_WIN and self.can_cmp_win(idx, data):
			self.op_record.append((aid, idx, list(data)))
			p.cmp_with_other(data)
		elif aid == const.OP_EXCHANGE and self.can_exchange(idx, data):
			self.op_record.append((aid, idx, list(data)))
			p.exchange_cards(data)
		else:
			ERROR_MSG("{} confirmOperation: not support: idx:{} aid:{}".format(self.prefixLogStr, idx, aid))
			avt_mb.doOperationFailed(const.OP_ERROR_ILLEGAL)
			return
		# 提交 玩家结果
		for waitOpDict in self.wait_op_info_list:
			if waitOpDict["idx"] == idx:
				if waitOpDict['aid'] == aid:
					waitOpDict['state'] = const.OP_STATE_SURE
				elif waitOpDict['aid'] == const.OP_PASS:
					waitOpDict['state'] = const.OP_STATE_PASS

		is_over = all(wait_op_dict['state'] != const.OP_STATE_WAIT for wait_op_dict in self.wait_op_info_list)
		if is_over:
			self.wait_op_info_list = []
			self.do_next_operation()

	def getConfirmOverInfo(self):
		for i in range(len(self.wait_op_info_list)):
			waitState = self.wait_op_info_list[i]["state"]
			if waitState == const.OP_STATE_PASS:
				continue
			elif waitState == const.OP_STATE_WAIT:  # 需等待其他玩家操作
				return False, {}
			elif waitState == const.OP_STATE_SURE:  # 有玩家可以操作
				return True, self.wait_op_info_list[i]
		return True, {}  # 所有玩家选择放弃

	def waitForOperation(self, aid):
		notify_op_list = self.getNotifyOpList(aid)
		if sum([len(x) for x in notify_op_list]) > 0:
			DEBUG_MSG("{} waitForOperation aid:{} ==>notifyOpList:{}".format(self.prefixLogStr, aid, notify_op_list))
			for i, p in enumerate(self.players_list):
				if p is not None and len(notify_op_list[i]) > 0:
					wait_aid_list = [notifyOp["aid"] for notifyOp in notify_op_list[i]]
					data_list = [notifyOp["data"] for notifyOp in notify_op_list[i]]
					p.mb.waitForOperation(wait_aid_list, data_list)
				if p is not None and self.op_seconds > 0 and len(notify_op_list[i]) == 0:
					# 倒计时阶段即使自己没有操作也通知自己
					p.mb.waitForOperation([], [])

		else:
			DEBUG_MSG("{} nobody waitForOperation aid:{}".format(self.prefixLogStr, aid))

	def get_init_client_dict(self):
		return {
			'roomID': self.roomID,
			'ownerId': self.owner_uid,
			'room_type': self.room_type,
			'dealerIdx': self.dealer_idx,
			'curRound': self.current_round,
			'game_round': self.game_round,
			'player_num': self.player_num,
			'pay_mode': self.pay_mode,
			'game_mode': self.game_mode,
			'game_max_lose': self.game_max_lose,
			'hand_prepare': self.hand_prepare,
			'op_seconds': self.op_seconds,
			'room_state': const.ROOM_PLAYING if self.state == const.ROOM_PLAYING else const.ROOM_WAITING,
			'club_id': self.club.clubId if self.club is not None else 0,
			'player_base_info_list': [p.get_init_client_dict() for p in self.players_list if p is not None],
			'player_state_list': [1 if i in self.confirm_next_idx else 0 for i in range(self.player_num)],
			'expand_cards': list(self.expand_cards),
			'room_controller': self.room_controller
		}

	def get_agent_client_dict(self):
		return {
			'roomID': self.roomID,
			'curRound': self.current_round,
			'game_round': self.game_round,
			'pay_mode': self.pay_mode,
			'game_mode': self.game_mode,
			'game_max_lose': self.game_max_lose,
			'player_num': self.player_num,
			'hand_prepare': self.hand_prepare,
			'player_simple_info_list': [p.get_simple_client_dict() for p in self.players_list if p is not None and p.role == const.GAME_ROLE_PLAYER]
		}

	def get_agent_complete_dict(self):
		return {
			'roomID': self.roomID,
			'game_round': self.game_round,
			'pay_mode': self.pay_mode,
			'game_mode': self.game_mode,
			'game_max_lose': self.game_max_lose,
			'player_num': self.player_num,
			'hand_prepare': self.hand_prepare,
			'time': utility.get_cur_timestamp(),
			'player_simple_info_list': [p.get_simple_client_dict() for p in self.players_list if p is not None and p.role == const.GAME_ROLE_PLAYER],
		}

	def get_club_complete_dict(self):
		return {
			'roomID': self.roomID,
			'time': utility.get_cur_timestamp(),
			'player_info_list': [p.get_club_client_dict() for p in self.origin_players_list if p is not None],
		}

	def get_reconnect_room_dict(self, userId):
		dismiss_left_time = const.DISMISS_ROOM_WAIT_TIME - (int(time.time() - self.dismiss_room_ts))
		if self.dismiss_room_ts == 0 or dismiss_left_time >= const.DISMISS_ROOM_WAIT_TIME:
			dismiss_left_time = 0

		idx = 0
		for p in self.players_list:
			if p and p.userId == userId:
				idx = p.idx

		wait_aid_list = []
		wait_data_list = []
		for i in range(len(self.wait_op_info_list)):
			if self.wait_op_info_list[i]["idx"] == idx and self.wait_op_info_list[i]["state"] == const.OP_STATE_WAIT:
				wait_aid_list.append(self.wait_op_info_list[i]["aid"])
				wait_data_list.append(self.wait_op_info_list[i]['data'])
		DEBUG_MSG('{} reconnect_room waitAidList:{}'.format(self.prefixLogStr, wait_aid_list))

		wait_time_left = 0
		if self.op_seconds > 0:
			if len(self.op_record) == 0:
				wait_time_left = int(self.op_seconds + const.BEGIN_ANIMATION_TIME - (time.time() - self._op_timer_timestamp))
			# if self.current_round == 1:
			# 	wait_time_left += const.BEGIN_ANIMATION_TIME
			else:
				wait_time_left = int(self.op_seconds - (time.time() - self._op_timer_timestamp))

		confirm_poker_state_list = [const.POKER_STATE_NONE] * self.player_num
		for i in range(self.player_num):
			if self.players_list[i] is not None and self.players_list[i].role == const.GAME_ROLE_PLAYER:
				confirm_poker_state_list[i] = self.players_list[i].confirm_poker_state

		return {
			'init_info': self.get_init_client_dict(),
			'room_state': const.ROOM_PLAYING if self.state == const.ROOM_PLAYING else const.ROOM_WAITING,
			'player_state_list': [1 if i in self.confirm_next_idx else 0 for i in range(self.player_num)],
			'waitAidList': wait_aid_list,
			'waitDataList': wait_data_list,
			'bet_score_list': self.bet_score_list,
			'fight_dealer_mul_list': self.fight_dealer_mul_list,
			'waitTimeLeft': wait_time_left,
			'applyCloseFrom': self.dismiss_room_from,
			'applyCloseLeftTime': dismiss_left_time,
			'applyCloseStateList': self.dismiss_room_state_list,
			'player_advance_info_list': [p.get_reconnect_client_dict(userId) for p in self.players_list if p is not None],
			'confirm_poker_state_list': confirm_poker_state_list
		}

	def broadcastEnterRoom(self, idx):
		new_p = self.players_list[idx]
		for i, p in enumerate(self.players_list):
			if p is None:
				continue
			if i == idx:
				p.mb.enterRoomSucceed(self, idx)
			else:
				p.mb.othersEnterRoom(new_p.get_init_client_dict())

	def record_round_result(self):
		# 玩家记录当局战绩
		d = datetime.fromtimestamp(time.time())
		round_result_d = {
			'date': '-'.join([str(d.year), str(d.month), str(d.day)]),
			'time': ':'.join([str(d.hour), str(d.minute)]),
			'round_record': [p.get_round_result_info() for p in self.origin_players_list if p],
			'recordId': self.record_id
		}
		self.game_result['round_result'].append(round_result_d)

	def begin_record_room(self):
		# 在第一局的时候记录基本信息
		if self.current_round != 1:
			return
		self.game_result = {
			'game_round': self.game_round,
			'gameMaxLose': self.game_max_lose,
			'roomID': self.roomID,
			'user_info_list': [p.get_basic_user_info() for p in self.origin_players_list if p and p.role == const.GAME_ROLE_PLAYER]
		}
		self.game_result['round_result'] = []

	def save_game_result(self):
		DEBUG_MSG('{} ----- save_game_result ----- len:{}'.format(self.prefixLogStr, len(self.game_result.get('round_result', []))))
		if len(self.game_result['round_result']) > 0:
			result_str = json.dumps(self.game_result)
			for p in self.players_list:
				p and p.save_game_result(result_str)

	def save_agent_complete_result(self):
		DEBUG_MSG('{} ------ save agent complete result -----'.format(self.prefixLogStr))
		d = self.get_agent_complete_dict()
		result_str = json.dumps(d)
		if self.agent:
			if self.agent.isDestroyed:
				import x42
				for k, v in x42.GW.avatars.items():
					if v.userId == self.agent.userId:
						v.saveAgentRoomResult(result_str)
						break
				else:
					ERROR_MSG("{} Save AgentRoom result failed!!! agent.userId = {}".format(self.prefixLogStr, self.agent.userId))
			else:
				self.agent.saveAgentRoomResult(result_str)

	def save_club_result(self):
		DEBUG_MSG('room:{},curround:{} ------ save club result -----'.format(self.roomID, self.current_round))
		d = self.get_club_complete_dict()
		if self.club:
			self.club.saveTableResult(d)

	def saveRoomResult(self):
		# 保存玩家的战绩记录
		self.save_game_result()
		# 保存代理开房的记录
		if self.room_type == const.AGENT_ROOM and self.agent:
			# 代理开房完成记录
			self.save_agent_complete_result()
			# 将房间从代理房间中删除
			self.agent.agentRoomDropped(self.roomID)
		# 保存茶楼的战绩
		if self.room_type == const.CLUB_ROOM:
			self.save_club_result()

	def timeoutDestroy(self):
		INFO_MSG("{} timeout destroyed. room_type = {}, owner_uid = {}".format(self.prefixLogStr, self.room_type, self.owner_uid))
		if self.current_round < 1:
			self.do_drop_room()

	def destroySelf(self):
		self.clear_timers()
		not self.isDestroyed and self.destroy()

	def destroyByServer(self, reason=None):
		# 此接口由GameWorld关服时调用
		self.dismiss_timer = None
		for p in self.players_list:
			if p and p.mb:
				try:
					p.mb.quitRoomSucceed()
					if reason:
						p.mb.showTip(reason)
				except:
					pass

		self.destroySelf()

	def getSeatAbstractInfo(self):
		seat = 0
		for i in range(const.ROOM_PLAYER_NUMBER):
			p = self.players_list[i]
			if p:
				seat |= 2 ** i
		return seat

	def getSeatDetailInfo(self):
		detail = []
		for p in self.players_list:
			if p:
				detail.append(p.get_simple_client_dict())
		return detail

	def getCalCostNeed(self):
		return {
			'game_mode': self.game_mode,
			'pay_mode': self.pay_mode,
			'game_max_lose': self.game_max_lose,
		}
