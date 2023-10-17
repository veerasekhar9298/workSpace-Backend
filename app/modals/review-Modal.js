const mongoose = require('mongoose')

const Schema = mongoose.Schema 

const reviewSchema = new Schema({
    userId:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
    },
    workspaceId:{
        type:Schema.Types.ObjectId,
        ref:"workSpace",
        required:true
    }, 
    rating:{
        type:Number,
        required:true
    },
    comment:{
        type:String,
    }
},{timestamps:true})

const Review = mongoose.model('Review',reviewSchema)

module.exports = Review