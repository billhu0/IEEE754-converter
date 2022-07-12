'use strict';

// find elements

const elem_sign_value       = document.getElementById('sign_value');
const elem_exponent_value   = document.getElementById('exponent_value');
const elem_mantissa_value   = document.getElementById('mantissa_value');
const elem_encoded_sign     = document.getElementById('actual_sign');
const elem_encoded_exponent = document.getElementById('actual_exponent');
const elem_encoded_mantissa = document.getElementById('actual_mantissa');

const checkbox_sign = document.getElementById('cbsign');
const checkbox_exponent_arr = function () {
    var list1 = [];
    for (var i = 0; i < 8; i++){
        list1.push(document.getElementById('cbexp' + i));
    }
    return list1;
} ();
const checkbox_mantissa_arr = function () {
    var list = [];
    for (var i = 0; i < 23; i++){
        list.push(document.getElementById('cbmant' + i));
    }
    return list;
} ();

const input_decimal      = document.getElementById('decimal');
const input_actual_float = document.getElementById('highprecision_decimal');
const input_binary       = document.getElementById('binary');
const input_hexadecimal  = document.getElementById('hexadecimal');
const error_indicator    = document.getElementById('convstatus');

const buffer = new ArrayBuffer(4);
const view = new DataView(buffer);

function __update_checkbox_representation() {
    // binary value
    var bin = view.getUint32(0).toString(2);
    while (bin.length < 32) bin = '0' + bin;
    
    // binary checkbox
    elem_encoded_sign.innerHTML = bin[0];
    checkbox_sign.checked = bin[0] == '1';
    var tmp = '';
    for (var i = 0; i < 8; i++){
        checkbox_exponent_arr[i].checked = bin[i+1] == '1';
        tmp += bin[i+1];
    }
    elem_encoded_exponent.innerHTML = tmp;
    tmp = '';
    for (var i = 0; i < 23; i++){
        checkbox_mantissa_arr[i].checked = bin[i+9] == '1';
        tmp += bin[i+9];
    }
    elem_encoded_mantissa.innerHTML = tmp;

    // binary sign value encoding (for SEM)
    elem_sign_value.innerHTML = bin[0] == '1' ? 'negative' : 'positive';

    // binary exponent value encoding
    var exponent_value_int = parseInt(`${bin[1]}${bin[2]}${bin[3]}${bin[4]}${bin[5]}${bin[6]}${bin[7]}${bin[8]}`, 2);
    var mantissa_value_r = `${bin[9]}${bin[10]}${bin[11]}${bin[12]}${bin[13]}${bin[14]}${bin[15]}${bin[16]}${bin[17]}${bin[18]}${bin[19]}${bin[20]}${bin[21]}${bin[22]}${bin[23]}${bin[24]}${bin[25]}${bin[26]}${bin[27]}${bin[28]}${bin[29]}${bin[30]}${bin[31]}`;

    if (exponent_value_int == 0) {
        elem_exponent_value.innerHTML = `2<span style="vertical-align: super;">-126</span> (denorm)`;
    } else if (exponent_value_int == 255) {
        if (parseInt(mantissa_value_r, 2) == 0) {
            elem_exponent_value.innerHTML = `<span style="vertical-align: super;">Infinity</span>`;
        } else {
            elem_exponent_value.innerHTML = `<span style="vertical-align: super;">Not A Number</span>`;
        }
    } else {
        elem_exponent_value.innerHTML = `2<span style="vertical-align: super;">${exponent_value_int - 127}</span>`;
    }

    elem_mantissa_value.innerHTML = ((exponent_value_int == 0) ? '0.' : '1.') + mantissa_value_r;
}

function __update_hex_value_representation() {
    // convert to radix 16
    var hex_value = view.getUint32(0).toString(16);
    while (hex_value.length < 8) hex_value = '0' + hex_value;
    hex_value = hex_value;
    input_hexadecimal.value = hex_value;
}

function __update_binary_value_representation() {
    var bin = view.getUint32(0).toString(2);
    while (bin.length < 32) bin = '0' + bin;
    input_binary.value = bin;
}

