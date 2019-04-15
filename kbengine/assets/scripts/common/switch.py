# -*- coding: utf-8 -*-
DB_NAME = "kbe_DOUPAI"

PUBLISH_VERSION = 0

DEBUG_BASE = 2  # 0 真实环境 1 调试环境 2 测试环境

PHP_SERVER_URL = 'http://192.168.1.29:9981/api/'
PHP_SERVER_SECRET = "zDYnetiVvFgWCRMIBGwsAKaqPOUjfNXS"
ACCOUNT_LOGIN_SECRET = "KFZ<]~ct(uYHM%#LABX<>>O6-N(~F#GM"  # 登录校验的密钥

PHP_DEBUG_URL = 'http://192.168.1.29:9081/index.php'

CLUB_CARD_MIN	= 24
CLUB_CARD_WARN	= 100

# 计算消耗
def calc_cost(game_round, game_mode):
	import const
	pay_mode = game_mode['pay_mode']
	basic = 4
	if pay_mode == const.AA_PAY_MODE:
		basic = 1

	cost = max(int(game_round / 10), 1) * basic
	return cost, 999999
