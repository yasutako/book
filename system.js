String.prototype.start_with = function (str) {
    if (this.length < str.length) return false;
    for (var i = 0; i < str.length; i++) {
        if (this.charCodeAt(i) != str.charCodeAt(i)) return false;
    }
    return true;
}
String.prototype.remove_protocol = function () {
    var n = this.indexOf("://");
    if (n == -1) n = 0;
    else n += 3;
    return this.substring(n, this.length);
}
String.prototype.domain = function () {
    return this.substring(0, this.indexOf('/'));
}
String.convert_character = function (c) {
    if (c == 0x3000 || c == 0x2003) c = 0x0020;
    else if (0x2160 <= c && c <= 0x2168) {
        c = 0x0031 + c - 0x2160;
    }
    else if (c == 0x3010) c = 0x005B;
    else if (c == 0x3011) c = 0x005D;
    else if ((c & 0xFF00) == 0xFF00) {
        if (0xFF01 <= c && c <= 0xFF5E) {
            c = 0x0020 + c - 0xFF00;
        }
        else if (0xFF5F <= c && c <= 0xFF60) {
            c = 0x2985 + c - 0xFF5F;
        }
        else if (0xFF61 <= c && c <= 0xFF64) {
            switch (c) {
                case 0xFF61: c = 0x3002; break;
                case 0xFF62: c = 0x300C; break;
                case 0xFF63: c = 0x300D; break;
                case 0xFF64: c = 0x3001; break;
            }
        }
        else if (0xFF65 <= c && c <= 0xFF9F) {
            switch (c) {
                case 0xFF65: c = 0x30FB; break;
                case 0xFFF6: c = 0x30F2; break;
            }
        }
        else if (0xFFE0 <= c && c <= 0xFFE6) { }
        else if (0xFFE8 <= c && c <= 0xFFEE) { }
    }
    return c;
}
String.is_symbol = function (c) {
    if ((0x0020 <= c && c <= 0x002F) ||
        (0x003A <= c && c <= 0x0040) ||
        (0x005B <= c && c <= 0x0060) ||
        (0x007B <= c && c <= 0x007E)) {
        return true;
    }
    else {
        switch (c) {
            case 0x2985: case 0x2986: case 0x3001: case 0x3002:
            case 0x300C: case 0x300D: case 0x30FB:
                return true;
            default:
                return false;
        }
    }
}
String.is_number = function (c) {
    if (0x0030 <= c && c <= 0x0039) return true;
    return false;
}
String.prototype.get_numbers = function () {
    var n = 0;
    var count = 0;
    var numbers = [];
    for (var i = this.length; i >= 0; i--) {
        var c = this.charCodeAt(i);
        if (String.is_number(c)) {
            var n2 = c - 0x0030;
            for (var j = 0; j < count; j++) n2 *= 10;
            n += n2;
            count++;
        }
        else {
            count = 0;
            if (n != 0) {
                numbers.unshift(n);
                n = 0;
            }
        }
    }
    if (n != 0) numbers.unshift(n);
    return numbers;
}