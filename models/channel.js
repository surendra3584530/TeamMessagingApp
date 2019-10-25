const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    channelName: {
        type: String,
    },
    description: {
        type: String,
    },
    tags: {
        type: Array,
    },
    persons: {
        type: Array,
    }
});

const userChannel = mongoose.model('userChannel',userSchema,'channelData')
module.exports = userChannel;