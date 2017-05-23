//@ts-check
/// <reference path="type.d.ts" />

let { getRoomNumber } = require('./room_number_getter');

let keywords = {
	new_account: ['上门安装', '安装', '新装', '报装'],
	new_account_atleast: 2,

	user_fuck: ['投诉'],
	user_fuck_atleast: 1,

	from_cmcc_important: ['CMCC', '移动工单'],
	from_cmcc_important_atleast: 1,

	from_cmcc: ['移动工单', '感知平台', '家庭宽带业务', '10086', '重启MODEM'],
	from_cmcc_atleast: 2,

	from_unicom: ['@16900.gd', 'ZSZJLAN', '张琳', '联通'],
	from_unicom_atleast: 1
}

let ticketType = ['', '工单', '新装', '投诉'],
	ticketTypeMap = {'工单': 1, '新装': 2, '投诉': 3};

/**
 * @param {string} text
 * @returns {APIRequestCommitTicket}
 */
function analyze(text) {
	/**
	 * @type {APIRequestCommitTicket}
	 */
	//@ts-ignore
	let result = {};
	
	result.situation_order = getTicketType(text);
	result.situation_order_string = ticketType[result.situation_order];
	result.work_area = getWorkArea(text);
	result.operator = getOperator(text);
	result.dormitory_number = getRoomNumber(text);

	let phone = getPhoneNumbers(text);
	result.telephone_number = phone.main;
	result.more_phone_number = phone.other;
	
	result.account_number = getAccount(text) || result.telephone_number;

	result.introduction = getIntroduction(text);
	
	result.status = 0;

	return result;
}

/**
 * @param {string} text 
 * @returns {number}
 */
function getTicketType(text) {
	//1公单 2新装 3投诉
	if (keywords.new_account.map(v => hasSubString(text, v)).map(bool2num).reduce(APlusB, 0)	
		>= keywords.new_account_atleast)
		return 2;//新装	
	if (keywords.user_fuck.map(v => hasSubString(text, v)).map(bool2num).reduce(APlusB, 0)
		>= keywords.user_fuck_atleast)
		return 3;//投诉
	return 1; //工单
}

/**
 * @param {string} text 
 * @returns {string}
 */
function getWorkArea(text) {
	if (hasSubString(text, '6期公寓') || hasSubString(text, '朝晖')) return '朝晖苑';
	if (hasSubString(text, '香晖苑') || text.match(/\b[A-Da-d]单元/) ) return '香晖苑';
	if (hasSubString(text, '凤翔') || text.match(/\b[1-6](栋|\-)/)) return '凤翔';

	if (hasSubString(text, '北门') || text.match(/\b([7-9]|1[01])(栋|\-)/)) return '北门';
	if (hasSubString(text, '岐头') || text.match(/\b1[6-9](栋|\-)/)) return '岐头';
	if (hasSubString(text, '东门') || text.match(/\b(1[2-5]|20|21)(栋|\-)/)) return '东门';
	if (hasSubString(text, '别墅')) return '香山别墅';

	return '';
}

function getOperator(text) {
	if (keywords.from_cmcc_important.map(v => hasSubString(text, v)).map(bool2num).reduce(APlusB, 0)	
		>= keywords.from_cmcc_important_atleast)
		return '中国移动';
	if (keywords.from_cmcc.map(v => hasSubString(text, v)).map(bool2num).reduce(APlusB, 0)	
		>= keywords.from_cmcc_atleast)
		return '中国移动';
	if (keywords.from_unicom.map(v => hasSubString(text, v)).map(bool2num).reduce(APlusB, 0)	
		>= keywords.from_unicom_atleast)
		return '中国联通';
	return '中国电信';
}

function getPhoneNumbers(text) {
	let count = {}, countArr = [];
	let match = text.match(/1(?:[358]\d|4[57]|7[678])\d{8}/g);
	if (!match || !match.length) return { main: '', other: [] };
	match.map(phone => (count[phone] = (count[phone] || 0) + 1));
	for (let phone in count) countArr.push({ phone, count: count[phone] });
	countArr.sort((a, b) => b.count - a.count);
	return {
		main: countArr[0].phone,
		other: countArr.slice(1).map(it => it.phone)
	};
}

/**
 * @param {string} text 
 * @returns {string}
 */
function getAccount(text) {
	let match = [];
	//移动/联通
	if ((match = text.match(/\w+@(?:(?:139|16900)\.gd)/)))
		return match[0];
	return '';
}

/**
 * @param {string} text 
 * @returns  {string}
 */
function getIntroduction(text) {
	let match = [];
	if ((match = text.match(/.+\b(.+?)(小姐|同学|先生)/)))
		return (match[1] + match[2]).trim();
	return '';
	//下面这样可能会超长
	// text.replace(/\s/g, ' ')
	// 	.replace(/CMCC\-[\w\-]+/g, '')
	// 	.replace(/中山市[\s\S]+?电子科大学生公寓/g, '')
	// 	.replace(/中山市[\s\S]+?石岐区/g, '')
	// 	.replace(/已建议客户单机测试/g, '')
	// 	.replace(/但是用户不配合在线排障/g, '')
	// 	.replace(/请跟进\S+?谢谢/g, '')
	// 	.replace(/石岐区/g, '')
	// 	.replace(/校园宿舍/g, '')
	// 	.replace(/，+/g, '，')
	// 	.replace(/[（\(]\S+?10086\S+?[\)）]/g, '')
}

function bool2num(v) { return v ? 1 : 0; }
function APlusB(a, b) { return a + b; }
function hasSubString(str, subString) { return str.indexOf(subString) >= 0; }

module.exports = {
	analyze, ticketTypeMap
};