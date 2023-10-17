const mongoose = require('mongoose')

const Schema = mongoose.Schema 

const spaceTypeSchema = new Schema({
    name:{
        type:String,
        required:true 
    },
    quantity:{
        type:Number,
        required:true
    }, 
    price:{
        type:Number,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    workspace:{
        type :Schema.Types.ObjectId,
        ref:"workSpace",
        required:true
    }
},{timestamps:true})



const SpaceType = mongoose.model('SpaceType',spaceTypeSchema)

module.exports = SpaceType