// ==UserScript==
// @name LORCode Tools
// @description Кнопка цитирования выделенного и панель тегов для LORCode
// @author Алексей Соловьев (moscwich, msk.nightingale)
// @version 0.21.4
// @license Creative Commons Attribution 3.0 Unported
// @include https://www.linux.org.ru/*
// @grant none
// ==/UserScript==

// Based on MultiCodePanel 2.2 (v. 0.22)
// http://al-moscwich.tk/tag/multicodepanel

// if (/https?:\/\/(www\.)?linux.org.ru/.test (u))

function removeElements () {
	for (i = 0; i < arguments.length; i++) {
		var p = arguments[i].parentNode;
		if (p) p.removeChild (arguments[i]);
	}
}
function set (p, z) {
	for (i = 0; i < arguments.length && (arguments[i] === undefined); i++) {}
	return arguments[i];
}

i = j = undefined;
a = b = undefined;

form = document.getElementById ("commentForm") || document.getElementById ("messageForm") || document.getElementById ("editRegForm");
msg = document.getElementById ("msg") || document.getElementById ("form_msg") || document.getElementById ("info");
var u = window.location.href;

// Panel
var panel = document.createElement ("div");
panel.id = 'atag';
panel.createBlock =
	function () {
		block = document.createElement ("span");
		for (i = 0; i < arguments.length; i++) {
			link = document.createElement ("a");
			link.textContent = arguments[i][0];
			link.title = arguments[i][1];
			link.exec = arguments[i][2];
			link.onclick = function () {
				eval (this.exec);
				return false;
			}
			block.appendChild (link);
		}
		return this.appendChild (block);
	}
panel.createBlock (
	["[b]", "Полужирный", 'intag ("strong");'],
	["[i]", "Курсив", 'intag ("em");'],
	["[s]", "Зачеркнутый", 'intag ("s");'],
	["[u]", "Подчеркнутый", 'intag ("u");']
);
panel.createBlock (
	["[quote]", "Цитата", 'intag ("quote"); msg.parentNode.mode.selectedIndex = 0;'],
	["[code]", "Код", 'intag ("code"); msg.parentNode.mode.selectedIndex = 0;']
);
panel.createBlock (
	["[url]", "URL", 'url ();'],
	["[user]", "Участник", 'intag ("user");']
);
panel.createBlock (
	["[list]", "Список", 'intag ("list"); msg.parentNode.mode.selectedIndex = 0;'],
	["[*]", "Элемент списка", 'msg.wrtSel ("[*]", ""); msg.parentNode.mode.selectedIndex = 0;']
);
panel.createBlock (
	["«»", "Кавычки", 'msg.wrtSel ("«", "»");'],
	["„“", "Кавычки", 'msg.wrtSel ("„", "“");'],
	["[br]", "Перевод строки", 'msg.wrtSel ("[br]", "");']
);
panel.createBlock (
	[" fix ", "Превратить знаки и обозначения в соответствующие спец. символы", 'fix ();'],
	[" deltags-in ", "Удалить крайнее входящие обрамление тегами", 'deltagsin ();'],
	[" brs ", "Добавить [br] к переводам строк", 'brs (); msg.parentNode.mode.selectedIndex = 0;']
);

msg.parentNode.insertBefore (panel, msg);
msg.cols = 100;
msg.rows = 20;

// Styles
obj = document.createElement ("style");
obj.innerHTML = '\
	#atag a {\
		padding: 2px 3px; margin: 2px; cursor: pointer;\
		text-decoration: none; color: #FFF !important;\
		background-color: #004; border: #888 outset 1px;\
	}\
	#atag a:hover {background-color: #008; border-color: #888;}\
	#atag {\
		margin-bottom: 5px;\
		padding: 3px 1px; font-size: 0.9em;\
	}\
	#atag > span {margin-right: 4px;}\
	#msg {width: 50em !important;}\
	label[for="title"], label[for="msg"] {display: inline-block; margin: 5px 0 3px 0;}\
	label[for="mode"] {display: inline-block; margin-bottom: 3px;}\
	.msg_body p, .msg_body ul {margin: 0.3em 0 !important;}\
	.msg > .title {margin: -3px -13px 0 -13px; padding: 1px 3px;}\
	.messages {margin-top: 1em;}\
	#comments {padding-top: 0 !important;}\
';
document.getElementsByTagName ("head")[0].appendChild (obj);

