var mongo = require("../mongo");
var email = require("../email");
var crypt = require('crypto');
var secret_key = "Ga8Hu3hjGA8tgaGA";
var decipher = crypt.createDecipher('aes256', secret_key);
var User = function (mail) {
    this.user_id = null;
    this.mail = mail;
    this.password = null;
    this.point = 0;

    this.full_name;
}
User.schema = {
    user_id: String,
    mail: String,
    password: String,
    point: Number,
    full_name: String,
}
User.model_name = "User";
User.model = mongo.load_model(User.model_name, User.schema);
User.prototype.upsert = function (substitution, after) {
    mongo.upsert(User, {mail: this.mail}, { $set: substitution}, after);
}
User.map = new Object();
User.map_id = new Object();
User.login = function (req, password) {
    var mail = req.body.mail;
    if (mail === undefined) return null;
    var user = User.map[mail];
    if (user === undefined) return null;
    else {
        if (user.password != password) return null;
        else {
            req.session.mail = mail;
            return user;
        }
    }
}
User.register1 = function (req, res) {
    var mail = req.body.mail;
    if (mail === undefined || mail.indexOf('@') == -1) {
        res.render("a", { title: "メール送信失敗", body: "メールの送信に失敗しました。" });
        return null;
    }
    else {
        var user = User.map[mail];
        if (user == undefined) {
            user = User.map[mail] = new User(mail);
            user.upsert({mail: user.mail}, function (err) {
                var cipher = crypt.createCipher('aes256', secret_key);
                var crypted = cipher.update(mail, 'utf8', 'hex');
                crypted += cipher.final('hex');
                console.log('暗号化した文字列: ' + crypted);
                email.send(mail, "confirm mail", "register_mail", { mail: escape(mail), key: escape(crypted) });
                res.render("a", { title: "メールを送信しました。", body: "メールを送信しました。" });
            });
            return user;
        }
        else if (!user.password) {
            var cipher = crypt.createCipher('aes256', secret_key);
            var crypted = cipher.update(mail, 'utf8', 'hex');
            crypted += cipher.final('hex');
            console.log('暗号化した文字列: ' + crypted);
            email.send(mail, "confirm mail", "register_mail", { mail: escape(mail), key: escape(crypted) });
            res.render("a", { title: "メールを送信しました。", body: "メールを送信しました。" });
        }
        else {
            res.render("a", { title: "すでに登録済み", body: "すでにそのメールはとうろくされています。" });
            return null;
        }
    }
}
User.register2 = function (req, res) {
    var mail = req.body.mail;
    if (mail === undefined) {
        res.render("a", { title: "登録失敗", body: "urlが不正" });
        return null;
    }
    var key = req.body.key;
    if (key === undefined) {
        res.render("a", { title: "登録失敗", body: "urlが不正" });
        return null;
    }
    delete req.body[key];
    delete req.body[mail];
    var substitutes = req.body;
    if (!substitutes.password) {
        res.render("register2", req.body);
        return null;
    }
    if (!substitutes.user_id) {
        res.render("register2", req.body);
        return null;
    }
    else {
        if (User.map_id[substitutes.user_id] !== undefined) {
            res.render("register2", req.body);
            return null;
        }
    }
    var dec = decipher.update(unescape(key), 'hex', 'utf8');
    dec += decipher.final('utf8');
    console.log('復号化した文字列: ', dec);
    if (mail == dec) {
        var user = User.map[mail];
        if (user === undefined) {
            res.render("a", { title: "登録失敗", body: "認証期限が過ぎました。" });
            return null;
        }
        else User.map_id[substitutes.user_id] = user;
        for (var i in substitutes) user[i] = substitutes[i];
        user.upsert(substitutes, function (err) {
            res.render("a", { title: "ユーザ登録成功", body: "ユーザ登録に成功しました。" });
        });
    }
    else {
        res.render("a", { title: "登録失敗", body: "urlが不正" });
        return null;
    }
}
User.read_all = function () {
    mongo.read(User, {}, function (err, data) {
        for (var i = 0; i < data.objs.length; i++) {
            var obj = data.objs[i];
            User.map[obj.mail] = obj;
            if (obj.user_id !== undefined) User.map_id[obj.user_id] = obj;
            if (obj.point == undefined) obj.point = 0;
        }
    });
}
exports.User = User;