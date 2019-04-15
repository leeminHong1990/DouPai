# -*- coding: utf-8 -*-
import KBEngine
from KBEDebug import *
import const
import utility
import json
import switch
import x42


class iRoomOperation(object):
	""" 玩家游戏相关 """

	def __init__(self):
		self.room = None
		# 当前正在创建房间时再次请求创建需要拒绝
		self.req_entering_room = False

	@property
	def isInRoom(self):
		if self.room is None:
			return False
		return self.room.isDestroyed == False

	def createRoom(self, create_room_dict):
		"""
		base_score: (1/2   2/4   3/6 ) ( 1/2/3/4   2/4/6/8   3/6/9/12 )
		expand_cards: 特殊牌型 花牛×5 炸弹牛×6 五小牛×8 [poker_type,...] in ALL_POKER_TYPE
		mul_mode: 翻倍规则 牛牛×4 牛九×3 牛八×2 牛七×2	牛牛×3 牛九×2 牛八×2  10->0 [4,3,2]
		enter_mode: 中途加入 0:不允许 1：允许
		"""
		DEBUG_MSG("create room, {}, {}".format(create_room_dict, self.req_entering_room))
		base_score = tuple(create_room_dict['base_score'])
		game_round = create_room_dict['game_round']
		game_mode = create_room_dict['game_mode']
		expand_cards = create_room_dict['expand_cards']
		mul_mode = create_room_dict['mul_mode']
		enter_mode = create_room_dict['enter_mode']
		player_num = create_room_dict['player_num']
		hand_prepare = create_room_dict['hand_prepare']
		op_seconds = create_room_dict['op_seconds']
		room_type = create_room_dict['room_type']
		pay_mode = create_room_dict['pay_mode']
		if game_round not in const.GAME_ROUND \
			or game_mode not in const.GAME_MODE \
			or base_score not in const.BASE_SCORE[game_mode] \
			or not (i in const.ALL_POKER_TYPE for i in expand_cards) \
			or len(mul_mode) > 10 \
			or enter_mode not in const.ENTERING_MODE \
			or player_num not in const.ROOM_PLAYER_NUMBER_LIST \
			or hand_prepare not in const.PREPARE_MODE \
			or op_seconds not in const.OP_SECONDS \
			or pay_mode not in (const.NORMAL_PAY_MODE, const.AA_PAY_MODE, const.AGENT_PAY_MODE) \
			or room_type not in (const.NORMAL_ROOM, const.AGENT_ROOM):
			return
		if self.req_entering_room:
			return
		if self.isInRoom:
			self.createRoomFailed(const.CREATE_FAILED_ALREADY_IN_ROOM)
			return

		# 检查代开房上限
		if room_type == const.AGENT_ROOM:
			if not self.isAgent:
				self.createRoomFailed(const.CREATE_FAILED_PERMISSION_DENIED)
				return
			if len(self.playingRoomList) >= const.AGENT_ROOM_LIMIT:
				self.createRoomFailed(const.CREATE_FAILED_AGENT_ROOM_LIMIT)
				return

		self.req_entering_room = True

		def callback(content):
			if content is None:
				DEBUG_MSG("createRoom callback error: content is None, user id {}".format(self.userId))
				self.createRoomFailed(const.CREATE_FAILED_NET_SERVER_ERROR)
				return
			try:
				DEBUG_MSG("cards response: {}".format(content))
				if content[0] != '{':
					self.createRoomFailed(const.CREATE_FAILED_NET_SERVER_ERROR)
					return
				data = json.loads(content)
				card_cost, diamond_cost = switch.calc_cost(game_round, {"game_mode": game_mode, "game_max_lose": 999999, 'pay_mode': pay_mode})
				if not KBEngine.globalData["GameWorld"].free_play and card_cost > data["card"] and diamond_cost > data["diamond"]:
					self.createRoomFailed(const.CREATE_FAILED_NO_ENOUGH_CARDS)
					return
				params = {
					# 基本必填信息
					'owner_uid': self.userId,
					'player_num': player_num,
					# client 2 svr
					'game_mode': game_mode,
					'base_score': base_score,
					'expand_cards': expand_cards,
					'mul_mode': mul_mode,
					'enter_mode': enter_mode,
					'op_seconds': op_seconds,

					'game_max_lose': 999999,
					'game_round': game_round,
					'hand_prepare': hand_prepare,

					'pay_mode': pay_mode,
					'room_type': room_type,
				}
				KBEngine.createBaseAnywhere("GameRoom", params, self.createRoomCallback)
			except:
				err, msg, stack = sys.exc_info()
				DEBUG_MSG("createRoom callback error:{} , exc_info: {} ,{}".format(content, err, msg))
				self.createRoomFailed(const.CREATE_FAILED_OTHER)

		if switch.DEBUG_BASE or KBEngine.globalData["GameWorld"].isDailyActFree:
			callback('{"card":99, "diamond":9999}')
		else:
			utility.get_user_info(self.accountName, callback)

	def createRoomCallback(self, room, err=None):
		DEBUG_MSG("createRoomCallback")
		if room:
			if room.room_type == const.AGENT_ROOM:
				if room.pay_mode == const.AGENT_PAY_MODE:
					def callback(content):
						self.req_entering_room = False
						try:
							if content is None or content[0] != '{':
								DEBUG_MSG("agent consume callback error: content is None or error, room id {} ,content: {}".format(room.roomID, content))
								# 此处应当执行退款逻辑
								room.destroySelf()
								return
							room.agent = self
							x42.GW.addRoom(room)
							self.playingRoomList.append(room.roomID)
							self.getPlayingRoomInfo(True)
						except:
							DEBUG_MSG("agent consume callback error:{}".format(content))
							# 此处应当执行退款逻辑
							room.destroySelf()
							return

					card_cost, diamond_cost = switch.calc_cost(room.game_round, room.getCalCostNeed())
					if switch.DEBUG_BASE:
						callback('{"card":99, "diamond":9999}')
					else:
						# 开房失败应当需要退款
						utility.update_card_diamond(self.accountName, -card_cost, -diamond_cost, callback, "YiWu RoomID:{}".format(room.roomID))  # reason 必须为英文
				elif room.pay_mode == const.AA_PAY_MODE:
					self.req_entering_room = False
					room.agent = self
					x42.GW.addRoom(room)
					self.playingRoomList.append(room.roomID)
					self.getPlayingRoomInfo(True)
			else:
				room.reqEnterRoom(self, True)
		else:
			self.createRoomFailed(const.CREATE_FAILED_OTHER)

	def createRoomSucceed(self, room):
		self.req_entering_room = False
		self.room = room
		x42.GW.addRoom(room)
		info = room.get_init_client_dict()
		if getattr(self, 'client', None):
			self.client.createRoomSucceed(info)

	def createRoomFailed(self, err):
		self.req_entering_room = False
		if getattr(self, 'client', None):
			self.client.createRoomFailed(err)

	# c2s
	def enterRoom(self, roomID):
		if self.req_entering_room:
			DEBUG_MSG("iRoomOperation: enterRoom failed; entering or creating room")
			return
		if self.isInRoom:
			self.enterRoomFailed(const.ENTER_FAILED_ALREADY_IN_ROOM)
			return
		self.req_entering_room = True
		KBEngine.globalData["GameWorld"].enterRoom(roomID, self)

	def enterRoomSucceed(self, room, idx):
		self.req_entering_room = False
		self.room = room
		info = room.get_init_client_dict()
		DEBUG_MSG(info)
		# DEBUG_MSG('@' * 30)
		if getattr(self, 'client', None):
			self.client.enterRoomSucceed(idx, info)

	def enterRoomFailed(self, err):
		self.req_entering_room = False
		if getattr(self, 'client', None):
			self.client.enterRoomFailed(err)

	def othersEnterRoom(self, player_info):
		if getattr(self, 'client', None):
			self.client.othersEnterRoom(player_info)

	def othersQuitRoom(self, idx):
		if getattr(self, 'client', None):
			self.client.othersQuitRoom(idx)

	# c2s
	def quitRoom(self):
		if self.room:
			# if 0 < self.room.current_round <= self.room.game_round:
			# 	return
			KBEngine.globalData["GameWorld"].quitRoom(self.room.roomID, self)

	def quitRoomSucceed(self):
		DEBUG_MSG('avatar[%d] quit room succeed!' % self.userId)
		self.room = None
		if getattr(self, 'client', None):
			self.client.quitRoomSucceed()

	def quitRoomFailed(self, err):
		if getattr(self, 'client', None):
			self.client.quitRoomFailed(err)

	def startGame(self, dealer_idx, tile_list, swap_list):
		if getattr(self, 'client', None):
			self.client.startGame(dealer_idx, tile_list, swap_list)

	def postOperation(self, idx, aid, data):
		if getattr(self, 'client', None):
			self.client.postOperation(idx, aid, data)

	def postAllowOperation(self, aid_list, data_list):
		"""
		下发自己当前允许执行的操作 [加注，下注，抢庄...]
		:param aid_list: [aid]
		:param data_list: [data] -> data is []
		"""
		if getattr(self, 'client', None):
			self.client.postAllowOperation(aid_list, data_list)

	def postMultiOperation(self, idx_list, aid_list, tile_list):
		if getattr(self, 'client', None):
			self.client.postMultiOperation(idx_list, aid_list, tile_list)

	# c2s
	def doOperation(self, aid, data):
		if self.room:
			self.room.doOperation(self, aid, data)

	def doOperationFailed(self, err):
		if getattr(self, 'client', None):
			self.client.doOperationFailed(err)

	def waitForOperation(self, aid_list, tile_list):
		if getattr(self, 'client', None):
			self.client.waitForOperation(aid_list, tile_list)

	# c2s
	def confirmOperation(self, aid, tile_list):
		if self.room:
			self.room.confirmOperation(self, aid, tile_list)

	def roundResult(self, round_info):
		if getattr(self, 'client', None):
			self.client.roundResult(round_info)

	def finalResult(self, player_info_list, round_info, continue_info):
		# self.room = None
		if getattr(self, 'client', None):
			self.client.finalResult(player_info_list, round_info, continue_info)

	def subtotalResult(self, player_info_list):
		self.room = None
		if getattr(self, 'client', None):
			self.client.subtotalResult(player_info_list)

	# c2s
	def prepare(self):
		if self.room:
			self.room.client_prepare(self)

	# c2s
	def upLocationInfo(self, location, lat, lng):
		DEBUG_MSG("upLocationInfo, {0}, {1}, {2}".format(location, lat, lng))
		self.location = location
		self.lat = lat
		self.lng = lng

	def readyForNextRound(self, idx):
		if getattr(self, 'client', None):
			self.client.readyForNextRound(idx)

	def saveGameResult(self, json_r):
		# 保存玩家房间牌局战绩, 只保留最近10条记录
		DEBUG_MSG("saveGameResult: {}".format(len(self.game_history)))
		self.game_history.append(json_r)

		length = len(self.game_history)
		if length > const.MAX_HISTORY_RESULT:
			new_h = []
			for s in self.game_history:
				new_h.append(s)
			self.game_history = new_h[-const.MAX_HISTORY_RESULT:]

		self.writeToDB()
		if getattr(self, 'client', None):
			self.client.pushGameRecordList([json.loads(json_r)])

	# c2s
	def sendEmotion(self, eid):
		if self.room:
			self.room.sendEmotion(self, eid)

	# c2s
	def sendMsg(self, mid, msg):
		if self.room:
			self.room.sendMsg(self, mid, msg)

	# c2s
	def sendExpression(self, fromIdx, toIdx, eid):
		if self.room:
			self.room.sendExpression(self, fromIdx, toIdx, eid)

	# c2s
	def sendVoice(self, url):
		if self.room:
			self.room.sendVoice(self, url)

	# c2s
	def sendAppVoice(self, url, time):
		if self.room:
			self.room.sendAppVoice(self, url, time)

	def recvEmotion(self, idx, eid):
		if getattr(self, 'client', None):
			self.client.recvEmotion(idx, eid)

	def recvMsg(self, idx, mid, msg):
		if getattr(self, 'client', None):
			self.client.recvMsg(idx, mid, msg)

	def recvExpression(self, fromIdx, toIdx, eid):
		if getattr(self, 'client', None):
			self.client.recvExpression(fromIdx, toIdx, eid)

	def recvVoice(self, idx, url):
		if getattr(self, 'client', None):
			self.client.recvVoice(idx, url)

	def recvAppVoice(self, idx, url, time):
		if getattr(self, 'client', None):
			self.client.recvAppVoice(idx, url, time)

	def process_reconnection(self):
		DEBUG_MSG("iRoomOperation:(%i): client reconnect!" % (self.id))
		if self.room:
			self.room.reqReconnect(self)

	def handle_reconnect(self, rec_room_info):
		if getattr(self, 'client', None):
			self.client.handleReconnect(rec_room_info)

	# c2s
	def applyDismissRoom(self):
		""" 申请解散房间 """
		if self.room:
			self.room.apply_dismiss_room(self)

	def req_dismiss_room(self, idx):
		""" 广播有人申请解散房间 """
		if getattr(self, 'client', None):
			# DEBUG_MSG("call client reqDismissRoom {0}".format(idx))
			self.client.reqDismissRoom(idx)

	# c2s
	def voteDismissRoom(self, vote):
		""" 解散房间投票操作 """
		if self.room:
			self.room.vote_dismiss_room(self, vote)

	def vote_dismiss_result(self, idx, vote):
		""" 广播投票结果 """
		if getattr(self, 'client', None):
			# DEBUG_MSG("call client voteDismissResult {0}->{1}".format(idx, vote))
			self.client.voteDismissResult(idx, vote)

	# s2c
	def notifyPlayerOnlineStatus(self, idx, status):
		""" 玩家上线, 下线通知 """
		DEBUG_MSG("call client notifyPlayerOnlineStatus {0}->{1}".format(idx, status))
		if getattr(self, 'client', None):
			self.client.notifyPlayerOnlineStatus(idx, status)

	def showWaitOperationTime(self):
		getattr(self, 'client', None) and self.client.showWaitOperationTime()

	# c2s
	def getPlayingRoomInfo(self, from_create=False):
		result = []
		for id in self.playingRoomList:
			room = x42.GW.rooms.get(id)
			if room is not None:
				d = room.get_agent_client_dict()
				result.append(d)

		DEBUG_MSG("getPlayingRoomInfo from_create = {}, result = {}".format(from_create, result))
		if from_create:
			getattr(self, 'client', None) and self.client.createAgentRoomSucceed(result)
		else:
			getattr(self, 'client', None) and self.client.gotPlayingRoomInfo(result)

	def updatePlayingRoomList(self):
		removed = []
		for id in self.playingRoomList:
			if id not in x42.GW.rooms:
				removed.append(id)

		for id in removed:
			self.playingRoomList.remove(id)

	def checkCompleteRoomList(self):
		length = len(self.completeRoomList)
		if length > const.COMPLETE_ROOM_LIMIT:
			new_h = []
			for s in self.completeRoomList:
				new_h.append(s)
			self.completeRoomList = new_h[-const.COMPLETE_ROOM_LIMIT:]

	# c2s
	def getCompleteRoomInfo(self):
		result = [json.loads(json_s) for json_s in self.completeRoomList]
		DEBUG_MSG("getCompleteRoomInfo", result)
		getattr(self, 'client', None) and self.client.gotCompleteRoomInfo(result)

	# c2s
	def agentDismissRoom(self, room_id):
		if room_id in self.playingRoomList:
			room = x42.GW.rooms.get(room_id)
			if room.state == const.ROOM_WAITING:
				room.do_drop_room()
				self.getPlayingRoomInfo()
			else:
				self.showTip("游戏已经开始，不能解散。")

	def agentRoomDropped(self, room_id):
		if room_id in self.playingRoomList:
			self.playingRoomList.remove(room_id)

	def saveAgentRoomResult(self, result):
		# DEBUG_MSG("before saveAgentRoomResult length = {}, list = {}".format(len(self.completeRoomList), self.completeRoomList))
		self.completeRoomList.append(result)
		# DEBUG_MSG("after  saveAgentRoomResult length = {}, list = {}".format(len(self.completeRoomList), self.completeRoomList))

		length = len(self.completeRoomList)
		if length > const.COMPLETE_ROOM_LIMIT:
			new_h = []
			for s in self.completeRoomList:
				new_h.append(s)
			self.completeRoomList = new_h[-const.COMPLETE_ROOM_LIMIT:]

		if getattr(self, "client", None) is None and len(self.playingRoomList) == 0:
			self.destroySelf()

	def updateRoomController(self, old_idx, new_idx):
		getattr(self, 'client', None) and self.client.updateRoomController(old_idx, new_idx)
