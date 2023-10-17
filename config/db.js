const mongoose = require('mongoose')


const configureDB = async ()=>{
    try{
        const db = await mongoose.connect(`${process.env.DBURL}/${process.env.DB_NAME}`)
            console.log('connected to the database')
           

    }catch(e){
            console.log("error in connecting in the db",e)
    }
}
 
module.exports = configureDB