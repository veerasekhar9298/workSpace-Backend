const mongoose = require('mongoose')

const Schema = mongoose.Schema 

const bookingSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    workSpaceId:{
        type:Schema.Types.ObjectId, 
        ref:"WorkSpace",
        required:true
    },
    spaceId:[{ 
        type:Schema.Types.ObjectId,
        ref:"Space",
        required:true
    }],
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    },
    totalPrice:{
        type:Number,
        required:true
    },
    paymentId:{
        type:Schema.Types.ObjectId,
        ref:"Payment",
        // required:true
    }
},{timestamps:true})

const Booking = mongoose.model('Booking',bookingSchema)

module.exports = Booking