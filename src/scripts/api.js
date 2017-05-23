//@ts-check
/// <reference path="type.d.ts" />
let url = require('./url');

(function API() {
	const DEBUG_RESPONSE = true;
	const CSRF_NAME = 'csrftoken=';
	
	let logined = false;
	let _csrf = '';

	function getStauts() { return request('is_login', null); }
	function login(loginInfo) { return request('login', Object.assign({}, loginInfo, { longtime: false })); }
	function logout() { return request('logout', null); }
	function commit(commitInfo) { return request('work_order_add', commitInfo); }

	/**
	 * @param {APIResponseStatus} data 
	 */
	function updateCSRF(data) {
		let newCSRF = '';
		//优先从Cookies中拿
		document.cookie && document.cookie.split(';')
			.filter(cookie => cookie.trim().startsWith(CSRF_NAME))
			.map(cookie => newCSRF = cookie.slice(CSRF_NAME.length));
		
		//没有从Cookie中拿到就从返回结果中拿
		if (!newCSRF && data && data.csrf_token) {
			// document.cookie = `${CSRF_NAME}${newCSRF = data.csrf_token}`;
			newCSRF = data.csrf_token;
		}
		
		_csrf = newCSRF || _csrf;
	}
	/**
	 * @param {URLName} name 
	 * @param {Object} data 
	 * @returns  
	 */
	function request(name, data) {
		return new Promise((resolve, reject) => {
			let options = url.createRequestOptions(name, _csrf);
			data && (options.data = JSON.stringify(data));
			options.success = onResponse(name, resolve);
			options.error = xhr => (console.error(xhr), reject('无法连接到服务器!(服务器异常)'));
			$.ajax(options);
		});	
	}
	function onResponse(name, resolve) {
		return (data) => {
			if (DEBUG_RESPONSE)
				console.log(`API ${name} response:\n`, data);
			//刷新登录状态
			if (data && typeof data.is_login != 'undefined')
				logined = data.is_login;
			updateCSRF(data);
			resolve(data);
		};	
	}

	module.exports = {
		getStauts, login, commit, logout, 

		get isLogin() { return logined; },
		set csrf(csrf) { _csrf = csrf;},
		get csrf() { return _csrf;}
	};
})();
