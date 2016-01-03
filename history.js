var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var historySchema = new Schema({
    term        : String,
    when        : Date,
});

module.exports = mongoose.model('History', historySchema);