function __update_decimal_value_representation() {
    var decimal_value = view.getFloat32(0);
    input_actual_float.value = decimal_value;
}

// when checkbox are changed, this function is called
function update_checkbox() {
    var sign = checkbox_sign.checked ? '1' : '0';
    var exponent = function () {
        var str = '';
        checkbox_exponent_arr.forEach(element => {
            str += element.checked ? '1' : '0';            
        });
        return str;
    } ();
    var mantissa = function () {
        var str = '';
        checkbox_mantissa_arr.forEach(element => {
            str += element.checked ? '1' : '0';
        });
        return str;
    } ();
    
    var binary_value_str = sign + exponent + mantissa;
    view.setUint32(0, '0b' + binary_value_str);

    __update_checkbox_representation();
    __update_decimal_value_representation();
    __update_binary_value_representation();
    __update_hex_value_representation();
    input_decimal.value = '';
    
    // remove error warning
    error_indicator.innerHTML = ``;
}

function update_decimal() {
    try {
        // check if decimal value is invalid
        var dot_detected = false;
        for (var i = 0; i < input_decimal.value.length; i++){
            var c = input_decimal.value[i];
            if (c >= '0' && c <= '9') continue;
            if (c == '.' && !dot_detected){
                dot_detected = true;
                continue;
            }
            if (c == '-' && i == 0) continue;
            throw Error('Invalid decimal value!');
        }
        
        view.setFloat32(0, input_decimal.value);
        
        __update_decimal_value_representation();
        __update_binary_value_representation();
        __update_checkbox_representation();
        __update_hex_value_representation();

        error_indicator.innerHTML = '';
    } catch (e) {
        console.log(e);
        error_indicator.innerHTML = `Invalid decimal number ${input_decimal.value}`;
    } finally {
        // do nothing
    }
}

function update_binary() {
    try {
        // check if binary value inputted is valid
        if (input_binary.value.length > 32){
            throw Error('Invalid binary value!');
        }

        for (var i = 0; i < input_binary.value.length; i++){
            var c = input_binary.value[i];
            if (c != '0' && c != '1'){
                throw Error('Invalid binary value!');
            }
        }

        view.setUint32(0, '0b' + input_binary.value);

        // clear input decimal value
        input_decimal.value = '';
        
        __update_decimal_value_representation();
        __update_checkbox_representation();
        __update_hex_value_representation();

        error_indicator.innerHTML = '';
    } catch (e) {
        console.log(e);
        error_indicator.innerHTML = `Invalid binary number ${input_binary.value}`;
    } finally {
        // do nothing
    }
}

function update_hex() {
    try {
        // check if inputted hex value inputted is valid
        if (input_hexadecimal.value.length > 8){
            throw Error('Invalid hexadecimal value!');
        }

        for (var i = 0; i < input_hexadecimal.value.length; i++){
            var c = input_hexadecimal.value[i];
            if ((c >= '0' && c <= '9') || (c >= 'A' || c <= 'F') || (c >= 'a' && c <= 'f')) continue;
            throw Error('Invalid hexadecimal value!');
        }

        view.setUint32(0, '0x' + input_hexadecimal.value);

        // clear input decimal value
        input_decimal.value = '';
        
        __update_decimal_value_representation();
        __update_binary_value_representation();
        __update_checkbox_representation();

        error_indicator.innerHTML = '';
    } catch (e) {
        console.log(e);
        error_indicator.innerHTML = `Invalid hexadecimal number "${input_hexadecimal.value}"`;
    } finally {
        // do nothing
    }
}

checkbox_sign.onchange = update_checkbox;
checkbox_exponent_arr.forEach(e => {e.onchange = update_checkbox});
checkbox_mantissa_arr.forEach(e => {e.onchange = update_checkbox});

input_decimal.oninput = update_decimal;
input_binary.oninput = update_binary;
input_hexadecimal.oninput = update_hex;

function init() {
    input_decimal.value = '0';
    update_decimal();
    error_indicator.innerHTML = '';
}

init();
