var mongo = require("../mongo");
var book_controller = require("../controllers/book");
////////////////////////////////////////////////////////////////////
var Master_books = function (number, key) {
    this.number = number;
    this.key = key;
    this.keys = [];
}
Master_books.schema = {
    number: Number,
    key: String,
    keys: Array
}
Master_books.model_name = "Master_books";
Master_books.model = mongo.load_model(Master_books.model_name, Master_books.schema);
Master_books.prototype.upsert = function (substitution, after) {
    mongo.upsert(Master_books, {key: this.key}, { ???set: substitution}, after);
}
//name author publisher
Master_books.maps = [new Object(), new Object(), new Object()];
Master_books.render = function (req, res) {
    if (req.query.search == undefined) {
        render2(res, Master_book.list_map);
        return;
    }
    var c = req.query.search.charAt(0);
    if ('0' <= c && c <= '9') {
        Master_book.read({ links: { "???size": c - '0' } }, function (err, data) {
            render2(res, data.objs);
        });
    }
    else if (req.query.search == "m") {
        Master_book.read({ master: true }, function (err, data) {
            render2(res, data.objs, true);
        })
    }
    else {
        Master_book.read({ key: new RegExp(req.query.search) }, function (err, data) {
            render2(res, data.objs);
        });
    }
}
function render2(res, book_array, master_ok) {
    if (book_array.length == 0) res.render("book_views", { title: "book_views", master_books: "" });
    var links = [];
    var master_books = [];
    var num_map = new Object();
    for (var i = 0, n = 0; i < 10; i++) {
        var n2 = Math.floor(Math.random() * 100000) % book_array.length;
        if (num_map[n2] == true) {
            if (n == 100) break;
            i--;
            n++;
            continue;
        }
        num_map[n2] = true;
        var master_book = book_array[n2];
        if (master_ok === undefined && master_book.master == true) {
            i--;
            continue;
        }
        links.push(master_book.links[0]);
        master_books.push(master_book);
    }
    Book.read_links(links, [], function (books) {
        var master_books_str = "";
        for(var i = 0; i < books.length; i++) {
            var book = books[i];
            if (book == undefined) {
                continue;
            }
            master_books_str += "<tr>";
            master_books_str += "<td>";
            master_books_str += "<a href=\"/book_view???key=" + escape(master_books[i].key) + "\">";
            master_books_str += book.name;
            master_books_str += "</a>";
            master_books_str += "</td>";
            master_books_str += "</tr>";
        }
        res.render("book_views", { title: "book_views", master_books: master_books_str });
    });
}
exports.Master_books = Master_books;
/////////////////////////////////////////////////////////////////////
var Master_book = function (key) {
    this.key = key;
    this.master = false;
    this.links = [];
}
Master_book.schema = {
    key: String,
    master: Boolean,
    links: Array,
}
Master_book.model_name = "Master_book";
Master_book.model = mongo.load_model(Master_book.model_name, Master_book.schema);
Master_book.map = new Object();
Master_book.list_map = [];
Master_book.prototype.save = function (after) {
    mongo.save(Master_book, this, after);
}
Master_book.prototype.upsert = function (substitution, after) {
    mongo.upsert(Master_book, { key: this.key }, { ???set: substitution }, after);
}
Master_book.prototype.save = function (after) {
    mongo.save(Master_book, this, after);
}
Master_book.prototype.split = function () {
    if (this.key.charAt(this.key.length - 1) == '*') return;
    if (this.master == true) return;
    for (var i = 0; i < this.links.length; i++) {
        for (var j = i + 1; j < this.links.length; j++) {
            if (this.links[i].domain() == this.links[j].domain()) {
                var b1 = Book.map[this.links[i]], b2 = Book.map[this.links[j]];
                if (b1.type == b2.type) {
                    this.check_count++;
                    var master_book = this;
                    master_book.master = true;
                    this.upsert({ check_count: this.check_count, master: this.master}, function (err) {
                        for (var i = 0; i < master_book.links.length; i++) {
                            var book = Book.map[master_book.links[i]];
                            book.upsert({ shared: false }, function (err) {
                                Book.shares.push(book);
                            });
                        }
                    });
                    return;
                }
            }
        }
    }
}
Master_book.prototype.render = function (res) {
    var master_book = this;
    Book.read_links(this.links, [], function (books) {
        var books_str = "";
        var ebooks_str = "";
        var recommends = [];
        var main_book = books[0];
        for (var i = 0; i < books.length; i++) {
            var book = books[i];
            if (book == undefined) continue;
            if (book.type >= 16) {
                ebooks_str += "<td>";
                ebooks_str += "<a href=\"http://" + book.address + "\">";
                ebooks_str += book.address.domain();
                ebooks_str += "</a>"
                ebooks_str += "</td>";
            }
            else {
                books_str += "<td>";
                books_str += "<a href=\"http://" + book.address + "\">";
                books_str += book.address.domain();
                books_str += "</a>"
                books_str += "</td>";
            }
            for (var j = 0; j < book.links.length; j++) {
                recommends.push(book.links[j]);
            }
        }
        var links = [];
        for (var i = 0, n = 0; i < 10; i++) {
            var n2 = Math.floor(Math.random() * 1000) % recommends.length;
            if (recommends[n2] === undefined) {
                if (n == 100) break;
                i--;
                n++;
                continue;
            }
            links.push(recommends[n2]);
            recommends[n2] = undefined;
        }
        Book.read_links(links, [], function (books) {
            var recommends_str = "";
            for (var i = 0; i < books.length; i++) {
                var book = books[i];
                if (book == undefined || book.name === undefined || book.name == null) continue;
                recommends_str += "<td>";
                recommends_str += "<a href=\"/book_view???key=" + escape(book.key) + "\">";
                recommends_str += book.name;
                recommends_str += "</a>";
                recommends_str += "</td>";
            }
            res.render("book_view", { title: main_book.name, name: main_book.name, key: escape(master_book.key), image_address: main_book.image_address, shop: main_book.address.domain(), author: main_book.author, publisher: main_book.publisher, price: main_book.price, free: main_book.free ??? "" : "disabled", buy_address: main_book.address, preview: main_book.preview, books: books_str, ebooks: ebooks_str, recommend: recommends_str });
        });
    });
}
//after(err, data.objs)
Master_book.read = function (condition, after) {
    mongo.read(Master_book, condition, after);
}
Master_book.read_all = function () {
    Master_book.read("", function (err, data) {
        for (var i = 0; i < data.objs.length; i++) {
            var obj = data.objs[i];
            Master_book.push_map(obj);
        }
    });
}
Master_book.push_map = function (master_book) {
    if (Master_book[master_book.key] !== undefined) return;
    Master_book.map[master_book.key] = master_book;
    Master_book.list_map.push(master_book);
}
Master_book.read_all();
exports.Master_book = Master_book;
/////////////////////////////////////////////////////////////////////
var Book = function (address) {
    this.key = null;
    this.address = address;
    this.name = null;
    this.date = null;
    this.author = null;
    this.publisher = null;
    this.publish_date = null;
    this.image_address = null;
    this.price = null;
    this.preview = null;
    this.free = false;
    this.type = 0;
    this.links = [];
    this.checked = false;
    this.listed = false;
    this.shared = false;
    this.errored = false;
}
Book.schema = {
    key: String,
    address: String,
    name: String,
    date: Date,
    genre: String,
    author: String,
    publisher: String,
    links: Array,
    image_address: String,
    price: String,
    preview: String,
    free: Boolean,
    type: Number,
    checked: Boolean,
    shared: Boolean,
    listed: Boolean,
    errored: Boolean
};
Book.model_name = "Book";
Book.model = mongo.load_model(Book.model_name, Book.schema);
Book.map = new Object();
Book.precede = ["booklive", "bookweb"];
Book.displays = ["booklive", "honto", "bookweb", "amazon"];
Book.checks = [];
Book.lists = [];
Book.shares = [];
Book.prototype.save = function (after) {
    mongo.save(Book, this, after);
}
Book.prototype.upsert = function (substitution, after) {
    substitution.address = this.address;
    mongo.upsert(Book, { address: this.address }, { ???set: substitution }, after);
}
Book.prototype.load_map = function () {
    var book = this;
    if (Book.map[book.address] !== undefined) return;
    this.upsert({checked: false, shared: false}, function (err) {        
        Book.map[book.address] = book;
        Book.checks.push(book);
    });
}
Book.prototype.load_list = function () {
    this.listed = true;
    var book = this;
    if (Book.map[book.address] !== undefined) return;
    this.upsert({listed: true}, function (err) {
        Book.map[book.address] = book;
        Book.lists.push(book.address);
    });
}
Book.prototype.check = function () {
    this.checked = true;
    var book = this;
    this.upsert({ checked: true, name: this.name, author: this.author, links: this.links, image_address: this.image_address, price: this.price, preview: this.preview, type: this.type, free: this.free, errored: false, date: this.date}, function (err) {
        Book.map[book.address] = book;
        book.count = 0;
        book.errored = true;
        Book.checks.splice(Book.checks.indexOf(book), 1);
        for (var i = 0; i < book.links.length; i++) {
            var b = new Book(book.links[i]);
            b.load_map();
        }
        if (book.shared == false) Book.shares.push(book);
    });
}
Book.prototype.error = function () {
    this.checked = false;
    this.errored = true;
    var book = this;
    this.upsert({ checked: false, errored: this.errored}, function (err) {
        Book.checks.splice(Book.checks.indexOf(book), 1);
        Book.checks.push(book);
    });
}
Book.prototype.set_name = function (name) {
    if (name.indexOf("モノクロ版") != -1) {
        this.name = name.replace(/モノクロ版/, "");
        this.type = 17;
    }
    else if (name.indexOf("カラー版") != -1) {
        this.name = name.replace(/カラー版/, "");
        this.type = 18;
    }
    else if (name.indexOf("立ち読み版") != -1) {
        this.name = name.replace(/立ち読み版/, "");
        this.type = 19;
    }
    //now programing
}
Book.prototype.set_key = function () {
    var book = this;
    this.key = "";
    for (var i = 0; i < 10; i++) {
        var key = get_author(this.author) + "@" + get_name(this.name, i);
        if (key == this.key) {
            key += "*";
            master_book.master = false;
        }
        this.key = key;
        var master_book = Master_book.map[this.key];
        if (master_book === undefined || master_book.master == false) {
            if (master_book === undefined) {
                Master_book.push_map(new Master_book(this.key));
                master_book = Master_book.map[this.key];
                master_book.master = false;
            }
            var n = master_book.links.indexOf(book.address);
            if (n != -1) {
                book.shared = true;
                book.upsert({ shared: book.shared, key: book.key }, function (err) {
                    Book.shares.splice(Book.shares.indexOf(book), 1);
                });
                break;
            }
            master_book.links.push(book.address);
            master_book.upsert({ key: master_book.key, links: master_book.links, master: master_book.master }, function (err) {
                book.shared = true;
                book.upsert({ shared: book.shared, key: book.key }, function (err) {
                    Book.shares.splice(Book.shares.indexOf(book), 1);
                });
            });
            break;
        }
        else {
            var n = master_book.links.indexOf(book.address);
            if (n != -1) {
                continue;
            }
            master_book.links.push(book.address);
            master_book.upsert({key: master_book.key, links: master_book.links, master: master_book.master}, function (err) {
            });
        }
    }
    return this.key;
}
function get_name(name,count) {
    var name;
    var number;
    var str = "";
    var n2;
    var i = 0;
    for ( ; i < name.length; i++) {
        var c = name.charCodeAt(i);
        c = String.convert_character(c);
        if (String.is_symbol(c)) {
            break;
        }
        str += String.fromCharCode(c);
    }
    var str_n = "", str_o = "";
    for (var n = 0; i < name.length; i++) {
        var c = name.charCodeAt(i);
        c = String.convert_character(c);
        if (String.is_number(c) || c == 0x4E0A/*上*/ || c == 0x4E3D/*中*/ || c == 0x4E0B/*下*/ || c == 0x524D/*前*/ || c == 0x5F8C/*後*/) {
            str_n += "#";
            for (; i < name.length; i++) {
                var c = name.charCodeAt(i);
                c = String.convert_character(c);
                if (String.is_number(c)) str_n += String.fromCharCode(c);
                else if (c == 0x4E0A/*上*/ || c == 0x524D/*前*/) str_n += "1";
                else if (c == 0x4E3D/*中*/) str_n += "2";
                else if (c == 0x4E0B/*下*/ || c == 0x5F8C/*後*/) str_n += "3";
                else break;
            }
            i--;
        }
        else if (String.is_symbol(c)) { }
        else {
            if (n == count) continue;
            var str_o2 = "";
            for (; i < name.length; i++) {
                var c = name.charCodeAt(i);
                c = String.convert_character(c);
                if (String.is_number(c) || c == 0x4E0A/*上*/ || c == 0x524D/*前*/ || c == 0x4E3D/*中*/ || c == 0x4E0B/*下*/ || c == 0x5F8C/*後*/) break;
                else if (String.is_symbol(c)) { break; }
                else {
                    str_o2 += String.fromCharCode(c);
                }
            }
            if (str_o2.length >= 3) {
                str_o += "@" + str_o2;
                n++;
            }
            i--;
        }
    }
    str += str_o + str_n;
    return str;
}
function get_author(author) {
    var cs = [];
    for (var i = 0; i < author.length; i++) {
        var c = author.charCodeAt(i);
        c = String.convert_character(c);
        if (String.is_symbol(c)) continue;
        cs.push(c);
    }
    var str = "";
    for (var i = 0; i < cs.length; i++) {
        for (var j = i + 1; j < cs.length; j++) {
            if (cs[i] > cs[j]) {
                var cs_i = cs[i];
                cs[i] = cs[j];
                cs[j] = cs_i;
            }
        }
        str += String.fromCharCode(cs[i]);
    }
    return str;
}
Book.prototype.share = function () {
    this.shared = true;
    var key = this.set_key();
}
Book.prototype.to_string = function () {
    var str = "key:" + this.key + "<br>" + "name:" + this.name + "<br>" + "address:" + this.address + "<br>" + "author:" + this.author + "<br>" + "type:" + this.type + "<br>"
    + "price:" + this.price + "<br>" + "preview:" + this.preview + "<br>" + "image_address:" + this.image_address + "<br>" + "free:" + this.free + "<br>" + "publisher:" + this.publisher + "<br>" + "date:" + this.date + "<br>";
    for (var i = 0; i < this.links.length; i++) {
        str += "link" + i + ":" + this.links[i] + "<br>";
    }
    return str;
}
//after = function(err, data.objs)
Book.read = function (condition, after) {
    mongo.read(Book, condition, after);
}
Book.read_map = function (address, after) {
    var book = Book.map[address]
    if (book === undefined) after(undefined);
    else if (book.count == -1) {
        mongo.read_one(Book, { address: book.address }, function (err, doc) {
            Book.map[address] = doc;
            doc.count = 1;
            if (doc.date === undefined) doc.date = null;
            after(doc);
        });
    }
    else {
        book.count++;
        after(book);
    }
}
Book.read_links = function (links, books, after) {
    if (books.length == links.length) {
        after(books);
        return;
    }
    Book.read_map(links[books.length], function (book) {
        books.push(book);
        Book.read_links(links, books, after);
    });
}
Book.read_all = function () {
    mongo.read(Book, {}, function (err, data) {
        for (var i = 0; i < data.objs.length; i++) {
            var obj = data.objs[i];
            Book.map[obj.address] = obj;
            if (obj.listed == true) {
                Book.lists.push(obj.address);
            }
            else {
                if (obj.date == undefined) obj.date = null;
                if (obj.checked == false) {
                    Book.checks.push(obj);
                }
                else {
                    if (obj.shared == false) {
                        Book.shares.push(obj);
                    }
                    obj.count = -1;
                }
            }
        }
    }, "key address name author type checked errored shared listed");
}
Book.read_list = function () {
}
//after = funtion(err, obj)
Book.read_one = function (condtion, after) {
    mongo.read_one(Book, condtion, after);
}
Book.read_all();
var Book_access = function (key, date) {
    this.key = key;
    this.date = date;
    this.count = 0;
}
Book_access.schema = {
    key: String,
    date: Date,
    count: Number
}
Book_access.model_name = "Book_access";
Book_access.model = mongo.load_model(Book_access.model_name, Book_access.schema);
Book_access.map = new Object();
Book_access.saves = [];
Book_access.prototype.save = function (after) {
    mongo.save(Book_access, this, after);
}
Book_access.prototype.upsert = function (substitution, after) {
    substitution.address = this.address;
    mongo.upsert(Book_access, { key: this.key, date: this.date}, { ???set: substitution }, after);
}
Book_access.count_up = function (key) {
    var list = Book_access.map[key];
    if (list === undefined) {
        list = Book_access.map[key] = new Object();
    }
    var date = new Date();
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
    var access = list[date.getTime()];
    if (access === undefined) {
        access = list[date.getTime()] = new Book_access(key, date);
        Book_access.saves.push(access);
        access.upsert({count : -1}, function (err) { });
    }
    if (access.count == -1) return;
    access.count++;
}
setInterval(function () {
    if (Book_access.saves.length == 0) return;
    var access  = Book_access.saves[0];
    if (access.date.getHours() != new Date().getHours()) {
        access.upsert({ count: access.count }, function (err) {
            Book_access.saves.splice(Book_access.saves.indexOf(access));
        });
    }
}, 1000);
Book_access.read_all = function () {
    mongo.read(Book_access, {}, function (err, data) {
        for (var i = 0; i < data.objs.length; i++) {
            var obj = data.objs[i];
            var key = obj.key;
            var list = Book_access.map[key];
            if (list === undefined) {
                list = Book_access.map[key] = new Object();
            }
            list[obj.date.getTime()] = obj;
        }
    });
}
Book_access.counts_render  = function(key, res){
    var date = new Date();
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
    var str = "";
    var accesses = Book_access.map[key];
    if (accesses !== undefined) {
        for (var i = 0; i < 24; i++) {
            var access = accesses[date.getTime()];
            date.setHours(date.getHours() - 1);
            if (access == undefined) {
                str += "<br/>";
                continue;
            }
            str += date.toDateString() + ":" + access.count + "<br/>";
        }
    }
    res.render("a", { title: "access", body: str });
}
Book_access.read_all();
exports.Book_access = Book_access;
setInterval(function () {
    for (var i in Book.map) {
        var book = Book.checks[i];
        if (book.count === undefined) {}
        else if (book.count = 0) {
            book.date = null;
            book.publisher = null;
            book.publish_date = null;
            book.image_address = null;
            book.price = null;
            book.preview = null;
            book.free = false;
            book.type = 0;
            book.links = [];
            book.count = -1;
        }
        else book.count = 0;
    }
}, 24*60*60*1000);
var n_ch = 0;
setInterval(function () {
    if (Book.checks.length == 0) return;
    if (b == Book.checks[0]) {
        n_ch++;
        if (n_ch % 5 != 0) return;
    }
    else b = Book.checks[0];
    for (var i = 0; i < 5; i++) {
        if (i >= Book.checks.length) break;
        book_controller.get_book_info(Book.checks[i]);
    }
}, 3000);
var b;
setInterval(function () {
    if (Book.checks.length == 0) return;
    if (b == Book.checks[0]) b.error();
}, 60000);
setInterval(function () {
    if (Book.shares.length == 0) return;
    Book.shares[0].share();
}, 1000);
var n_x = 0;
setInterval(function () {
    if (Master_book.list_map.length == 0) return;
    n_x++;
    var master_book = Master_book.list_map[n_x % Master_book.list_map.length];
    master_book.split();
}, 1000);
var n_l = 0;
setInterval(function () {
    if (Book.lists.length == 0) return;
    book_controller.get_book_list(Book.lists[n_l % Book.lists.length]);
    n_l++;
}, 10000);
exports.Book = Book;