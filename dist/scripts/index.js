"use strict";

(function e(t, n, r) {
	function s(o, u) {
		if (!n[o]) {
			if (!t[o]) {
				var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
			}var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
				var n = t[o][1][e];return s(n ? n : e);
			}, l, l.exports, e, t, n, r);
		}return n[o].exports;
	}var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
		s(r[o]);
	}return s;
})({ 1: [function (require, module, exports) {
		//@ts-check
		/// <reference path="type.d.ts" />
		var url = require('./url');

		(function API() {
			var DEBUG_RESPONSE = true;
			var CSRF_NAME = 'csrftoken=';

			var logined = false;
			var _csrf = '';

			function getStauts() {
				return request('is_login', null);
			}
			function login(loginInfo) {
				return request('login', Object.assign({}, loginInfo, { longtime: false }));
			}
			function logout() {
				return request('logout', null);
			}
			function commit(commitInfo) {
				return request('work_order_add', commitInfo);
			}

			/**
    * @param {APIResponseStatus} data 
    */
			function updateCSRF(data) {
				var newCSRF = '';
				//优先从Cookies中拿
				document.cookie && document.cookie.split(';').filter(function (cookie) {
					return cookie.trim().startsWith(CSRF_NAME);
				}).map(function (cookie) {
					return newCSRF = cookie.slice(CSRF_NAME.length);
				});

				//没有从Cookie中拿到就从返回结果中拿
				if (!newCSRF && data && data.csrf_token) document.cookie = "" + CSRF_NAME + (newCSRF = data.csrf_token);

				_csrf = newCSRF || _csrf;
			}
			/**
    * @param {URLName} name 
    * @param {Object} data 
    * @returns  
    */
			function request(name, data) {
				return new Promise(function (resolve, reject) {
					var options = url.createRequestOptions(name, _csrf);
					data && (options.data = JSON.stringify(data));
					options.success = onResponse(name, resolve);
					options.error = function (xhr) {
						return console.error(xhr), reject('无法连接到服务器!(服务器异常)');
					};
					$.ajax(options);
				});
			}
			function onResponse(name, resolve) {
				return function (data) {
					if (DEBUG_RESPONSE) console.log("API " + name + " response:\n", data);
					//刷新登录状态
					if (data && typeof data.is_login != 'undefined') logined = data.is_login;
					updateCSRF(data);
					resolve(data);
				};
			}

			module.exports = {
				getStauts: getStauts, login: login, commit: commit, logout: logout,

				get isLogin() {
					return logined;
				},
				set csrf(csrf) {
					_csrf = csrf;
				},
				get csrf() {
					return _csrf;
				}
			};
		})();
	}, { "./url": 9 }], 2: [function (require, module, exports) {
		//@ts-check
		/// <reference path="type.d.ts" />

		var _require = require('./form'),
		    isValueTag = _require.isValueTag;

		/**
   * @param {JQuery} $block 
   */


		function init($block) {
			var defaultStyle = "btn-outline-secondary",
			    selectedStyle = function selectedStyle(color) {
				return "btn-" + color;
			};

			$block.find('[data-bind]').off('click').on('click', onDataBindButtonClick);
			updateDataBindButtonHighlight();

			function onDataBindButtonClick() {
				var $this = $(this),
				    $target = $block.find("[name=\"" + $this.data('bind') + "\"]"),
				    v = $this.text();
				isValueTag($target) ? $target.val(v) : $target.text(v);
				updateDataBindButtonHighlight();
			}

			function updateDataBindButtonHighlight() {
				var $fields = $block.find("[name]");
				$fields.each(function (i, e) {
					var $field = $(e),
					    fName = $field.attr('name'),
					    v = isValueTag($field) ? $field.val() : $field.text(),
					    color = $field.data('color'),
					    $btns = $block.find("[data-bind=\"" + fName + "\"]");
					$btns.each(function (i, e) {
						var $btn = $(e),
						    style = selectedStyle(color);
						$btn.text() == v ? ($btn.removeClass(defaultStyle), $btn.addClass(style)) : ($btn.addClass(defaultStyle), $btn.removeClass(style));
					});
				});
			}
		}

		module.exports = {
			init: init
		};
	}, { "./form": 4 }], 3: [function (require, module, exports) {
		//@ts-check
		/// <reference path="type.d.ts" />

		(function () {
			var isShowing = false;

			var $txtInput = $('#txtTicketDesc'),
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

			function commitSuccess() {
				$btnCommit.hide();$alertCommitSuccess.show();
			}
			function commitFailed() {
				$btnCommit.removeAttr('disabled').show();
			}
			function commiting() {
				$btnCommit.attr('disabled', 'disabled');
			}

			module.exports = {
				show: show, hide: hide,
				commitSuccess: commitSuccess,
				commitFailed: commitFailed,
				commiting: commiting,
				get isShowing() {
					return isShowing;
				}
			};
		})();
	}, {}], 4: [function (require, module, exports) {
		//@ts-check
		/// <reference path="type.d.ts" />

		var convertor = function generateConvertor() {
			var CHINA = "\u4E2D\u56FD";
			return {
				add_china_prefix: function add_china_prefix(v) {
					return v.startsWith(CHINA) ? v : "" + CHINA + v;
				},
				remove_china_prefix: function remove_china_prefix(v) {
					return v.startsWith(CHINA) ? v.replace(CHINA, '') : v;
				}
			};
		}();

		/**
   * @param {JQuery} $form
   * @return {Object}
   */
		function encode($form) {
			var result = {};
			$form.find('[name]').each(function (i, ele) {
				var $input = $(ele),
				    v = hasValAttr($input) ? $input.val() : $input.text(),
				    convert = void 0;
				if ($input.data('ignore')) return;
				if ((convert = $input.data('convert-get')) && convertor[convert]) v = convertor[convert](v);
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
			$form.find('[name]').each(function (i, ele) {
				var $input = $(ele),
				    key = $input.attr('name'),
				    v = data[key] || '',
				    convert = void 0;
				if ($input.data('ignore')) return;
				if ((convert = $input.data('convert-set')) && convertor[convert]) v = convertor[convert](v);
				hasValAttr($input) ? $input.val(v) : $input.text(v);
			});
		}

		/**
   * @param {JQuery} $dom 
   */
		function isValueTag($dom) {
			return hasValAttr($dom);
		}

		/**
   * @param {JQuery} $dom 
   */
		function hasValAttr($dom) {
			var tagName = $dom.prop('tagName');
			return tagName == 'INPUT' || tagName == 'TEXTAREA' || tagName == 'SELECT';
		}

		module.exports = {
			encode: encode, fill: fill, isValueTag: isValueTag
		};
	}, {}], 5: [function (require, module, exports) {
		(function (global) {
			//@ts-check
			/// <reference path="type.d.ts" />

			var api = require('./api'),
			    form = require('./form'),
			    BindableButtons = require('./component_btn_value_binder'),
			    ConfirmDialog = require('./confirm_dialog'),
			    _require2 = require('./ticket_info_analyzer'),
			    analyze = _require2.analyze,
			    ticketTypeMap = _require2.ticketTypeMap,
			    _require3 = require('./templates'),
			    render = _require3.render;


			var App = function App() {
				var showLoginError = function showLoginError(msg) {
					return $form.login_err_msg.show().text(msg);
				},
				    delayDumpToken = null,
				    $txtDump = $('#txtDump'),
				    $txtInput = $('#txtTicketDesc');

				var $form = {
					commit: $('#formCommit'),
					get login() {
						return $('#formLogin');
					},
					get login_err_msg() {
						return $('#formLogin .alert');
					}
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
					api.getStauts().then(function (status) {
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

				var commiting = false;
				function commit() {
					if (commiting) return;
					commiting = true;
					ConfirmDialog.commiting();

					var info = form.encode($form.commit);
					info.situation_order = ticketTypeMap[info.situation_order_string] || 1;
					info.introduction = '!!!![测试工单] ' + info.introduction;
					info.area = info.work_area;
					info.status = 0;
					console.log(info);

					api.commit(info).then(function (data) {
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
					var key = event.which || event.keyCode || 0;
					if (key == 27) return ConfirmDialog.hide(); //ESC
				}

				/**
     * @param {KeyboardEvent} event 
     */
				function onTicketDescChange(event) {
					var key = event.which || event.keyCode || 0;
					if (key == 13 && event.ctrlKey && !event.altKey && !event.shiftKey) return event.preventDefault(), previewTicketBeforeCommit();
					showDumpInfo();
				}

				function previewTicketBeforeCommit() {
					if (!api.isLogin) return showLoginError('请先登录!');
					var desc = $txtInput.val();
					if (!desc.trim()) return;

					form.fill($form.commit, analyze($txtInput.val()));
					BindableButtons.init($form.commit);
					ConfirmDialog.show();
				}

				function showDumpInfo() {
					delayDumpToken && clearTimeout(delayDumpToken);
					delayDumpToken = setTimeout(function () {
						return $txtDump.text(JSON.stringify(analyze($txtInput.val()), function (k, v) {
							return k == 'introduction' ? '...' : v;
						}, '  '));
					}, 200);
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
		}).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
	}, { "./api": 1, "./component_btn_value_binder": 2, "./confirm_dialog": 3, "./form": 4, "./templates": 7, "./ticket_info_analyzer": 8 }], 6: [function (require, module, exports) {
		//@ts-check

		/**
   * @param {string} text 
   * @returns {string}
   */
		function getRoomNumber(text) {
			/**
    * @type {string[]|null}
    */
			var match = null;
			//A单元0523床03
			//A栋1121
			match = text.match(/([A-Da-d])(?:单元|栋)?[\/\\\-\s]*([01]?\d{3})(床0?[1-4])?\b/);
			if (match) return match[1] + match[2] + (match[3] || '');

			//朝晖苑
			//1111房-2床
			match = text.match(/([01]?\d{3})(?:房-|房|-)(0?\d)床?\b/);
			if (match) return match[1] + '房' + (match[2] || '');

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
			getRoomNumber: getRoomNumber
		};
	}, {}], 7: [function (require, module, exports) {
		//@ts-check
		/// <reference path="type.d.ts" />

		var templates = {};
		var hadInit = false;

		function init() {
			var $tmpl = $('script[type="text/template"]');
			$tmpl.each(function (i) {
				var $t = $tmpl.eq(i);
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

		module.exports = { render: render };
	}, {}], 8: [function (require, module, exports) {
		//@ts-check
		/// <reference path="type.d.ts" />

		var _require4 = require('./room_number_getter'),
		    getRoomNumber = _require4.getRoomNumber;

		var keywords = {
			new_account: ['上门安装', '安装', '新装', '报装'],
			new_account_atleast: 2,

			user_fuck: ['投诉'],
			user_fuck_atleast: 1,

			from_cmcc: ['移动工单', 'CMCC', '感知平台', '家庭宽带业务', '10086', '重启MODEM'],
			from_cmcc_atleast: 2,

			from_unicom: ['@16900.gd', 'ZSZJLAN', '张琳', '联通'],
			from_unicom_atleast: 1
		};

		var ticketType = ['', '工单', '新装', '投诉'],
		    ticketTypeMap = { '工单': 1, '新装': 2, '投诉': 3 };

		/**
   * @param {string} text
   * @returns {APIRequestCommitTicket}
   */
		function analyze(text) {
			/**
    * @type {APIRequestCommitTicket}
    */
			//@ts-ignore
			var result = {};

			result.situation_order = getTicketType(text);
			result.situation_order_string = ticketType[result.situation_order];
			result.work_area = getWorkArea(text);
			result.operator = getOperator(text);
			result.dormitory_number = getRoomNumber(text);

			var phone = getPhoneNumbers(text);
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
			if (keywords.new_account.map(function (v) {
				return hasSubString(text, v);
			}).map(bool2num).reduce(APlusB, 0) >= keywords.new_account_atleast) return 2; //新装	
			if (keywords.user_fuck.map(function (v) {
				return hasSubString(text, v);
			}).map(bool2num).reduce(APlusB, 0) >= keywords.user_fuck_atleast) return 3; //投诉
			return 1; //工单
		}

		/**
   * @param {string} text 
   * @returns {string}
   */
		function getWorkArea(text) {
			if (hasSubString(text, '6期公寓') || hasSubString(text, '朝晖')) return '朝晖苑';
			if (hasSubString(text, '香晖苑') || text.match(/\b[A-Da-d]单元/)) return '香晖苑';
			if (hasSubString(text, '凤翔') || text.match(/\b[1-6](栋|\-)/)) return '凤翔';

			if (hasSubString(text, '北门') || text.match(/\b([7-9]|1[01])(栋|\-)/)) return '北门';
			if (hasSubString(text, '岐头') || text.match(/\b1[6-9](栋|\-)/)) return '岐头';
			if (hasSubString(text, '东门') || text.match(/\b(1[2-5]|20|21)(栋|\-)/)) return '东门';
			if (hasSubString(text, '别墅')) return '香山别墅';

			return '';
		}

		function getOperator(text) {
			if (keywords.from_cmcc.map(function (v) {
				return hasSubString(text, v);
			}).map(bool2num).reduce(APlusB, 0) >= keywords.from_cmcc_atleast) return '中国移动';
			if (keywords.from_unicom.map(function (v) {
				return hasSubString(text, v);
			}).map(bool2num).reduce(APlusB, 0) >= keywords.from_unicom_atleast) return '中国联通';
			return '中国电信';
		}

		function getPhoneNumbers(text) {
			var count = {},
			    countArr = [];
			var match = text.match(/1(?:[358]\d|4[57]|7[678])\d{8}/g);
			if (!match || !match.length) return { main: '', other: [] };
			match.map(function (phone) {
				return count[phone] = (count[phone] || 0) + 1;
			});
			for (var phone in count) {
				countArr.push({ phone: phone, count: count[phone] });
			}countArr.sort(function (a, b) {
				return b.count - a.count;
			});
			return {
				main: countArr[0].phone,
				other: countArr.slice(1).map(function (it) {
					return it.phone;
				})
			};
		}

		/**
   * @param {string} text 
   * @returns {string}
   */
		function getAccount(text) {
			var match = [];
			//移动/联通
			if (match = text.match(/\w+@(?:(?:139|16900)\.gd)/)) return match[0];
			return '';
		}

		/**
   * @param {string} text 
   * @returns  {string}
   */
		function getIntroduction(text) {
			var match = [];
			if (match = text.match(/.+\b(.+?)(小姐|同学|先生)/)) return (match[1] + match[2]).trim();
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

		function bool2num(v) {
			return v ? 1 : 0;
		}
		function APlusB(a, b) {
			return a + b;
		}
		function hasSubString(str, subString) {
			return str.indexOf(subString) >= 0;
		}

		module.exports = {
			analyze: analyze, ticketTypeMap: ticketTypeMap
		};
	}, { "./room_number_getter": 6 }], 9: [function (require, module, exports) {
		//@ts-check
		/// <reference path="type.d.ts" />
		// let base = `http://work.zsxyww.com/work`
		var base = '/work';

		var URL = {
			base: base,

			is_login: base + "/is_login/",
			is_login_method: 'GET',

			login: base + "/try_login/",
			login_method: 'POST',

			logout: base + "/try_logout/",
			logout_method: 'GET',

			work_order_add: base + "/work_order_add/",
			work_order_add_method: 'POST',

			createRequestOptions: createRequestOptions
		};

		module.exports = URL;

		/**
   * @param {URLName} name
   * @param {string} [csrfToken]
   * @return {JQueryAjaxSettings}
   */
		function createRequestOptions(name, csrfToken) {
			var url = URL[name],
			    method = URL[name + "_method"];
			/**
    * @type {JQueryAjaxSettings}
    */
			var options = { url: url, method: method, dataType: 'json' };
			if (method == 'POST') options.contentType = 'application/json';

			// options.xhrFields = { withCredentials: false};
			options.crossDomain = false;
			options.headers = { 'X-CSRFToken': csrfToken };

			return options;
		}
	}, {}] }, {}, [5]);
//# sourceMappingURL=index.js.map