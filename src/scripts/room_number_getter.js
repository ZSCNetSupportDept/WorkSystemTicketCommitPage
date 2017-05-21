//@ts-check

/**
 * @param {string} text 
 * @returns {string}
 */
function getRoomNumber(text) {
	/**
	 * @type {string[]|null}
	 */
	let match = null;
	//A单元0523床03
	//A栋1121
	match = text.match(/([A-Da-d])(?:单元|栋)?[\/\\\-\s]*([01]?\d{3})(床0?[1-4])?\b/);
	if (match) return match[1] + match[2] + (match[3] || '');

	//朝晖苑
	//1111房-2床
	match = text.match(/([01]?\d{3})(?:房-|房|-)(0?\d)床?\b/);
	if (match) return match[1] + '房' +(match[2] || '');

	//凤翔:
	//4栋/508-4
	match = text.match(/([1-6])栋[\/\\\-\s]*(\d{3})(-?[1-4])?\b/);
	if (match) return match[1] + '栋' + match[2] + (match[3] || '');
	
	//11-345
	//12栋234
	match = text.match(/\b([7-9]|[12]\d)\s*(?:栋|\-)\s*(\d{3})\b/);
	if (match) return match[1] + '栋' + match[2];
	
	return '';
}

module.exports = {
	getRoomNumber
};