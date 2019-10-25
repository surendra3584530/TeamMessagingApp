const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    msg: {
        type: String
    },
    create_by: {
        type: String
    },
    channelName:{
        type: String
    }
});

const postMsg = mongoose.model('postMsg',userSchema,'postData')
module.exports = postMsg;