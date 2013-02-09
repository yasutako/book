var mongoose = require('mongoose');
var mongo_address = 'localhost:27017/db';
if (process.env.OPENSHIFT_MONGODB_DB_HOST !== undefined) mongo_address = "admin:R3-TRQSrdU4I@" + process.env.OPENSHIFT_MONGODB_DB_HOST + ":" + process.env.OPENSHIFT_MONGODB_DB_PORT + "/book";
mongoose.connect('mongodb://' + mongo_address);
var load_model = function (model, schema) {
    var schema = new mongoose.Schema(schema);
    mongoose.model(model, schema);
    return mongoose.model(model);
}
var read_model = function (model) {
    return mongoose.model(model);
}
//after = function (err) {}
var save = function (type, obj, after) {
    var doc = new type.model();
    for (var key in obj) {
        if (typeof (obj[key]) != 'function') {
            doc[key] = obj[key];
        }
    }
    doc.save(function (err) {
        if (err) console.log(err);
        else after(err);
    });
}
//after = function (err) {}
//after = function (err) {}
var upsert = function (type, condition, substitution, after) {
    type.model.update(condition, substitution, { upsert: true, multi: false }, function (err) {
        if (err) console.log(err);
        else after(err)
    });
}
//conditin = {name:"yamada"}, after = function (err) {}
var remove = function (type, condition, after) {
    type.model.remove(condition, after);
}
//conditin = {name:"yamada"}, after = function (err, objs) {}
var read = function (type, condition, after, options) {
    if (options === undefined) {
        type.model.find(condition, function (err, docs) {
            var objs;
            if (err) console.log(err);
            else {
                if (docs) {
                    objs = []
                    for (var i = 0; i < docs.length; i++) {
                        var obj = new type();
                        var doc = docs[i];
                        for (var key in doc) {
                            if (typeof (doc[key]) != 'function' && key.charAt(0) != '_') obj[key] = doc[key];
                        }
                        objs.push(obj);
                    }
                }
                after(err, { objs: objs });
            }
        });
    }
    else {
        type.model.find(condition, options, function (err, docs) {
            var objs;
            if (err) console.log(err);
            else {
                if (docs) {
                    objs = []
                    for (var i = 0; i < docs.length; i++) {
                        var obj = new type();
                        var doc = docs[i];
                        for (var key in doc) {
                            if (typeof (doc[key]) != 'function' && key.charAt(0) != '_') obj[key] = doc[key];
                        }
                        objs.push(obj);
                    }
                }
                after(err, { objs: objs });
            }
        });
    }
}
//conditin = {name:"yamada"}, after = function (err, objs) {}
var read_one = function (type, condition, after) {
    type.model.findOne(condition, function (err, doc) {
        var obj;
        if (err) console.log(err);
        else {
            if (doc) {
                obj = new type();
                for (var key in doc) {
                    if (typeof (doc[key]) != 'function' && key.charAt(0) != '_') obj[key] = doc[key];
                }
            }
            after(err, obj);
        }
    });
}
exports.load_model = load_model;
exports.read_model = read_model;
exports.save = save;
exports.upsert = upsert;
exports.remove = remove;
exports.read = read;
exports.read_one = read_one;