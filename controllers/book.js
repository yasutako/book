var http = require('http');
var model_book = require('../models/m_book');
var htm = require('../html');
//var iconv = require('node-iconv');
function get_book_list_in_amazon() {
}
//after(list)
function get_book_list(address, after) {
    switch (address.domain()) {
        case "booklive.jp":
            get_book_list_in_booklive(address, after); break;
        case "bookweb.kinokuniya.co.jp":
            get_book_list_in_bookweb(address, after); break;
        case "tsutaya.com":
            get_book_list_in_tutaya(address, after); break;
        case "www.amazon.co.jp":
            get_book_list_in_amazon(address, after); break;
        case "bookwalker.jp":
            get_book_list_in_bookwalker(address, after); break;
    }
}; exports.get_book_list = get_book_list;
function get_book_list_in_booklive(address, after) {
    htm.get_data(address, "utf8", function (data) {
        var list = [];
        for (var n = 0; ; ) {
            n = data.indexOf("/product/index/title_id/", n + 1);
            if (n == -1) break;
            else {
                var address = "booklive.jp" + data.substring(n, n = data.indexOf('"', n));
                if (n == -1) break;
                var n2 = address.indexOf("/lp/");
                if (n2 != -1) address = address.substring(0, n2);
                var book = new model_book.Book(address);
                list.push(book);
            }
        }
        if (after == undefined) {
            for (var i = 0; i < list.length; i++) list[i].load_map();
        }
        else after(list);
    });
}
function get_book_list_in_bookwalker(address, after) {
    htm.get_data(address, "utf8", function (data) {
        var list = [];
        for (var n = 0; ;) {
            n = data.indexOf("bookwalker.jp/pc/detail/", n + 1);
            if (n == -1) break;
            else {
                var address = data.substring(n, n = data.indexOf('"', n));
                if (n == -1) break;
                var book = new model_book.Book(address);
                list.push(book);
            }
        }
        if (after == undefined) {
            for (var i = 0; i < list.length; i++) list[i].load_map();
        }
        else after(list);
    });
}
function get_book_list_in_tutaya(address, after) {
    htm.get_data(address, "utf8", function (data) {
        var list = [];
        for (var n = 0; ;) {
            n = data.indexOf("tsutaya.com/ebooks/pc/contents/bookinfo/", n + 1);
            if (n == -1) break;
            else {
                var address = data.substring(n, n = data.indexOf('"', n));
                if (n == -1) break;
                var book = new model_book.Book(address);
                list.push(book);
            }
        }
        if (after == undefined) {
            for (var i = 0; i < list.length; i++) list[i].load_map();
        }
        else after(list);
    });
}
function get_book_list_in_bookweb(address, after) {
    htm.get_data(address, "utf8", function (data) {
        var list = [];
        for (var n = 0; ;) {
            n = data.indexOf("/htm/", n + 1);
            if (n == -1) break;
            else {
                var address = "bookweb.kinokuniya.co.jp" + data.substring(n, n = data.indexOf('"', n));
                if (n == -1) break;
                var book = new model_book.Book(address);
                list.push(book);
            }
        }
        if (after == undefined) {
            for (var i = 0; i < list.length; i++) list[i].load_map();
        }
        else after(list);
    });
}
function get_book_list_in_amazon(address, after) {
    htm.get_data(address, "utf8", function (data) {
        var list = [];
        for (var n = 0; ;) {
            n = data.indexOf("/gp/product/", n + 1);
            if (n == -1) break;
            else {
                data = data.replace("/gp/product/", "/dp/");
                var address = "www.amazon.co.jp" + data.substring(n, n = data.indexOf("/ref", n));
                if (n == -1) break;
                var book = new model_book.Book(address);
                list.push(book);
            }
        }
        if (after == undefined) {
            for (var i = 0; i < list.length; i++) list[i].load_map();
        }
        else after(list);
    });
}
//after(book)
function get_book_info(book, after) {
    switch (book.address.domain()) {
        case "booklive.jp":
            get_book_info_in_booklive(book, after); break;
        case "bookweb.kinokuniya.co.jp":
            get_book_info_in_bookweb(book, after); break;
        case "tsutaya.com":
            get_book_info_in_tutaya(book, after); break;
        case "www.amazon.co.jp":
            get_book_info_in_amazon(book, after); break;
        case "bookwalker.jp":
            get_book_info_in_bookwalker(book, after); break;
    }
}; exports.get_book_info = get_book_info;
function get_book_info_in_booklive(book, after) {
    htm.struct_data(book.address, "utf8", function (html) {
        var error = html.cls_map["ttl001 pb10 mb40"];
        if (error !== undefined && error[0].children[0].text == "システムエラー") {
            book.name = "";
            book.author = "";
            book.publisher = "";
            book.preview = "";
            book.price = "";
            book.image_address = "";
            book.type = 16;
            book.links = [];
            book.date = new Date(2000, 0, 1);
        }
        else {
            book.name = html.id_map["product_column_data"].children[0].text.replace(/[【】]/g, "");
            var product_data = html.cls_map["product_data"][0];
            book.author = "";
            var n = 0;
            if (product_data.children[0].text == "ジャンル") {
                n = 2;
            }
            else {
                for (var i = 0; i < product_data.children[1].children.length; i++) book.author += product_data.children[1].children[i].text;
            }
            //book.genre = product_data.children[3].text;
            book.publisher = product_data.children[5 - n].children[0].text;
            var numbers = product_data.children[7 - n].text.get_numbers();
            book.date = new Date(numbers[0], numbers[1] - 1, numbers[2]);
            book.type = 16;
            book.image_address = html.cls_map["product_image"][0].children[0].attributes["src"];
            book.preview = html.cls_map["product_text"][0].text;
            book.price = html.cls_map["product_price_data"][0].children[0].text;
            if (html.cls_map["cm_btn_l product_read_tour"] !== undefined) book.free = true;
            else book.free = false;
            book.links = [];
            var cls = html.cls_map["product_series_title multiline"];
            if (cls !== undefined) {
                for (var i = 0; i < cls.length; i++) {
                    var link = "booklive.jp" + cls[i].children[0].attributes["href"];
                    var n2 = link.indexOf("/lp/");
                    if (n2 != -1) link = link.substring(0, n2);
                    book.links.push(link);
                    //if (map_book[link] === undefined) map_book[link] = false;
                    //check_list_book.push(link);
                }
            }
            cls = html.cls_map["title multiline __truncated"];
            if (cls !== undefined) {
                for (var i = 0; i < cls.length; i++) {
                    var link = "booklive.jp" + cls[i].children[0].attributes["href"];
                    var n2 = link.indexOf("/lp/");
                    if (n2 != -1) link = link.substring(0, n2);
                    book.links.push(link);
                    //if (map_book[link] === undefined) map_book[link] = false;
                    //check_list_book.push(link);
                }
            }
            cls = html.cls_map["title multiline"];
            if (cls !== undefined) {
                for (var i = 0; i < cls.length; i++) {
                    var link = "booklive.jp" + cls[i].children[0].attributes["href"];
                    var n2 = link.indexOf("/lp/");
                    if (n2 != -1) link = link.substring(0, n2);
                    book.links.push(link);
                    //if (map_book[link] === undefined) map_book[link] = false;
                    //check_list_book.push(link);
                }
            }
        }
        book.set_name(book.name);
        if (after === undefined) book.check();
        else {
            book.set_key();
            after(book);
        }
    });
}

