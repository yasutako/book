var http = require('http');
//after(data)
function get_data(address, encode, after) {
    var n = address.indexOf('/');
    var domain = address;
    if (n != -1) {
        domain = address.substring(0, n);
        address = address.substring(n, address.length);
    }
    else address = "/";
    var options = {
        host: domain,
        port: 80,
        path: address,
        method: "GET",
        headers: {
            "User-Agent": "node.js http client"
        }
    };
    var req = http.request(options, function(res) {
        res.setEncoding(encode);
        var data = "";
        res.on('data', function (part) {
            data += part;
        });
        res.on('end', function () {
            after(data);
        });
        //req.setTimeout(10 * 1000, function (socket) { });
    });
    req.on('socket', function (socket) {
        socket.setTimeout(myTimeout);
        socket.on('timeout', function () {
            req.abort();
        });
    });
    req.on('error', function (error) {
        console.log("http.error: " + error);
    });
    req.end();
} exports.get_data = get_data;
//after(html)
function struct_data(address, encode, after) {
    get_data(address, encode, function (data) {
        var html = new Html();
        html.data = data;
        html.address = address;
        html.analyse(data);
        after(html);
    });
}
function Html() {
    this.address = null;
    this.cls_map = new Object();
    this.id_map = new Object();
    this.name_map = new Object();
    this.main = new Tag(); this.main.type = "main";
    this.analyse = function (str) {
        var now = this.main;
        for (var i = 0; ; i++) {
            if (i >= str.length) return;
            var c = str[i];
            if (c == '<') {
                if (str[i + 1] == '/') {
                    now = now.parent;
                    for (var j = i + 1; ; j++) {
                        if (j >= str.length) return;
                        if (str[j] == '>') {
                            i = j;
                            break;
                        }
                    }
                    continue;
                }
                if (now.type == "script" || now.type == "style") continue;
                now = now.add(new Tag());
                var first = true;
                var text = "";
                for (var j = i + 1; j < str.length; j++) {
                    if (j >= str.length) return;
                    var c2 = str[j];
                    if (('a' <= c2 && c2 <= 'z') || ('A' <= c2 && c2 <= 'Z') || c2 == '-') {
                        for (var k = j + 1; ; k++) {
                            if (k >= str.length) return;
                            var c3 = str[k];
                            if (!(('a' <= c3 && c3 <= 'z') || ('A' <= c3 && c3 <= 'Z') || c3 == '-')) {
                                text = str.substring(j, k);
                                if (first) {
                                    now.type = text;
                                    first = false;
                                }
                                j = k - 1;
                                var n = 1;
                                n += 1;
                                break;
                            }
                        }
                        continue;
                    }
                    else if (c2 == "'" || c2 == '"') {
                        for (var k = j + 1; ; k++) {
                            if (k >= str.length) return;
                            var c3 = str[k];
                            if (c3 == c2) {
                                var value = str.substring(j + 1, k);
                                switch (text) {
                                    case "class":
                                        now.cls = value;
                                        if (typeof (this.cls_map[value]) == 'undefined') this.cls_map[value] = new Array();
                                        this.cls_map[value].push(now);
                                        break;
                                    case "name":
                                        now.name = value;
                                        this.name_map[value] = now;
                                        break;
                                    case "id":
                                        now.id = value;
                                        this.id_map[value] = now;
                                        break;
                                    default:
                                        now.attributes[text] = value;
                                }
                                j = k;
                                var n = 2;
                                n += 1;
                                break;
                            }
                        }
                        continue;
                    }
                    else if (c2 == '>') {
                        switch (now.type) {
                            case "DOCTYPE": case "meta": case "link": case "input": case "br":
                                now = now.parent;
                                break;
                        }
                        i = j;
                        var n = 3;
                        n += 1;
                        break;
                    }
                    else if (c2 == '/') {
                        if (str[j + 1] == '>') {
                            now = now.parent;
                            i = j + 1;
                            break;
                        }
                    }
                }
            }
            else now.text += c;
        }
    }
} exports.struct_data = struct_data;
function Tag() {
    this.type = null;
    this.name = null;
    this.cls = null;
    this.id = null;
    this.text = "";
    this.attributes = new Array();
    this.children = new Array();
}
Tag.prototype.add = function (tag) {
    tag.parent = this;
    this.children.push(tag);
    return tag;
}
Tag.prototype.next = function () {
    var children = this.parent.children;
    return children[children.indexOf(this) + 1];
}
Tag.prototype.before = function () {
    var children = this.parent.children;
    return children[children.indexOf(this) - 1];
}