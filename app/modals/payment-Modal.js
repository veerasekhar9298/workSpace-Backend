const mongoose = require('mongoose')

const Schema = mongoose.Schema 

const paymentSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    Method:{
        type:String,
        required:true
    },
    transactionId:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    }
},{timestamps:true})

const Payment = mongoose.model('Payment',paymentSchema)

module.exports = Payment