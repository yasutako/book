
var fs = require('fs');
var ejs = require("ejs");
var email = require('emailjs/email');
var my_address;
var server = email.server.connect({
    user: my_address = "hayakawa.yas02@gmail.com",
    password: "oc10tw21",
    host: "smtp.gmail.com",
    ssl: true
});
function send(to, subject, template, locals) {
    var headers = {
        from: my_address,
        to: to,
        subject: subject
    }
    var message = email.message.create(headers);
    fs.readFile("mails/" + template + ".ejs", "utf8", function (err, data) {
        //var locals = { "userName": "Yoshihiko Hoshino" };
        var renderResult = ejs.render(data, { "locals": locals });
        headers.text = renderResult;
        message.attach({ data: renderResult, alternative: true });
        server.send(message, function (err, message) {
            if (err != null) {
                console.log(err);
            } else {
                console.log("sendOK");
            }
        });
    });
} exports.send = send;