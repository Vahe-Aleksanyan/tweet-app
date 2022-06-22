const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "I am knew"
    },
    posts: [
        {
            type: Schema.Types.ObjectId, // since it will be referenced to posts
            ref: 'Post', // giving the reference
        }
    ]
})

module.exports = mongoose.model('User', userSchema);