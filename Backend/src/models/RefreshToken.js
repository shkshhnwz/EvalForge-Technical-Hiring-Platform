const mongoose = require('mongoose');

const RefreshTokenScehma = new mongoose.Schema({
    token:{
        type: String,
        required:true,
        unique:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    expiresAt:{
        type:Date,
        required:true
    }
});

RefreshTokenScehma.index({
    expiresAt:1
},{expireAfterSeconds:0})

module.exports = mongoose.model('RefreshToken', RefreshTokenScehma);