var express = require('express');
var mongoose = require('mongoose');
var model_book = require('./models/m_book');
var system = require('./system');

//  Local cache for static content [fixed and loaded at startup]
var zcache = { 'index.html': '' };
// Create "express" server.
var app = express();
var config = { cookie_secret: "Agueyasigua" };

var store = new (require('connect').session.MemoryStore)();

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view options', { layout: false });
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    //app.use(express.logger());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.cookieParser());
    app.use(express.session({
        store: store,
        secret: config.cookie_secret,
        cookie: { httpOnly: false }
    }));
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.configure('development', function() {
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});


// Handler for GET /health
app.get('/health', function(req, res){
    var user = require('./user.js');
    res.send('3' + mongoose + ',' + new user().name);
});
var book_controller = require('./controllers/book');
app.post('/book_list', function (req, res) {
    var addresses = req.body.address.replace(/\r/g, "").split("\n");
    var ret = "";
    for (var i = 0; i < addresses.length; i++) {
        var address = addresses[i].remove_protocol();
        if (!address) continue;
        if (req.body.check == "checked") {
            new model_book.Book(address).load_list();
            ret += address + "<br>";
        }
        else {
            ret = "";
            book_controller.get_book_list(address, function (list) {
                for (var j = 0; j < list.length; j++) {
                    ret += list[j].address + "<br>";
                }
                res.render("a", { title: "book", body: ret });
            });
            return;

        }
    }
    res.render("a", { title: "book", body: ret });
});
app.post('/book', function (req, res) {
    var addresses = req.body.address.replace(/\r/g, "").split("\n");
    var ret = "";
    for (var i = 0; i < addresses.length; i++) {
        var address = addresses[i];
        if (!address) continue;
        var book = new model_book.Book(address.remove_protocol());
        if (req.body.check == "checked") {
            book.load_map();
            ret += address + "<br>";
        }
        else {
            book_controller.get_book_info(book, function (book2) {
                res.render("a", { title: "book", body: book2.to_string() });
            });
            return;

        }
    }
    res.render("a", { title: "book", body: ret });
});
app.get('/book_view', function (req, res) {
    var key = unescape(req.query.key);
    var master_book = model_book.Master_book.map[key];
    console.log(req.headers['referer']);
    master_book.render(res);
    model_book.Book_access.count_up(key);
});
app.get('/access', function (req, res) {
    model_book.Book_access.counts_render(unescape(req.query.key), res);
});
app.get('/book_views', function (req, res) {
    model_book.Master_books.render(req, res);
});
app.get('/index', function (req, res) {
    res.send("");
});
var user = require("./models/user");
app.get('/login', function (req, res) {
    res.render("login", {});
});
app.post('/login', function (req, res) {
    user.User.login(req);
});
app.get('/register1', function (req, res) {
    res.render("register1", {});
});
app.post('/register1', function (req, res) {
    user.User.register1(req, res);
});
app.get('/register2', function (req, res) {
    if (req.query.user_id == undefined) req.query.user_id = "";
    if (req.query.full_name == undefined) req.query.full_name = "";
    res.render("register2", {key: unescape(req.query.key),mail: req.query.mail, mail2: req.query.mail, user_id: req.query.user_id, full_name: req.query.full_name});
});
app.post('/register2', function (req, res) {
    user.User.register2(req, res);
});
// Handler for GET /
app.get('/', function (req, res) {
    res.render("a", { title: "index", body: "hello world&<br/>hello" });
});


//  Get the environment variables we need.
var ipaddr  = process.env.IP || "localhost"
var port    = 5963;

if (typeof ipaddr === "undefined") {
   console.warn('No OPENSHIFT_INTERNAL_IP environment variable');
}
process
//  terminator === the termination handler.
function terminator(sig) {
    if (typeof sig === "string") {
        process.exit(1);
    }
}
//  Process on exit and signals.
process.on('exit', function() { terminator(); });
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});
/*['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'
].forEach(function(element, index, array) {
    process.on(element, function() { terminator(element); });
});*/

//  And start the app on that interface (and port).
console.log(ipaddr + ":" + port);
var socket = require('socket.io').listen(app.listen(port, ipaddr, function() {
}));
socket.on('connection', function(client) {
    client.on('message', function(msg) {
        var cookie = msg.cookie;
        if (cookie) {
            // ëóÇÁÇÍÇƒÇ´ÇΩcookieÇ©ÇÁsession keyÇéÊìæÇµ
            var parseCookie = require('connect').utils.parseCookie,
                sid = parseCookie(cookie)['connect.sid'];
            // storeÇ©ÇÁsessionèÓïÒÇà¯Ç¢Çƒ
            store.get(sid, function(err, session) {
                // Ç∆ÇËÇ†Ç¶Ç∏Ç±Ç±Ç≈ÇÕclientÇ…sessionÉfÅ[É^ÇëóÇ¡ÇƒÇ‚ÇÈ
                client.send({ data: session.data });
            });
        }
    });
});


