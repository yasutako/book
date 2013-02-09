var mongo = require("../mongo");
var User = function () {
    this.user_id = null;
    this.mail = null;
    this.password = null;
    this.point = 0;

    this.nick_name;
    this.full_name;
    this.full_name_english;
}