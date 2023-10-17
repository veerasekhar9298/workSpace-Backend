const mongoose = require('mongoose')

const Schema = mongoose.Schema 

const addressSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    }
})

const workSpaceSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    address:{
        type:addressSchema,
        required:true
    }
    ,images:{
        type:[String],
        required:true
    },
    facilities:{
        type:[String],
        required:true
    },
    owner:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
    },
    bookings:{
        type:[{type:Schema.Types.ObjectId,ref:"Booking"}],
        default:[]
    }
},{timestamps:true})

const WorkSpace = mongoose.model('WorkSpace',workSpaceSchema)

module.exports = WorkSpace 