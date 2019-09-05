window.log = function (log_content) {
    console.log(log_content);
};
//window.log = console.log;
function crt_elt(tagname, parent, id) {
    var elt = document.createElement(tagname);
    if (parent) {
        if (typeof parent == 'string') {
            elt.id = parent;
        } else {
            parent.appendChild(elt);
        }
    }
    if (id) {
        elt.id = id;
    }
    return elt;
}

function crt_icon(name, parent){
    const i_el = crt_elt('i', parent);
    i_el.className = name + ' icon';
    return i_el;
}

function crt_txt(text, parent) {
    var elt = document.createElement('span');
    elt.innerHTML = text;
    if (parent) {
        if (typeof parent == 'string') {
            elt.id = parent;
        } else {
            parent.appendChild(elt);
        }
    }
    return elt;
}

function style(elt, styles) {
    for (var p in styles) {
        if (styles.hasOwnProperty(p)) {
            elt.style[p] = styles[p];
        }
    }
}

function val(elt, value) {
    if (typeof elt == 'string') elt = get(elt);
    var p = get_primary_val_property(elt);

    if (typeof value != 'undefined') {
        elt[p] = value;
    }
    return elt[p];
}

function attr(elt, attr_name, value) {
    if (value) {
        elt.setAttribute(attr_name, value);
    }
    return elt.getAttribute(attr_name);
}

function attr_rm(elt, attr_name) {
    elt.removeAttribute(attr_name);
}

function class_rm(elt, className) {
    if(elt instanceof Array){
        for(let el of elt) class_rm(el, className);
        return;
    }
    var _class = elt.className;
    _class = _class.replace(className, '');
    if (elt.className != _class)
        elt.className = _class;
}

function class_add(elt, className) {
    if(elt instanceof Array){
        for(let el of elt) class_add(el, className);
        return;
    }
    if (elt.className.indexOf(className) == -1) {
        elt.className = (elt.className + ' ' + className).replace('  ', ' ');
    }
}

function get(element_id) {
    if (typeof element_id == 'object') return element_id;
    return document.getElementById(element_id);
}

function get_bc(class_name, parent) {
    if (typeof parent == 'undefined') parent = document;
    return parent.getElementsByClassName(class_name);
}

function get_bt(tag_name, parent) {
    if (typeof parent == 'undefined') parent = document;
    return parent.getElementsByTagName(tag_name);
}

function get_primary_val_property(elt) {
    var tn = elt.tagName;
    if (tn == 'INPUT' || tn == 'SELECT' || tn == 'TEXTAREA')
        return 'value';
    else if (tn == 'IMG')
        return 'src';
    else
        return 'innerHTML';
}

function setOptions(parent, options, incAll, textProp, valueProp) {
    parent.innerHTML = '';

    var p_t = (typeof textProp == 'undefined') ? 'text' : textProp;
    var p_v = (typeof valueProp == 'undefined') ? 'id' : valueProp;
    
    if (options) {
        attr_rm(parent, 'disabled');
    } else {
        attr(parent, 'disabled', true);
        return;
    }

    if (typeof incAll != 'undefined') {
        var opt = crt_elt('option');
        opt.value = '';
        if (typeof incAll == 'boolean' && incAll)
        { val(opt, 'All'); parent.appendChild(opt); }
        else if (typeof incAll != 'boolean')
        { val(opt, incAll); parent.appendChild(opt); }
    }

    for (var i = 0; i < options.length; i++) {
        var opt = crt_elt('option', parent);
        val(opt, options[i][p_t]);
        opt.value = options[i][p_v];
    }
    parent.selectedIndex = 0;
}

function getSelectedText(elt) {
    elt = get(elt);
    if (elt.selectedIndex == -1)
        return null;
    return elt.options[elt.selectedIndex].text;
}

function getIndexInParent(elt) {
    return Array.prototype.slice.call(elt.parentNode.children).indexOf(elt);
}

function insertNodeAsFirst(elt, parent) {
    if (parent.children.length) {
        parent.insertBefore(elt, parent.firstChild);
    } else {
        parent.appendChild(elt);
    }
}

function swapHtmlElts(elt1, elt2) {
    elt2.parentNode.removeChild(elt2);
    elt1.parentNode.insertBefore(elt2, elt1);
}

function moveEltToBot(elt) {
    elt.parentNode.appendChild(elt.parentNode.removeChild(elt));
}


function foreach(arr, func) {
    var l = arr.length;
    for (var i = 0; i < l; i++) {
        if (func(arr[i])) {
            break;
        }
    }
}

var xhr_timeout = 4000;

function httpGetAsync(theUrl, callback, failcallback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
        else if (xmlHttp.status === 404)
            if (failcallback) {
                failcallback();
                failcallback = null;
            }
    }
    xmlHttp.timeout = xhr_timeout;
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.addEventListener("error", failcallback);
    xmlHttp.send(null);
}

function httpPostText(theUrl, text, callback, failcallback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        console.log('onreadystatechange:' , xmlHttp)
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
        else if (xmlHttp.status === 404)
            if (failcallback) {
                failcallback();
                failcallback = null;
            }
    }
    xmlHttp.timeout = xhr_timeout;
    xmlHttp.open("POST", theUrl, true);
    xmlHttp.addEventListener("error", failcallback);
    xmlHttp.send(text);
}

function getBase64(file, callback, failCallback) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        callback(reader.result);
    };
    reader.onerror = function (error) {
        if (failCallback)
            failCallback(error);
    };
}

function timeToDate(time) {
    var d = (typeof time != 'undefined') ? new Date(time) : new Date();
    var y = d.getFullYear();
    var m = '0' + (d.getMonth() + 1);
    var day = '0' + d.getDate();
    var hours = '0' + d.getHours();
    var minutes = '0' + d.getMinutes();
    return y + '-' + m.substr(-2) + '-' + day.substr(-2) + ' ' + hours.substr(-2) + ':' + minutes.substr(-2);
}

function getTodaysTime() {
    var timestamp = Date.now();
    var dateStr = timeToDate(timestamp);
    return new Date(dateStr).getTime();
}

function getDayMillis() {
    return 60 * 60 * 24 * 1000;
}

function switchElements(fromElt, toElt, displayValue) {
    anime({
        targets: "#" + fromElt,
        opacity: 0,
        easing: 'easeOutExpo',
        duration: 300,
        complete: function () {
            get(fromElt).style.display = "none";
            var elt = get(toElt);
            elt.style.display = displayValue || (elt.tagName == 'IMG') ? 'inline-block' : 'block';
            anime({
                targets: "#" + toElt,
                opacity: 1,
                easing: 'easeOutExpo',
                duration: 300
            });
        }
    });
}

function dateToString(_date) {
    var mm = _date.getMonth() + 1;
    var dd = _date.getDate();

    return [_date.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
    ].join('-');
}

function clearRows(table){
    for(var i = table.rows.length - 1; i > 0; i--)
    {
        table.deleteRow(i);
    }
}

function setChild(child, parent){
    const old_child = parent.children[0];
    if(old_child) parent.removeChild(old_child);
    parent.appendChild(child);
}

function hideElt(elt) {
    get(elt).style.display = 'none';
}
function showElt(elt) {
    get(elt).style.display = 'unset';
}

function isDigitsOnly(str){
    return /^\d+$/.test(str);
}

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

function onSubmit(elt, handler){
    elt.addEventListener('keypress', e => {
        if((e && e.keyCode == 13) || e == 0){
            handler(elt);
        }
    });
}