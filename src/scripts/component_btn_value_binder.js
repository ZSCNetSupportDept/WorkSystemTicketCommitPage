//@ts-check
/// <reference path="type.d.ts" />

let { isValueTag } = require('./form');

/**
 * @param {JQuery} $block 
 */
function init($block) {
	let defaultStyle = `btn-outline-secondary`,
		selectedStyle = color => `btn-${color}`;

	$block.find('[data-bind]').off('click').on('click', onDataBindButtonClick);
	updateDataBindButtonHighlight();

	function onDataBindButtonClick() {
		let $this = $(this),	
			$target = $block.find(`[name="${$this.data('bind')}"]`),
			v = $this.text();
		isValueTag($target) ? $target.val(v) : $target.text(v);
		updateDataBindButtonHighlight();
	}

	function updateDataBindButtonHighlight() {
		let $fields = $block.find(`[name]`);
		$fields.each((i, e) => {
			let $field = $(e),
				fName = $field.attr('name'),
				v = isValueTag($field) ? $field.val() : $field.text(),
				color = $field.data('color'),
				$btns = $block.find(`[data-bind="${fName}"]`);
			$btns.each((i, e) => {
				let $btn = $(e), style = selectedStyle(color);
				$btn.text() == v ? ($btn.removeClass(defaultStyle), $btn.addClass(style))
					: ($btn.addClass(defaultStyle), $btn.removeClass(style));
			});
		});
	}
}

module.exports = {
	init
};