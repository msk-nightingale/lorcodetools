// ==UserScript==
// @name LORCode Tools
// @description Кнопка цитирования выделенного и панель тегов для LORCODE
// @author Алексей Соловьев (moscwich, msk.nightingale)
// @version 0.22-1
// @license Creative Commons Attribution 3.0 Unported
// @include https://www.linux.org.ru/*
// @grant none
// ==/UserScript==

function set (p, z) {
	for (i = 0; i < arguments.length && (arguments[i] === undefined); i++) {}
	return arguments[i];
}

var i = j = undefined;
var a = b = undefined;

var form = document.getElementById ("commentForm") || document.getElementById ("messageForm") || document.getElementById ("editRegForm");
var msg = document.getElementById ("msg") || document.getElementById ("form_msg") || document.getElementById ("info");
var u = window.location.href;
var s = "";

// Panel
var panel = document.createElement ("div");
panel.id = 'atag';
panel.createBlock =
	function () {
		var block = document.createElement ("span");
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
	["[b]", "Полужирный", 'edge ("strong");'],
	["[i]", "Курсив", 'edge ("em");'],
	["[s]", "Зачеркнутый", 'edge ("s");']
);
panel.createBlock (
	["[quote]", "Цитата", 'edge ("quote"); tex (true);'],
	["[code]", "Код", 'edge ("code"); tex (true);']
);
panel.createBlock (
	["[url]", "URL", 'address ();'],
	["[user]", "Участник", 'edge ("user");']
);
panel.createBlock (
	["[list]", "Список", 'edge ("list"); tex (true);'],
	["[*]", "Элемент списка", 'msg.wrtSel ("[*]", ""); tex (true);']
);
panel.createBlock (
	["„“", "Кавычки", 'msg.wrtSel ("„", "“");'],
	["[br]", "Перевод строки", 'msg.wrtSel ("[br]", "");']
);
panel.createBlock (
	[" fix ", "Превратить знаки и обозначения в соответствующие спец. символы", 'correct ();'],
	[" deltags-in ", "Удалить крайнее входящие обрамление тегами", 'inside ();'],
	[" brs ", "Добавить [br] к переводам строк", 'breaks (); tex (true);']
);

msg.parentNode.insertBefore (panel, msg);
msg.cols = 100;
msg.rows = 20;

// Styles
style = document.createElement ("style");
style.innerHTML = '\
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
document.getElementsByTagName ("head")[0].appendChild (style);

// Add quote links
var t = new Array ();
var d = document.getElementsByClassName ("title");
for (i = 0; i < d.length; i++)
	if (d[i].parentNode.className == "msg")
		t.push (d[i]);

t.createLink = function () {
	for (i = 0; i < this.length; i++) {
		for (j in arguments) {
			var link = document.createElement ("a");
			link.onclick = arguments[j][1];
			link.href = u; link.textContent = arguments[j][0];
			this[i].insertBefore (
				document.createTextNode ("] "),
				this[i].firstChild
			);
			this[i].insertBefore (
				document.createTextNode ("["),
				this[i].insertBefore (link, this[i].firstChild)
			);
		}
	}
}
t.createLink (['цитата', quote], ['блок-цитата', block], ['юзер', user]);

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

