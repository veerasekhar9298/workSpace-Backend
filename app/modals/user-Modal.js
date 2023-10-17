const mongoose = require('mongoose')

const Schema = mongoose.Schema 

const userSchema = new Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true,
        enum:["admin",'owner','user','security'],
        default:'user'
    }
},{timestamps:true})

const User = mongoose.model('User',userSchema)

module.exports = User