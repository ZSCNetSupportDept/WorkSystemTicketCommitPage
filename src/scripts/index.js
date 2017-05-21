//@ts-check
/// <reference path="type.d.ts" />

let api = require('./api'),
	form = require('./form'),
	BindableButtons = require('./component_btn_value_binder'),
	ConfirmDialog = require('./confirm_dialog'),
	{ analyze, ticketTypeMap } = require('./ticket_info_analyzer'),
	{ render } = require('./templates');

let App = function () {
	let showLoginError = msg => $form.login_err_msg.show().text(msg),
		delayDumpToken = null,
		$txtDump = $('#txtDump'),
		$txtInput = $('#txtTicketDesc');

	let $form = {
		commit: $('#formCommit'),
		get login() { return $('#formLogin'); },
		get login_err_msg() { return $('#formLogin .alert');}
	};

	this.api = api;
	this.commit = commit;
	this.login = login;
	this.logout = logout;
	this.onTicketDescChange = onTicketDescChange;
	this.hideConfirmDialog = ConfirmDialog.hide;
	this.previewTicketBeforeCommit = previewTicketBeforeCommit;
	
	//启动时刷新一次用户信息
	getUserInfo();

	$(document).keydown(onDocumentKeydown);


	function getUserInfo() {
		api.getStauts().then(status => {
			$('#blockUserInfo').html(render('block_user_info_' + (status.is_login ? 'info' : 'login'), status));
		}).catch(onApiError);
	}

	/**
	 * @param {Event} event 
	 */
	function login(event) {
		event.preventDefault();
		$form.login_err_msg.hide();
		api.login(form.encode($form.login)).then(onGetLoginLogoutResponse).catch(showLoginError);
	}

	function logout() {
		event.preventDefault();
		api.logout().then(onGetLoginLogoutResponse).catch(onApiError);
	}

	let commiting = false;	
	function commit() {
		if (commiting) return;
		commiting = true;
		ConfirmDialog.commiting();

		let info = form.encode($form.commit);
		info.situation_order = (ticketTypeMap[info.situation_order_string] || 1);
		info.introduction = info.introduction;
		info.area = info.work_area;
		info.status = 0;
		console.log(info);

		api.commit(info).then(data => {
			if (!data || !data.success) return failed();
			commiting = false;
			ConfirmDialog.commitSuccess();
			$txtInput.val('');
			getUserInfo();
		}).catch(failed);

		function failed() {
			commiting = false;
			ConfirmDialog.commitFailed();
			alert('录入失败!\n请检查各个字段填写正确,描述没有超过长度!');
		}
	}


	/**
	 * @param {KeyboardEvent} event 
	 */	
	function onDocumentKeydown(event) {
		if (!event) return;		
		let key = event.which || event.keyCode || 0;
		if (key == 27) return ConfirmDialog.hide(); //ESC
	}	

	/**
	 * @param {KeyboardEvent} event 
	 */	
	function onTicketDescChange(event) {
		let key = event.which || event.keyCode || 0;
		if (key == 13 && event.ctrlKey && !event.altKey && !event.shiftKey)
			return event.preventDefault(), previewTicketBeforeCommit();
		showDumpInfo();
	}

	function previewTicketBeforeCommit() {
		if (!api.isLogin) return showLoginError('请先登录!');
		let desc = $txtInput.val();
		if (!desc.trim()) return;
		
		form.fill($form.commit, analyze($txtInput.val()));
		BindableButtons.init($form.commit);
		ConfirmDialog.show();
	}

	function showDumpInfo() {
		delayDumpToken && clearTimeout(delayDumpToken);
		delayDumpToken = setTimeout(() =>
			$txtDump.text(JSON.stringify(analyze($txtInput.val()),
				(k, v) => k == 'introduction' ? '...' : v, '  ')), 200);
	}
	
	/**
	 * @param {APIResponseStatus} response 
	 */
	function onGetLoginLogoutResponse(response) {
		response.success ? getUserInfo() : showLoginError(response.error);
	}

	/**
	 * @param {string|Error} errInfo 
	 */	
	function onApiError(errInfo) {
		alert('服务器异常!\n详细信息请查看控制台输出');
		console.error(errInfo);
	}

	
};

global.app = new App();