// Remove formating tips
// if (u.indexOf ("add.jsp") <= -1 && u.indexOf ("edit") <= -1) removeElements (form.getElementsByTagName ('font')[0]);

// Add quote links
var t = new Array ();
var d = document.getElementsByClassName ("title");
for (i = 0; i < d.length; i++)
	if (d[i].parentNode.className == "msg")
		t.push (d[i]);

t.createQlink = function () {
	for (i = 0; i < this.length; i++) {
		for (j in arguments) {
			var qlink = document.createElement ("a");
			qlink.onclick = arguments[j][1];
			qlink.href = u;
			qlink.textContent = arguments[j][0];
			this[i].insertBefore (
				document.createTextNode ("] "),
				this[i].firstChild
			);
			this[i].insertBefore (
				document.createTextNode ("["),
				this[i].insertBefore (qlink, this[i].firstChild)
			);
		}
	}
}
t.createQlink (['цитата', q], ['блок-цитата', qb], ['юзер', user]);

// Add \n to <br>
var mbs = document.getElementsByClassName ("msg_body");
for (j in mbs) if (!isNaN (j)) {
	var mps = mbs[j].getElementsByTagName ("p");
	for (i in mps)
		if (!isNaN (i))
			mps[i].innerHTML = mps[i].innerHTML.replace (/<br\/?>(?![\n\r])/g, "<br>\n");
}

/* ==========
	Main
========== */

// Auxiliary functions
msg.wrtSel = function (subj, offset, before, after, zset) { //also msg.wrtSel (before, after, offset)
	if (typeof offset == "string")
		var
			after = offset, offset = before,
			before = subj, subj = undefined;
	var
		before = before || "", after = after || "",
		offset = set (offset, before.length), zset = zset || 0;
	var
		startSel = set (a, this.selectionStart), endSel = set (b, this.selectionEnd),
		subj = before + set (subj, this.value.substring (startSel, endSel)) + after;

	this.value = this.value.substring (0, startSel) + subj + this.value.substring (endSel);
	this.focus (); this.setSelectionRange (startSel + offset, endSel + offset + zset);
	a = b = undefined;
}
function addbr (c) {
	return c.replace (/^((?:(?!\[\/?(?:quote|code|list|br)(?:=.*)?\]$)[^\n\r])+)(\r?\n)(?!\n|\[\/?(?:br|quote(?:=.*)?|code(?:=.*)?)\])/gm, "$1[br]$2");
}
function getTextContent (post) {
	var text = "";
	var pTags = post.getElementsByClassName ("msg_body")[0].getElementsByTagName ("p");
	for (i = 0; i < pTags.length; i++)
		if (
			pTags[i].parentNode.className.indexOf ('msg_body') > -1
			|| pTags[i].parentNode.getAttribute ('itemprop') == "articleBody"
		) {
			text += pTags[i].textContent;
			if (i != pTags.length - 1) text += "\n\n";
		}
	return text;
}
function getUserName (post){
	if (i = post.getElementsByClassName ("sign")[0].getElementsByTagName ("a")[0])
		return i.innerHTML;
	else return "anonymous";
}