msg.wrtSel = // alt. (before, after, offset)
	function (subj, offset, before, after, zset) {
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
function getUserName (post) {
	if (s = post.getElementsByClassName ("sign")[0].getElementsByTagName ("a")[0]) return s.innerHTML;
	else return "anonymous";
}

function br (subject) {
	return subject.replace (/^((?:(?!\[\/?(?:quote|code|list|br)(?:=.*)?\]$)[^\n\r])+)(\r?\n)(?!\n|\[\/?(?:br|quote(?:=.*)?|code(?:=.*)?)\])/gm, "$1[br]$2");
}
function tex (on) {
	document.getElementById ('mode').selectedIndex = !on;
	return false;
}

// Functions to run

function edge (tag, arg) {
	var arg = arg || "";
	msg.wrtSel (
		undefined,
		tag.length + arg.length + 2,
		"[" + tag + arg + "]",
		"[/" + tag + "]"
	);
}

function inside () {
	var z = msg.value.substring (a = msg.selectionStart, b = msg.selectionEnd);
	var c = z.replace (/\[\w+\](.*)\[\/\w+\]/, "$1");
	msg.wrtSel (c, 0, "", "", - z.length + c.length);
}
function address () {
	s = msg.value.substring (a = msg.selectionStart, b = msg.selectionEnd);
	if (/((ftp|http|https):\/\/)[\.\w- ]{2,}\.[A-Za-z]{2,4}(\/?$|\/.*)/.test (s) || s.length == 0)
	msg.wrtSel (s, 5,"[url]", "[/url]");
	else if (/[\.\w- ]{2,}\.[A-Za-z]{2,4}(\/?$|\/.*)/.test (s))
	msg.wrtSel ("http://"+s, 5, "[url]", "[/url]", 7);
	else msg.wrtSel (s, 5, "[url=]", "[/url]", -s.length);
}

function block () {
	var selection = getSelection ();
	var getQuoteSrc =
		function (select, post, snap) {
			return (
				"[quote" + (
					snap.parentNode.parentNode != msg.parentNode.parentNode.parentNode.parentNode.parentNode
					? "=" + getUserName (post)
					: ""
				) + "]"
				+ select.toString ().replace (
					/(?:>>-----Цитата---->>|^)(.*)<<-----Цитата----<</,
					function (str, p) {
						if (p != "") return "[quote]" + p + "[/quote]";
						else return "";
					})
				+ "[/quote]");
		}
	if (selection != "") {
		var post = selection.getRangeAt (0).commonAncestorContainer;
		while (post.className != "msg") post = post.parentNode;
		msg.wrtSel (s = br (getQuoteSrc (selection, post, this)), s.length);
	}
	else {
		var post = this.parentNode.parentNode;
		msg.wrtSel (s = br (getQuoteSrc (getTextContent (post), post, this)), s.length);
	}
	tex (true);
	return false;
}
function quote () {
	var seltxt = getSelection ();
	if (seltxt != "") {
		var post = seltxt.getRangeAt (0).commonAncestorContainer;
		while (post.className != "msg") post = post.parentNode;
		msg.wrtSel (s = seltxt.toString ().replace (/(\n\r?|^)(?:\n\r?)?/g, "$1> ") + "\r\n", s.length);
	}
	else {
		post = this.parentNode.parentNode;
		msg.wrtSel (s = getTextContent (post).replace (/(\n\r?|^)(?:\n\r?)?/g, "$1> ") + "\r\n", s.length);
	}
	tex (false);
	return false;
}
function user () {
	if ((i = getUserName (this.parentNode.parentNode)) != "anonymous")
	msg.wrtSel (s = "[user]" + i + "[/user], ", s.length);
	else msg.wrtSel (s = "[strong]Михаил[/strong], ", s.length);
	return false;
}

function correct () {
	a = msg.selectionStart;
	b = msg.selectionEnd;
	var scheme = [
		[/\(c\)/gi, "©"],
		[/\([rр]\)/gi, "®"],
		[/\(f\)/gi, "£"],
		[/\(e\)/gi, "€"],
		[/%\/10/g, "‰"],
		[/%\/100/g, "‱"],
		[/\(V\)/g, "✓"],
		[/\(V\+\)/g, "✔"],
		[/\(x\)/g, "✗"],
		[/\(x\+\)/g, "✘"],
		[/`/g, "&#769;"],
		[/\(p\)/gi, "§"],
		[/(^| )- /g, "$1— "],
		[/-->/g, "→"],
		[/\(\*\+?\)/g, "★"],
		[/\(\*-\)/g, "☆"],
		[/\([tт][mм]\)/gi, "™"]
	];
	scheme.exec = function (subject) {
		for (i = 1; i < this.length; i++) subject = subject.replace (this[i][0], this[i][1]);
		return subject;
	}

	if (a != b) {
		s = msg.value.substring (a, b);
		var z = scheme.exec (s);
		msg.wrtSel (z, 0, "", "", z.length - s.length);
	}
	else
	msg.value = scheme.exec (msg.value);
}
function breaks () {
	a = msg.selectionStart;
	b = msg.selectionEnd;
	if (a != b) {
		var c = msg.value.substring (a, b);
		var z = br (c);
		msg.wrtSel (z, 0, "", "", z.length - c.length);
	}
	else
	msg.value = br (msg.value);
}
