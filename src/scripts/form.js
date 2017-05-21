//@ts-check
/// <reference path="type.d.ts" />

let convertor = (function generateConvertor(){
	const CHINA = `中国`;
	return {
		add_china_prefix: v => v.startsWith(CHINA) ? v : `${CHINA}${v}`,
		remove_china_prefix: v => v.startsWith(CHINA) ? v.replace(CHINA, '') : v
	};
})();

/**
 * @param {JQuery} $form
 * @return {Object}
 */
function encode($form) {
	let result = {};
	$form.find('[name]').each((i, ele) => {
		let $input = $(ele),
			v = hasValAttr($input) ? $input.val() : $input.text(),
			convert;
		if ($input.data('ignore')) return;
		if ((convert = $input.data('convert-get')) && convertor[convert])
			v = convertor[convert](v);
		result[$input.attr('name')] = v;
	});
	return result;
}

/**
 * @param {JQuery} $form 
 * @param {Object} data 
 */
function fill($form, data) {
	data = data || {};
	$form.find('[name]').each((i, ele) => {
		let $input = $(ele),
			key = $input.attr('name'),
			v = (data[key] || ''),
			convert;
		if ($input.data('ignore')) return;
		if ((convert = $input.data('convert-set')) && convertor[convert])
			v = convertor[convert](v);
		hasValAttr($input) ? $input.val(v) : $input.text(v);
	});
}

/**
 * @param {JQuery} $dom 
 */
function isValueTag($dom) { return hasValAttr($dom); }

/**
 * @param {JQuery} $dom 
 */
function hasValAttr($dom) { 
	let tagName = $dom.prop('tagName');
	return tagName == 'INPUT' || tagName == 'TEXTAREA' || tagName == 'SELECT'; 
}

module.exports = {
	encode, fill, isValueTag
};