// Functions to run
function intag (tag, arg) {
	var arg = arg || "";
	msg.wrtSel (
		undefined,
		tag.length + arg.length + 2,
		"[" + tag + arg + "]",
		"[/" + tag + "]"
	);
}
function fix () {
	var a = msg.selectionStart, b = msg.selectionEnd;
	var repc = function (c) {
		c = c.replace (/\(c\)/gi, "©");	c = c.replace (/\([rр]\)/gi, "®");
		c = c.replace (/\(f\)/gi, "£");	c = c.replace (/\(e\)/gi, "€");
		c = c.replace (/%\/10/g, "‰");	c = c.replace (/%\/100/g, "‱");
		c = c.replace (/\(V\)/g, "✓");	c = c.replace (/\(V\+\)/g, "✔");
		c = c.replace (/\(x\)/g, "✗");	c = c.replace (/\(x\+\)/g, "✘");
		c = c.replace (/`/g, "&#769;");	c = c.replace (/\(p\)/gi, "§");
		c = c.replace (/(^| )- /g, "$1— ");	c = c.replace (/-->/g, "→");
		c = c.replace (/\(\*\+?\)/g, "★");	c = c.replace (/\(\*-\)/g, "☆");
		c = c.replace (/\([tт][mм]\)/gi, "™");
		return c;
	}

	if (a != b) {
		var c = msg.value.substring (a, b);
		var z = repc (c);
		msg.wrtSel (z, 0, "", "", z.length - c.length);
	}
	else
		msg.value = repc (msg.value);
}
function url () {
	a = msg.selectionStart; b = msg.selectionEnd;
	z = msg.value.substring (a, b);
	if (/((ftp|http|https):\/\/)[\.\w- ]{2,}\.[A-Za-z]{2,4}(\/?$|\/.*)/.test(z) || z.length == 0) {
		msg.wrtSel (z, 5,
			"[url]", "[/url]"
		);
	}
	else if (/[\.\w- ]{2,}\.[A-Za-z]{2,4}(\/?$|\/.*)/.test(z)) {
		msg.wrtSel (
			"http://"+z, 5,
			"[url]", "[/url]", 7
		);
	}
	else {
		msg.wrtSel (z, 5,
			"[url=]", "[/url]",
			-z.length
		);
	}
}
function deltagsin () {
	z = msg.value.substring (a = msg.selectionStart, b = msg.selectionEnd);
	c = z.replace (/\[\w+\](.*)\[\/\w+\]/, "$1");
	msg.wrtSel (c, 0, "", "", - z.length + c.length);
}
function brs () {
	var a = msg.selectionStart, b = msg.selectionEnd;
	if (a != b) {
		var c = msg.value.substring (a, b);
		var z = addbr (c);
		msg.wrtSel (z, 0, "", "", z.length - c.length);
	}
	else {
		msg.value = addbr (msg.value);
	}
}
function qb () {
	var seltxt = getSelection ();
	var getQuoteSrc =
		function (sel, post, prnt) {
			return (
				"[quote" + (
					prnt.parentNode.parentNode != msg.parentNode.parentNode.parentNode.parentNode.parentNode
					? "=" + getUserName (post)
					: ""
				) + "]"
				+ sel.toString ().replace (
					/(?:>>-----Цитата---->>|^)(.*)<<-----Цитата----<</,
					function (str, p) {
						if (p!="") return "[quote]" + p + "[/quote]";
						else return "";
					})
				+ "[/quote]");
		}
	if (seltxt != "") {
		var post = seltxt.getRangeAt (0).commonAncestorContainer;
		while (post.className != "msg")
			post = post.parentNode;
		msg.wrtSel (i = addbr (getQuoteSrc (seltxt, post, this)), i.length);
	}
	else {
		var post = this.parentNode.parentNode;
		msg.wrtSel (i = addbr (getQuoteSrc (getTextContent (post), post, this)), i.length);
	}
	document.getElementById ('mode').selectedIndex = 0;
	return false;
}
function q () {
	var seltxt = getSelection ();
	if (seltxt != "") {
		var post = seltxt.getRangeAt (0).commonAncestorContainer;
		while (post.className != "msg")
			post = post.parentNode;
		msg.wrtSel (i = seltxt.toString ().replace (/(\n\r?|^)(?:\n\r?)?/g, "$1> ") + "\r\n", i.length);
	}
	else {
		post = this.parentNode.parentNode;
		msg.wrtSel (i = getTextContent (post).replace (/(\n\r?|^)(?:\n\r?)?/g, "$1> ")  + "\r\n", i.length);
	}
	document.getElementById ('mode').selectedIndex = 1;
	return false;
}
function user () {
	if ((i = getUserName (this.parentNode.parentNode)) != "anonymous")
		msg.wrtSel (i = "[user]" + i + "[/user], ", i.length);
	else msg.wrtSel (i = "[strong]Михаил[/strong], ", i.length);
	return false;
}