//var conv = new iconv.Iconv('sjis', 'UTF-8');
function get_book_info_in_bookweb(book, after) {
    //htm.struct_data_c(book.address, conv, function (html) {
    htm.struct_data("img-cash-" + (a++ % a_max) + ".appspot.com/converter?encode=sjis&path=" + escape("http://" + book.address), "utf8", function (html) {
        var list = html.cls_map["check-du"];
        if (list !== undefined) {
            book.name = "";
            book.author = "";
            book.date = new Date(2000, 0, 1);
            book.publisher = "";
            book.preview = "";
            book.price = "";
            book.image_address = "";
            book.type = -1;
            book.links = [];
            book.links.push("bookweb.kinokuniya.co.jp" + html.cls_map["pro-bname"][0].children[0].attributes["href"]);
        }
        else {
            var product = html.cls_map["dbooktitle"][0];
            book.name = html.cls_map["font16"][0].children[0].text;
            var p_next = product.next();
            book.author = "";
            for (var i = 0; ; i++) {
                if (i == p_next.children.length - 1) {
                    book.publisher = p_next.children[i].text;
                    break;
                }
                var text = p_next.children[i].text;
                var n = text.indexOf("【");
                if (n != -1) text = text.substring(0, n);
                book.author += text;
            }
            var numbers = p_next.text.get_numbers();
            book.date = new Date(numbers[0], numbers[1] - 1, numbers[2]);
            var bk = html.cls_map["dtul"];
            if (bk === undefined) book.type = 16;
            else book.type = 1;
            var pb = html.cls_map["pro-bname"];
            book.price = html.cls_map["pro-price2"][0].text + "(税込)";
            var n3 = html.data.indexOf('<div class="pickup_title2"><h3>詳細</h3></div>');
            if (n3 == -1) {
                book.preview = "";
            }
            else {
                n3 += '<div class="pickup_title2"><h3>詳細</h3></div>'.length;
                book.preview = html.data.substring(n3, html.data.indexOf('<div class="sp-h20">', n3));
            }
            if (html.name_map["API"] === undefined) book.free = false;
            else book.free = true;
            var dlid_0 = html.cls_map["dltd"][0].children[0];
            if (dlid_0.type == "img") book.image_address = "html://bookweb.kinokuniya.co.jp" + dlid_0.attributes["src"];
            else book.image_address = "http://bookweb.kinokuniya.co.jp" + dlid_0.children[0].attributes["src"];
            book.links = [];
            if (pb !== undefined) {
                book.links.push("bookweb.kinokuniya.co.jp" + pb[0].next().next().attributes["href"]);
            }
            var cls = html.cls_map["rb2td"];
            if (cls !== undefined) {
                for (var i = 0; i < cls.length; i++) {
                    var link = cls[i].children[0].attributes["href"];
                    link = link.replace("./", "/guest/cgi-bin/");
                    link = link.replace("-1", "");
                    link = link.replace("_1", "");
                    link = link.replace("ureflg=1&", "");
                    book.links.push("bookweb.kinokuniya.co.jp" + link);
                }
            }
            cls = html.cls_map["genre-r03-td01_4"];
            if (cls !== undefined) {
                for (var i = 0; i < cls.length; i++) {
                    var link = cls[i].children[0].attributes["href"];
                    link = link.replace("./", "/guest/cgi-bin/");
                    link = link.replace("-1", "");
                    link = link.replace("_1", "");
                    link = link.replace("ureflg=1&", "");
                    book.links.push("bookweb.kinokuniya.co.jp" + link);
                }
            }
        }
        book.set_name(book.name);
        if (after === undefined) book.check();
        else {
            book.set_key();
            after(book);
        }
    });
}
function get_book_info_in_honto(book, after) {
    htm.struct_data(book.address, "utf8", function (html) {
        book.name = html.cls_map["item"][0].children[0].text;
        book.author = "";
        var authors = htm.cls_map["stAuthor"];
        for (var i = 0; i < authors.length; i++) {
            book.author += authors[i].children[0].text;
        }
        book.author = book.author.replace("(著)", "");
        book.publisher = html.cls_map["stItemData"][0].children[0].children[0].text;
        var status = html.cls_map["stIconProdut01"];
        if (status[0] == "電子書籍") book.type = 16;
        else if (status[0] == "本") book.type = 1;
        var map = new Array();
        book.links = [];
        book.set_name(book.name);
        if (after === undefined) book.check();
        else {
            book.set_key();
            after(book);
        }
    });
}
function get_book_info_in_tutaya(book, after) {
    htm.struct_data(book.address, "utf8", function (html) {
        var detail = html.cls_map["sHeadStyle"][0]
        book.name = detail.text.replace(/&nbsp;/g, " ");
        var detail2 = html.cls_map["price"][0].children[10];
        book.author = "";
        var authors = html.cls_map["price"][0].children[8];
        if (authors !== undefined) {
            for (var i = 0; i < authors.children.length; i++) {
                book.author += authors.children[i].text;
            }
        }
        else book.author = "";
        book.publisher = detail2.children[0].text;
        book.type = 16;
        book.image_address = html.cls_map["jacket"][0].attributes["src"];
        book.price = html.cls_map["price"][0].children[1].text.replace(/[:\s]/g, "");
        book.price = book.price.substring(1, book.price.length);
        book.free = false;
        book.preview = html.cls_map["text"][0].text;
        book.links = [];
        var links = html.cls_map["element"];
        if (links !== undefined) {
            for (var i = 0; i < links.length; i++) {
                book.links.push(links[i].children[0].children[0].attributes["href"].remove_protocol());
            }
        }
        book.set_name(book.name);
        if (after === undefined) book.check();
        else {
            book.set_key();
            after(book);
        }
    });
}
var a = 0; var a_max = 7;
function get_book_info_in_amazon(book, after) {
    htm.struct_data("img-cash-" + (a++ % a_max) + ".appspot.com/converter?encode=sjis&path=" + escape("http://" + book.address), "utf8", function (html) {
        var title = html.id_map["btAsinTitle"];
        book.name = title.text;
        if (title.children.length == 0) book.type = 1;
        else if (title.children[0].text == "[Kindle版]") book.type = 16;
        else book.type = 1;
        book.author = "";
        var authors = html.cls_map["byLinePipe"];
        if (authors !== undefined) {
            for (var i = 0; i < authors.length; i++) {
                book.author += authors[i].before().text;
            }
            book.author = book.author.replace(/[\n\r]/g, "");
        }
        else book.author = "";
        book.publisher = "";
        var n = html.data.indexOf("出版社:</b>");
        if (n != -1) {
            var n3 = html.data.indexOf("(", n + 9);
            book.publisher = html.data.substring(n + 8, n3);
            var numbers = html.data.substring(n3, n3 + 12).get_numbers();
            book.date = new Date(numbers[0], numbers[1] - 1, numbers[2]);
        }
        var mbc_olp_link = html.cls_map["mbcOlpLink"];
        if (mbc_olp_link !== undefined) book.price = mbc_olp_link[0].children[1].text;
        else book.price = html.cls_map["priceLarge"][0].text.replace(/\s\r\n/g, "");
        var preview = html.cls_map["productDescriptionWrapper"];
        var n_p, n_p2;
        if (preview !== undefined)
            book.preview = html.data.substring((n_p = html.data.indexOf('<div class="productDescriptionWrapper" >')) + '<div class="productDescriptionWrapper">'.length, n_p2 = html.data.indexOf('<div class="emptyClear">', n_p));
        else book.preview = "";
        var image_cell = html.id_map["prodImageCell"];
        if (image_cell === undefined) image_cell = html.cls_map["main-image-inner-wrapper"][0];
        image_cell = image_cell.children[0];
        if (image_cell.type == "img") book.image_address = image_cell.attributes["src"];
        else book.image_address = image_cell.children[0].attributes["src"];
        book.free = false;
        book.links = [];
        var links = html.cls_map["new-faceout fixed-line"];
        if (links !== undefined) {
            for (var i = 0; i < links.length; i++) {
                var link = links[i].children[0].attributes["href"].remove_protocol();
                var n1 = link.indexOf("/ref");
                if (n1 != -1) link = link.substring(0, n1);
                var n2 = link.indexOf("/dp/");
                link = link.domain() + link.substring(n2, link.length);
                book.links.push(link);
            }
        }
        book.set_name(book.name);
        if (after === undefined) book.check();
        else {
            book.set_key();
            after(book);
        }
    });
}

