//@ts-check
/// <reference path="type.d.ts" />

let templates = {};
let hadInit = false;

function init() {
	let $tmpl = $('script[type="text/template"]');
	$tmpl.each(i => {
		let $t = $tmpl.eq(i);
		templates[$t.data('tmpl')] = ejs.compile($t.html());
	});
	hadInit = true;
}

/**
 * @param {string} name 
 * @param {Object} data 
 * @returns {string}
 */
function render(name, data) {
	hadInit || init();
	return name in templates ? templates[name](data || {}) : "";
}

module.exports = { render };
