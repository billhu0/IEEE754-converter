'use strict';

(function () {

    // get DOM elements

    // sign checkbox
    const cb_s: HTMLInputElement = document.getElementById('cb-s') as HTMLInputElement;
    // exponent checkbox
    const cb_e: HTMLInputElement[] = function () {
        let l: HTMLInputElement[] = [];
        for (let i = 1; i <= 8; i++) {
            l.push(document.getElementById('cb-e' + i) as HTMLInputElement);
        }
        return l;
    } ();
    // mantissa checkbox
    const cb_m: HTMLInputElement[] = function () {
        let l: HTMLInputElement[] = [];
        for (let i = 1; i <= 23; i++) {
            l.push(document.getElementById('cb-m' + i) as HTMLInputElement);
        }
        return l;
    } ();

    const txt_s: HTMLElement = document.getElementById('txt-s') as HTMLElement; // sign checkbox text
    const txt_e: HTMLElement = document.getElementById('txt-e') as HTMLElement; // exponent checkbox text
    const txt_m: HTMLElement = document.getElementById('txt-m') as HTMLElement; // mantissa checkbox text

    const mean_s: HTMLElement = document.getElementById('mean-s') as HTMLElement; // sign meaning text
    const mean_e: HTMLElement = document.getElementById('mean-e') as HTMLElement; // exponent meaning text
    const mean_m: HTMLElement = document.getElementById('mean-m') as HTMLElement; // mantissa meaning text

    const bin_inp: HTMLInputElement = document.getElementById('bin-input') as HTMLInputElement; // binary input
    const dec_inp: HTMLInputElement = document.getElementById('dec-input') as HTMLInputElement; // decimal input
    const hex_inp: HTMLInputElement = document.getElementById('hex-input') as HTMLInputElement; // hexadecimal input

    // outer 'div' around the 3 inputs which controls the input-invalid-prompt.
    const bin_inp_div: HTMLElement = document.getElementById('bin-input-div') as HTMLElement;
    const dec_inp_div: HTMLElement = document.getElementById('dec-input-div') as HTMLElement;
    const hex_inp_div: HTMLElement = document.getElementById('hex-input-div') as HTMLElement;

    const real_vl: HTMLElement = document.getElementById('real-value') as HTMLElement; // real value represented

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
        // get binary value (string) from dataView
        let bin: string = view.getUint32(0).toString(2);
        // force it to be 32-character long. Add '0' at the beginning if it is not long enough.
        while (bin.length < 32) bin = '0' + bin;
        // update binary value, and remove invalid prompt if it is present
        bin_inp.value = bin;
        bin_inp_div.classList.remove('is-invalid');
    }

    // update hex value input according to 'view'
    function __update_hex() {
        // get hexadecimal value (string) from dataView
        let hex: string = view.getUint32(0).toString(16);
        // force it to be 8-character long. Add '0' at the beginning if it is not long enough.
        while (hex.length < 8) hex = '0' + hex;
        // update binary value, and remove invalid prompt if it is present
        hex_inp.value = hex;
        hex_inp_div.classList.remove('is-invalid');
    }

    // update the real number represented according to 'view'
    function __update_real() {
        // use 'getFloat32' to get the real represented decimal value, and update display.
        // Note that the real represented value may not equal to the user-input decimal value.
        // For example, because of precision loss, 0.1 is stored as 0.10000000149011612.
        // That's why we set 'real_vl' and 'dec_input' as different things.
        real_vl.innerHTML = view.getFloat32(0).toString();
    }

    // When checkbox is updated, this func is called.
    // It reads checkbox status, updates the dataView, and update related elements.
    function cb_updated() {
        // traverse all the checkboxes and get the binary value (in string of '0' and '1')
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
        // parse the value and set the dataView
        view.setUint32(0, parseInt(s + e + m, 2));
        // update elements
        __update_cb_meaning();
        __update_bin();
        __update_hex();
        __update_real();
    }

    // when binary value is updated, this function is called
    function bin_updated() {
        // get input string
        let s: string = bin_inp.value;
        // if regexp matches, the input is valid
        if (s.match('(?:0[bB])?[0-1]{0,32}')?.toString() == s){
            view.setUint32(0, parseInt(s, 2));

            // update
            __update_cb_meaning();
            __update_hex();
            __update_real();
        }
        // clear input decimal value because it is not meaningful to update it.
        dec_inp.value = '';
        dec_inp_div.classList.remove('is-invalid');
    }

    // when hex value is updated, this function is called
    function hex_updated() {
        // get input string
        let s: string = hex_inp.value;
        // if regexp matches exactly, the input is valid
        if (s.match('(?:0[xX])?[0-9a-fA-F]{0,8}')?.toString() == s){
            view.setUint32(0, parseInt(s, 16));

            __update_cb_meaning();
            __update_bin();
            __update_real();
        }
        // clear input decimal value
        dec_inp.value = '';
        dec_inp_div.classList.remove('is-invalid');
    }

    // when decimal value is updated, this function is called.
    function dec_updated() {
        let s: string = dec_inp.value;
        // @ts-ignore
        if (s.match('-?[0-9]*(\\.[0-9]+)?') != null && s.match('-?[0-9]*(\\.[0-9]+)?')[0].toString() === s){
        // if (s.match('-?[0-9]*(\\.[0-9]+)?')?.toString() == s){
            view.setFloat32(0, parseFloat(s));
            // update elements
            __update_cb_meaning();
            __update_bin();
            __update_hex();
            __update_real();
        }
    }

    // event listeners
    cb_s.onchange = cb_updated;  // sign checkbox
    cb_e.forEach(e => e.onchange = cb_updated); // exponent checkbox
    cb_m.forEach(e => e.onchange = cb_updated); // mantissa checkbox
    bin_inp.oninput = bin_updated; // binary number input
    dec_inp.oninput = hex_updated; // decimal number input
    hex_inp.oninput = dec_updated; // hexadecimal number input

    // init elements.
    cb_updated();

})()