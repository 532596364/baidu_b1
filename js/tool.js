
//获取浏览器版本
(function () {
	window.sys={};              				//让外部可以访问，保存浏览器信息对象。
	var ua = navigator.userAgent.toLowerCase(); //获取浏览器信息字符串
	var s=[];									//浏览器信息组，浏览器名称+版本；	

	(s=ua.match(/mise ([\d.]+)/)) ? sys.ie=s[1]:
	(s=ua.match(/firefox\/([\d.]+)/)) ? sys.firefox=s[1]:
	(s=ua.match(/chrome\/([\d.]+)/)) ?  sys.chrome=s[1]:
	(s=ua.match(/opera\/.*version\/([\d.]+)/)) ? sys.opera=s[1]:
	(s=ua.match(/version\/([\d.]+).*safari/)) ? sys.safari=s[1]:0;

	if ((/webkit/.test(ua))) sys.webkit = ua.match(/webkit\/([\d.]+)/)[1];
		              
})();

//DOM加载
function addDomLoaded(fn) {
	var isReady = false;
	var timer = null;
	function doReady() {
		if (timer) clearInterval(timer);
		if (isReady) return;
		isReady = true;
		fn();
	}
	
	if ((sys.opera && sys.opera < 9) || (sys.firefox && sys.firefox < 3) || (sys.webkit && sys.webkit < 525)) {
		//无论采用哪种，基本上用不着了
		/*timer = setInterval(function () {
			if (/loaded|complete/.test(document.readyState)) { 	//loaded是部分加载，有可能只是DOM加载完毕，complete是完全加载，类似于onload
				doReady();
			}
		}, 1);*/

		timer = setInterval(function () {
			if (document && document.getElementById && document.getElementsByTagName && document.body) {
				doReady();
			}
		}, 1);
	} else if (document.addEventListener) {//W3C
		addEvent(document, 'DOMContentLoaded', function () {
			fn();
			removeEvent(document, 'DOMContentLoaded', arguments.callee);
		});
	} else if (sys.ie && sys.ie < 9){
		var timer = null;
		timer = setInterval(function () {
			try {
				document.documentElement.doScroll('left');
				doReady();
			} catch (e) {};
		}, 1);
	}
}
//跨浏览器获取视口大小
function getInner() {
	if (typeof window.innerWidth != 'undefined') {
		return {
			width : window.innerWidth,
			height : window.innerHeight
		}
	} else {
		return {
			width : document.documentElement.clientWidth,
			height : document.documentElement.clientHeight
		}
	}
}


//跨浏览器获取Style
function getStyle(element, attr) {
	if (typeof window.getComputedStyle != 'undefined') {//W3C
		// return window.getComputedStyle(element, null).getPropertyValue(attr);
		return window.getComputedStyle(element, null)[attr];
	} else if (typeof element.currentStyle != 'undeinfed') {//IE
		// return element.currentStyle.getAttribute(attr);
		return element.currentStyle[attr];
	}
}

//判断class是否存在
function hasClass(element, classname) {
	return element.className.match(new RegExp('(\\s|^)' +classname +'(\\s|$)'));
}

//跨浏览器添加link规则
function insertRule(sheet, selectorText, cssText, position) {
	if (typeof sheet.insertRule != 'undefined') {//W3C
		sheet.insertRule(selectorText + '{' + cssText + '}', position);
	} else if (typeof sheet.addRule != 'undefined') {//IE
		sheet.addRule(selectorText, cssText, position);
	}
}

//跨浏览器移出link规则
function deleteRule(sheet, index) {
	if (typeof sheet.deleteRule != 'undefined') {//W3C
		sheet.deleteRule(index);
	} else if (typeof sheet.removeRule != 'undefined') {//IE
		sheet.removeRule(index);
	}
}



//获取事件
function getEvent(event){
	return event || addEvent.fixEvent(window.event);
}

//阻止默认行为
function preDef(event){
	var e = getEvent(event);
	if (typeof e.preventDefault != 'undefined') {
		e.preventDefault();
	}else{
		e.returnValue = false;
	}
}


/*************************************************************************************/

/************
1.IE多次注册同一个函数不被忽略
2.IE中顺序是倒序的
3.IE中this传递过来的是window；
**************/
//跨浏览器事件绑定
// function addEvent(obj, type, fn) {
// 	if (typeof obj.addEventListener != 'undefined') {
// 		obj.addEventListener(type, fn, false);//默认在冒泡阶段执行
// 	} else if (typeof obj.attachEvent != 'undefined') {
// 		obj.attachEvent('on' + type, function () {
// 			fn.call(obj, window.event);
// 		});
// 	}

// }

//传统的方法解决IE绑定事件
/******
1.无法删除事件
2.无法顺序执行
3.IE的现代事件绑定存在内存泄漏问题
*****/
//跨浏览器事件绑定
addEvent.ID = 0;
function addEvent(obj, type, fn) {
	if (typeof obj.addEventListener !='undefined'){
		obj.addEventListener(type, fn,false);//默认在冒泡阶段执行
	} else {
		if (!obj.events)  obj.events={};
		if (!obj.events[type]) obj.events[type]=[];
		if (addEvent.noequal(obj.events[type],fn)) {
			obj.events[type][addEvent.ID++] = fn;
		}
		/******
		obj['on'+type]  等价于obj.on....什么事件，所以后直接等于函数名addEvent.exex而不是运行的函数addEvent.exex（）
		******************/
		obj['on'+type] = addEvent.exex;
	}
}

//执行时间处理函数
addEvent.exex = function (event) {
	var e = getEvent(event);
	var es = this.events[e.type];
	for (var i in es){
		es[i].call(this,e);
	}
}
//对同一个添加函数进行屏蔽
addEvent.noequal = function (es,fn) {
	for (var i in es){
		if (es[i] == fn) return false;
	}
	return true;
}
//把IE常用的Event对象配对到W3C中
addEvent.fixEvent = function (e) {
	e.preventDefault = addEvent.fixEvent.preventDefault();
	e.stopPropagation =addEvent.fixEvent.stopPropagation();
	e.target = addEvent.fixEvent.srcElement;
	return e;
}

//IE阻止默认行为
addEvent.fixEvent.preventDefault = function () {
	this.returnValue = false;
}
//IE取消冒泡
addEvent.fixEvent.stopPropagation = function () {
	this.cancelBubble = true;
}


//跨浏览器删除事件
// function removeEvent(obj, type, fn) {
// 	if (typeof obj.removeEventListener != 'undefined') {
// 		obj.removeEventListener(type, fn, false);
// 	} else if (typeof obj.detachEvent != 'undefined') {
// 		obj.detachEvent('on' + type, fn);
// 	}
// }

//传统的方法解决IE删除事件
function removeEvent(obj, type, fn) {
	if (typeof obj.removeEventListener != 'undefined') {
		obj.removeEventListener(type, fn, false);
	} else {
		if (obj.events[type]) {
			for(var i in obj.events[type]){
				if(obj.events[type][i] == fn){
					delete obj.events[type][i];
				}
			}
		}

	}
}


/*************************************************************************************/



//删除前后空格
function trim(str) {
	return str.replace(/(^\s*)|(\s*$)/g, '');
	// return str.replace(/(^\s*)|(\s*$)/g, '');
}

//滚动条清零
function scrollTop() {
	document.documentElement.scrollTop=0;
	document.body.scrollTop=0;
}

