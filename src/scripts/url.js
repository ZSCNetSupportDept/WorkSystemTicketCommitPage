//@ts-check
/// <reference path="type.d.ts" />
let base = '/work';

let URL = {
	base,

	is_login: `${base}/is_login/`,
	is_login_method: 'GET',

	login: `${base}/try_login/`,
	login_method: 'POST',

	logout: `${base}/try_logout/`,
	logout_method: 'GET',

	work_order_add: `${base}/work_order_add/`,
	work_order_add_method: 'POST',

	createRequestOptions
};

module.exports = URL;

/**
 * @param {URLName} name
 * @param {string} [csrfToken]
 * @return {JQueryAjaxSettings}
 */
function createRequestOptions(name, csrfToken) {
	let url = URL[name], method = URL[`${name}_method`];
	/**
	 * @type {JQueryAjaxSettings}
	 */
	let options = { url, method, dataType: 'json' };
	if (method == 'POST') options.contentType = 'application/json';
	
	// options.xhrFields = { withCredentials: false};
	options.crossDomain = false;
	options.headers = { 'X-CSRFToken': csrfToken };
	
	return options;
}