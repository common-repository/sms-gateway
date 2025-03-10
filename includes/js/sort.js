    /*
     originally written by paul sowden <paul@idontsmoke.co.uk> | http://idontsmoke.co.uk
     modified and localized by alexander shurkayev <alshur@narod.ru> | http://htmlcoder.visions.ru
     last modification 06.12.2009 by KDG http://htmlweb.ru/
     */

initial_sort_id = 0; // номер начального отсортированного столбца, начиная с нуля
initial_sort_up = 1; // 0 - сортировка вниз, 1 - вверх
var sort_case_sensitive = false; // чуствительновть к регистру при сотрировке

function _sort(a, b) {
    var a = a[0];
    var b = b[0];
    var _a = (a + '').replace(/,/, '.');
    var _b = (b + '').replace(/,/, '.');
    var reg_exp = /\d\d:\d\d:\d\d \d\d.\d\d.\d\d\d\d/;
    if (_a.match(reg_exp) && _b.match(reg_exp)) return sort_dates(_a, _b);
    if (parseInt(_a) && parseInt(_b)) return sort_numbers(parseInt(_a), parseInt(_b));
    else if (!sort_case_sensitive) return sort_insensitive(a, b);
    else return sort_sensitive(a, b);
}

function sort_numbers(a, b) {
    return a - b;
}

function sort_dates(a, b){
    var _a = a.match(/(\d\d):(\d\d):(\d\d) (\d\d).(\d\d).(\d\d\d\d)/);
    var _b = b.match(/(\d\d):(\d\d):(\d\d) (\d\d).(\d\d).(\d\d\d\d)/);
    for (var i=6; i>3; i--){
        if (_a[i] < _b[i]) return -1;
        if (_a[i] > _b[i]) return 1;
    }
    for (i=1; i<4; i++){
        if (_a[i] < _b[i]) return -1;
        if (_a[i] > _b[i]) return 1;
    }
    return 0;
}

function sort_insensitive(a, b) {
    var anew = a.toLowerCase();
    var bnew = b.toLowerCase();
    if (anew < bnew) return -1;
    if (anew > bnew) return 1;
    return 0;
}

function sort_sensitive(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

function getConcatenedTextContent(node) {
    var _result = "";
    if (node == null) {
        return _result;
    }
    var childrens = node.childNodes;
    var i = 0;
    while (i < childrens.length) {
        var child = childrens.item(i);
        switch (child.nodeType) {
            case 1: // ELEMENT_NODE
            case 5: // ENTITY_REFERENCE_NODE
                _result += getConcatenedTextContent(child);
                break;
            case 3: // TEXT_NODE
            case 2: // ATTRIBUTE_NODE
            case 4: // CDATA_SECTION_NODE
                _result += child.nodeValue;
                break;
            case 6: // ENTITY_NODE
            case 7: // PROCESSING_INSTRUCTION_NODE
            case 8: // COMMENT_NODE
            case 9: // DOCUMENT_NODE
            case 10: // DOCUMENT_TYPE_NODE
            case 11: // DOCUMENT_FRAGMENT_NODE
            case 12: // NOTATION_NODE
                // skip
                break;
        }
        i++;
    }
    return _result;
}

function sort(e) {
    var el = window.event ? window.event.srcElement : e.currentTarget;

    while (el.tagName.toLowerCase() != "td") el = el.parentNode;

    var a = new Array();
    var name = el.lastChild.nodeValue;
    var dad = el.parentNode;
    var table = dad.parentNode.parentNode;
    var up = table.up; // no set/getAttribute!

    var node, arrow, curcol;
    for (var i = 0; (node = dad.getElementsByTagName("td").item(i)); i++) {
        if (node.lastChild.nodeValue == name){
            curcol = i;
            if (node.className == "curcol"){
                arrow = node.firstChild;
                table.up = Number(!up);
            }else{
                node.className = "curcol";
                arrow = node.insertBefore(document.createElement("span"),node.firstChild);
                arrow.appendChild(document.createTextNode(""));
                table.up = 0;
            }
            arrow.innerHTML=((table.up==0)?"&#8595;":"&#8593;")+"&nbsp;";
        }else{
            if (node.className == "curcol"){
                node.className = "";
                if (node.firstChild) node.removeChild(node.firstChild);
            }
        }
    }
    var tbody = table.getElementsByTagName("tbody").item(0);
    for (var i = 0; (node = tbody.getElementsByTagName("tr").item(i)); i++) {
        a[i] = new Array();
        a[i][0] = getConcatenedTextContent(node.getElementsByTagName("td").item(curcol));
        a[i][1] = getConcatenedTextContent(node.getElementsByTagName("td").item(1));
        a[i][2] = getConcatenedTextContent(node.getElementsByTagName("td").item(0));
        a[i][3] = node;
    }

    a.sort(_sort);

    if (table.up) a.reverse();

    for (var i = 0; i < a.length; i++) {
        tbody.appendChild(a[i][3]);
    }
}

function init(e) {
    if (!document.getElementsByTagName) return;

    if (document.createEvent) function click_elem(elem){
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("click", false, false, window, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, elem);
        elem.dispatchEvent(evt);
    }

    for (var j = 0; (thead = document.getElementsByTagName("thead").item(j)); j++) {
        var node;
        for (var i = 0; (node = thead.getElementsByTagName("td").item(i)); i++) {
            if (node.addEventListener) node.addEventListener("click", sort, false);
            else if (node.attachEvent) node.attachEvent("onclick", sort);
            node.title = "Нажмите на заголовок, чтобы отсортировать колонку";
        }
        thead.parentNode.up = 0;

        if (typeof(initial_sort_id) != "undefined"){
            td_for_event = thead.getElementsByTagName("td").item(initial_sort_id);
            if (td_for_event.dispatchEvent) click_elem(td_for_event);
            else if (td_for_event.fireEvent) td_for_event.fireEvent("onclick");
            if (typeof(initial_sort_up) != "undefined" && initial_sort_up){
                if (td_for_event.dispatchEvent) click_elem(td_for_event);
                else if (td_for_event.fireEvent) td_for_event.fireEvent("onclick");
            }
        }
    }
}
var root = window.addEventListener || window.attachEvent ? window : document.addEventListener ? document : null;
if (root){
    if (root.addEventListener) root.addEventListener("load", init, false);
    else if (root.attachEvent) root.attachEvent("onload", init);
}