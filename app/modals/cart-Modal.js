const mongoose = require('mongoose')

const Schema = mongoose.Schema


const cartSchema = new Schema({
    quantity:{
        type:Number,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    productId:{
        type:Number,
        required:true
    },
    itemId:
        [{type:Schema.Types.ObjectId,
        ref:"Space"}]
    ,
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    startDate:Date,
    endDate:Date,
    workSpaceId:{
        type:Schema.Types.ObjectId,
        ref:"WorkSpace"
    }
},{timestamps:true})

const Cart = mongoose.model('Cart',cartSchema)

module.exports = Cart


