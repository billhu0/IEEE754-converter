'use strict';

(function () {

    // DOM elements

    // sign checkbox
    const cb_s = document.getElementById('cb-s') as HTMLInputElement;
    const cb_e: HTMLInputElement[] = function () {
        let l: HTMLInputElement[] = [];
        for (let i = 1; i <= 8; i++) {
            l.push(document.getElementById('cb-e' + i) as HTMLInputElement);
        }
        return l;
    } ();
    const cb_m: HTMLInputElement[] = function () {
        let l: HTMLInputElement[] = [];
        for (let i = 1; i <= 23; i++) {
            l.push(document.getElementById('cb-m' + i) as HTMLInputElement);
        }
        return l;
    } ();

    const txt_s: HTMLElement = document.getElementById('txt-s') as HTMLElement; // sign checkbox text
    const txt_e = document.getElementById('txt-e') as HTMLElement; // exponent checkbox text
    const txt_m = document.getElementById('txt-m') as HTMLElement; // mantissa checkbox text

    const mean_s = document.getElementById('mean-s') as HTMLElement;
    const mean_e = document.getElementById('mean-e') as HTMLElement;
    const mean_m = document.getElementById('mean-m') as HTMLElement;

    const bin_inp = document.getElementById('bin-input') as HTMLInputElement;
    const dec_inp = document.getElementById('dec-input') as HTMLInputElement;
    const hex_inp = document.getElementById('hex-input') as HTMLInputElement;

    const bin_inp_div = document.getElementById('bin-input-div') as HTMLElement;
    const dec_inp_div = document.getElementById('dec-input-div') as HTMLElement;
    const hex_inp_div = document.getElementById('hex-input-div') as HTMLElement;

    const real_vl = document.getElementById('real-value') as HTMLElement;

    // base data type holding the floating point number
    const buffer: ArrayBuffer = new ArrayBuffer(4);
    const view: DataView = new DataView(buffer);

    // update checkbox values and binary meanings according to 'view'
    function __update_cb_meaning(){
        let bin: string = view.getUint32(0).toString(2);
        while (bin.length < 32) bin = '0' + bin;

        cb_s.checked = (bin[0] === '1'); // sign checkbox
        for (let i = 0; i < 8; i++) {
            cb_e[i].checked = (bin[i+1] === '1');
        } // exponent checkbox
        for (let i = 0; i < 23; i++) {
            cb_m[i].checked = (bin[i+9] === '1');
        } // mantissa checkbox

        txt_s.innerHTML = bin[0]; // sign text
        txt_e.innerHTML = bin.substring(1, 9); // exponent text
        txt_m.innerHTML = bin.substring(9); // mantissa text

        // sign meaning
        mean_s.innerHTML = bin[0] === '0' ? '+1' : '-1';

        // exponent meaning
        let exp_int: number = parseInt(bin.substring(1, 9), 2);
        let man_int: number = parseInt(bin.substring(9), 2);
        if (exp_int === 0) {
            mean_e.innerHTML = `2<span style="vertical-align: super">-126</span> (denorm)`;
        } else if (exp_int === 255) {
            if (man_int === 0) {
                mean_e.innerHTML = `Infinity`;
            } else {
                mean_e.innerHTML = `NaN (not a number)`;
            }
        } else {
            mean_e.innerHTML = `2<span style="vertical-align: super">${exp_int - 127}</span>`;
        }

        // mantissa meaning
        if (exp_int === 0){
            mean_m.innerHTML = '0.' + bin.substring(9);
        } else {
            mean_m.innerHTML = '1.' + bin.substring(9);
        }
    }

    // update binary value input according to 'view'
    function __update_bin() {
        let bin: string = view.getUint32(0).toString(2);
        while (bin.length < 32) bin = '0' + bin;
        bin_inp.value = bin;
        bin_inp_div.classList.remove('is-invalid');
    }

    function __update_hex() {
        let hex: string = view.getUint32(0).toString(16);
        while (hex.length < 8) hex = '0' + hex;
        hex_inp.value = hex;
        hex_inp_div.classList.remove('is-invalid');
    }

    function __update_real() {
        real_vl.innerHTML = view.getFloat32(0).toString();
    }

    function cb_updated() {
        let s: string = cb_s.checked ? '1' : '0';
        let e: string = function () {
            let tmp: string = '';
            cb_e.forEach(cb_elem => {
                tmp += cb_elem.checked ? '1' : '0';
            });
            return tmp;
        } ();
        let m: string = function () {
            let tmp: string = '';
            cb_m.forEach(cb_elem => {
                tmp += cb_elem.checked ? '1' : '0';
            });
            return tmp;
        } ();

        view.setUint32(0, parseInt(s + e + m, 2));
        __update_cb_meaning();
        __update_bin();
        __update_hex();
        __update_real();
    }

    function bin_updated() {
        let s: string = bin_inp.value;
        // if regexp matches, the input is valid
        if (s.match('(?:0[bB])?[0-1]{0,32}')?.toString() == s){
            view.setUint32(0, parseInt(s, 2));

            // update
            __update_cb_meaning();
            __update_hex();
            __update_real();
        }
        // clear input decimal value
        dec_inp.value = '';
        dec_inp_div.classList.remove('is-invalid');
    }

    function hex_updated() {
        let s: string = hex_inp.value;
        if (s.match('(?:0[xX])?[0-9a-fA-F]{0,8}')?.toString() == s){
            view.setUint32(0, parseInt(s, 16));

            __update_cb_meaning();
            __update_bin();
            __update_real();
        }
        dec_inp.value = '';
        dec_inp_div.classList.remove('is-invalid');
    }

    function dec_updated() {
        let s: string = dec_inp.value;
        // @ts-ignore
        if (s.match('-?[0-9]*(\\.[0-9]+)?') != null && s.match('-?[0-9]*(\\.[0-9]+)?')[0].toString() === s){
        // if (s.match('-?[0-9]*(\\.[0-9]+)?')?.toString() == s){
            // view.setUint32(0, parseFloat(s));
            view.setFloat32(0, parseFloat(s));

            __update_cb_meaning();
            __update_bin();
            __update_hex();
            __update_real();
        }
    }

    // event listeners
    cb_s.onchange = cb_updated;
    cb_e.forEach(e => e.onchange = cb_updated);
    cb_m.forEach(e => e.onchange = cb_updated);
    bin_inp.oninput = bin_updated;
    hex_inp.oninput = hex_updated;
    dec_inp.oninput = dec_updated;

    // init
    cb_updated();

})()