function get_book_info_in_bookwalker(book, after) {
    htm.struct_data(book.address, "utf8", function (html) {
        var writer = html.cls_map["writer"];
        if (writer === undefined) {
            var aori = html.cls_map["aori"][0].before();
            book.name = aori.children[0].text;
            book.author = "";
        }
        else {
            writer = writer[0];
            book.name = writer.before().children[0].text;
            book.author = "";
            for (var i = 0; i < writer.children.length; i++) {
                book.author += writer.children[i].text;
            }
        }
        var label = html.cls_map["label"][0];
        book.publisher = label.children[label.children.length - 1].text;
        book.image_address = html.cls_map["images"][0].children[0].children[0].children[0].children[0].attributes["src"];
        book.preview = html.cls_map["story"][0].children[0].text;
        var prices = html.cls_map["price"];
        if (prices !== undefined) {
            book.price = prices[0].children[0].children[0].text + prices[0].text;
            book.free = true;
        }
        else {
            book.price = "";
            book.free = false;
        }
        book.type = 16;
        book.links = [];
        var links = html.cls_map["title"];
        if (links !== undefined) {
            for (var i = 0; i < links.length; i++) {
                var link = links[i].children[0].attributes["href"].remove_protocol();
                book.links.push(link);
            }
        }
        book.set_name(book.name);
        if (after === undefined) book.check();
        else {
            book.set_key();
            after(book);
        }
    });
}