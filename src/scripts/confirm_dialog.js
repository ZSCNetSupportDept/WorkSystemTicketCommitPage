//@ts-check
/// <reference path="type.d.ts" />

(function () {
	let isShowing = false;

	let $txtInput = $('#txtTicketDesc'),
		$blockConfirm = $('#blockConfirm'),
		$alertCommitSuccess = $('#commitSuccess'),
		$btnCommit = $('#btnCommit');
	
	function show() {
		$txtInput.attr('disabled', 'disabled');
		$('.hide-on-confirm').css('opacity', 0.4);
		$alertCommitSuccess.hide();
		$btnCommit.removeAttr('disabled').show();
		$blockConfirm.slideDown();
	}
	function hide() {
		$txtInput.removeAttr('disabled');
		$('.hide-on-confirm').css('opacity', 1);
		$blockConfirm.slideUp();
	}
	
	function commitSuccess() { $btnCommit.hide(); $alertCommitSuccess.show();}
	function commitFailed() { $btnCommit.removeAttr('disabled').show(); }
	function commiting() { $btnCommit.attr('disabled', 'disabled'); }
	

	module.exports = {
		show, hide,
		commitSuccess,
		commitFailed,
		commiting,
		get isShowing() { return isShowing; }
	};
})();