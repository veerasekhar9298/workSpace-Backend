const mongoose = require('mongoose')


const {Schema,model} = mongoose 

const otpSchema = new Schema({

    otp:{
        type:Number
    }

},{timestamps:true})

const Otp = model('Otp',otpSchema)

module.exports = Otp