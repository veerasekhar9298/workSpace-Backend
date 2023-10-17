const mongoose = require('mongoose')

const Schema = mongoose.Schema  
 
const spaceSchema = new Schema({
    spaceTypeId:{ 
        type:Schema.Types.ObjectId,
        ref:"SpaceType",
        required:true
    },
    workSpaceId:{
            type:Schema.Types.ObjectId,
            ref:"WorkSpace",
            required:true
    },
    isAvailable:{
        type:Boolean,
        required:true,
        default:true
    },
    tenentId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        default:null
    }
},{timestamps:true})

const Space = mongoose.model('Space',spaceSchema)

module.exports = Space