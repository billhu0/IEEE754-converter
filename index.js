'use strict';
(function () {
    var cb_s = document.getElementById('cb-s');
    var cb_e = function () {
        var l = [];
        for (var i = 1; i <= 8; i++) {
            l.push(document.getElementById('cb-e' + i));
        }
        return l;
    }();
    var cb_m = function () {
        var l = [];
        for (var i = 1; i <= 23; i++) {
            l.push(document.getElementById('cb-m' + i));
        }
        return l;
    }();
    var txt_s = document.getElementById('txt-s');
    var txt_e = document.getElementById('txt-e');
    var txt_m = document.getElementById('txt-m');
    var mean_s = document.getElementById('mean-s');
    var mean_e = document.getElementById('mean-e');
    var mean_m = document.getElementById('mean-m');
    var bin_inp = document.getElementById('bin-input');
    var dec_inp = document.getElementById('dec-input');
    var hex_inp = document.getElementById('hex-input');
    var bin_inp_div = document.getElementById('bin-input-div');
    var dec_inp_div = document.getElementById('dec-input-div');
    var hex_inp_div = document.getElementById('hex-input-div');
    var real_vl = document.getElementById('real-value');
    var buffer = new ArrayBuffer(4);
    var view = new DataView(buffer);
    function __update_cb_meaning() {
        var bin = view.getUint32(0).toString(2);
        while (bin.length < 32)
            bin = '0' + bin;
        cb_s.checked = (bin[0] === '1');
        for (var i = 0; i < 8; i++) {
            cb_e[i].checked = (bin[i + 1] === '1');
        }
        for (var i = 0; i < 23; i++) {
            cb_m[i].checked = (bin[i + 9] === '1');
        }
        txt_s.innerHTML = bin[0];
        txt_e.innerHTML = bin.substring(1, 9);
        txt_m.innerHTML = bin.substring(9);
        mean_s.innerHTML = bin[0] === '0' ? '+1' : '-1';
        var exp_int = parseInt(bin.substring(1, 9), 2);
        var man_int = parseInt(bin.substring(9), 2);
        if (exp_int === 0) {
            mean_e.innerHTML = "2<span style=\"vertical-align: super\">-126</span> (denorm)";
        }
        else if (exp_int === 255) {
            if (man_int === 0) {
                mean_e.innerHTML = "Infinity";
            }
            else {
                mean_e.innerHTML = "NaN (not a number)";
            }
        }
        else {
            mean_e.innerHTML = "2<span style=\"vertical-align: super\">".concat(exp_int - 127, "</span>");
        }
        if (exp_int === 0) {
            mean_m.innerHTML = '0.' + bin.substring(9);
        }
        else {
            mean_m.innerHTML = '1.' + bin.substring(9);
        }
    }
    function __update_bin() {
        var bin = view.getUint32(0).toString(2);
        while (bin.length < 32)
            bin = '0' + bin;
        bin_inp.value = bin;
        bin_inp_div.classList.remove('is-invalid');
    }
    function __update_hex() {
        var hex = view.getUint32(0).toString(16);
        while (hex.length < 8)
            hex = '0' + hex;
        hex_inp.value = hex;
        hex_inp_div.classList.remove('is-invalid');
    }
    function __update_real() {
        real_vl.innerHTML = view.getFloat32(0).toString();
    }
    function cb_updated() {
        var s = cb_s.checked ? '1' : '0';
        var e = function () {
            var tmp = '';
            cb_e.forEach(function (cb_elem) {
                tmp += cb_elem.checked ? '1' : '0';
            });
            return tmp;
        }();
        var m = function () {
            var tmp = '';
            cb_m.forEach(function (cb_elem) {
                tmp += cb_elem.checked ? '1' : '0';
            });
            return tmp;
        }();
        view.setUint32(0, parseInt(s + e + m, 2));
        __update_cb_meaning();
        __update_bin();
        __update_hex();
        __update_real();
    }
    function bin_updated() {
        var _a;
        var s = bin_inp.value;
        if (((_a = s.match('(?:0[bB])?[0-1]{0,32}')) === null || _a === void 0 ? void 0 : _a.toString()) == s) {
            view.setUint32(0, parseInt(s, 2));
            __update_cb_meaning();
            __update_hex();
            __update_real();
        }
        dec_inp.value = '';
        dec_inp_div.classList.remove('is-invalid');
    }
    function hex_updated() {
        var _a;
        var s = hex_inp.value;
        if (((_a = s.match('(?:0[xX])?[0-9a-fA-F]{0,8}')) === null || _a === void 0 ? void 0 : _a.toString()) == s) {
            view.setUint32(0, parseInt(s, 16));
            __update_cb_meaning();
            __update_bin();
            __update_real();
        }
        dec_inp.value = '';
        dec_inp_div.classList.remove('is-invalid');
    }
    function dec_updated() {
        var s = dec_inp.value;
        if (s.match('-?[0-9]*(\\.[0-9]+)?') != null && s.match('-?[0-9]*(\\.[0-9]+)?')[0].toString() === s) {
            view.setFloat32(0, parseFloat(s));
            __update_cb_meaning();
            __update_bin();
            __update_hex();
            __update_real();
        }
    }
    cb_s.onchange = cb_updated;
    cb_e.forEach(function (e) { return e.onchange = cb_updated; });
    cb_m.forEach(function (e) { return e.onchange = cb_updated; });
    bin_inp.oninput = bin_updated;
    hex_inp.oninput = hex_updated;
    dec_inp.oninput = dec_updated;
    cb_updated();
})();
