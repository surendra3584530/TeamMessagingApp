const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    region: {
        type: String,
    },
    userName: {
        type: String,
    },
    password: {
        type: String,
    },
    channels:[{
        type: mongoose.Schema.Types.ObjectId, ref: 'userData'
    }]
});

const user = mongoose.model('user',userSchema,'userData')
module.exports = user;