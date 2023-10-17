require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const moment = require('moment-timezone')
const fs = require('fs')
const path = require('path')
const AWS = require('aws-sdk')
const multer = require('multer')
const configureDB = require('./config/db')
const {reviewSchema} = require('./app/helpers/reviewSchema')
const {bookingSchema} = require('./app/helpers/booking-Schema')
const {paymentSchema} = require('./app/helpers/PAyment-Schema')
const {spaceTypeSchema} = require('./app/helpers/spaceType')
const {workspaceSchema,editworkspaceSchema} = require('./app/helpers/workSpace-schema')
const {registerSchema,loginSchema,updateProfileSchema} = require('./app/helpers/user-Schema')
const { checkSchema } = require('express-validator')
const UsersCltr = require('./app/controllers/user-Ctlr')
const authenticateUser = require('./app/middlewares/authentication')
const authorizeUser = require('./app/middlewares/authourization')
const workSpaceCltr = require('./app/controllers/workSpace-Cltr')
const spaceTypeCtlr = require('./app/controllers/spaceType-Ctlr')
const BookingCltr = require('./app/controllers/booking-Ctlr')
const spaceCltr = require('./app/controllers/space-Cltr')
const reviewCltr = require('./app/controllers/review-Ctlr')
const notificationCltr = require('./app/controllers/notification-Ctlr')
const paymentCltr = require('./app/controllers/payment-Ctlr')
const cartCltr = require('./app/controllers/cart-cltr')
const app = express()
const PORT = 3857
const acceessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });


app.use(express.json()) // pars the oncoming json data 
app.use(cors())
// app.use(morgan('dev')) // morgan http logger middleware  to track the http requests

morgan.token('ist-time', (req, res) => {
    return moment().tz('Asia/Kolkata').format('ddd, DD MMM YYYY HH:mm:ss z');
  })
morgan.token('type', (req, res) => {
    return req.headers['content-type']
  })


configureDB()
app.use(morgan(':method :url :status :res[content-length] - :response-time ms  :type  :ist-time',{stream:acceessLogStream}))
// aws configuration 
AWS.config.update({
    accessKeyId:process.env.Access_key_ID,
    secretAccessKey: process.env.Secret_access_key,
    region: 'ap-south-1'
  });



//multer configuration
const storage = multer.memoryStorage()

const upload = multer({
    storage: storage,
    limits: { files: 4 } 
});


// user Routes 
app.post('/api/usersRegister',checkSchema(registerSchema),UsersCltr.register) 


app.post('/api/user/Login',checkSchema(loginSchema),UsersCltr.login)

app.post ('/api/verfyEmail',UsersCltr.verifyMail)
app.post ('/api/verfymobile',UsersCltr.verifyMobile)
app.post ('/api/verfyOtp',UsersCltr.verifyOtp)
app.post ('/api/editPassword',UsersCltr.editPassword)

app.get('/api/user/Account',authenticateUser,UsersCltr.account)

app.get('/api/user/profile',authenticateUser,UsersCltr.profile)

app.get('/api/users/allusers',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['admin']
    next()
},authorizeUser,UsersCltr.adminlist)

app.delete("/api/users/delete",authenticateUser,(req,res,next)=>{
    req.permitRoles = ['admin']
    next()
},authorizeUser,UsersCltr.delete)

app.put("/api/user/editProfile",authenticateUser,checkSchema(updateProfileSchema),UsersCltr.edit)

// workSpace routes 

app.post('/api/workSpace',upload.array('files', 4),authenticateUser,checkSchema(workspaceSchema),(req,res,next)=>{
    req.permitRoles = ['owner']
    next()
},authorizeUser,workSpaceCltr.create)

app.get('/api/workSpace',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['admin','owner',"user"]
    next()
},authorizeUser,workSpaceCltr.list)

app.get('/api/publicworkSpaces',workSpaceCltr.listPublic)




app.get('/api/allworkSpaceAnalysis',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['owner']
    next()
},authorizeUser,workSpaceCltr.allWorkSpaceAnalysis)

app.get('/api/revenueallworkSpaceAnalysis',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['owner']
    next()
},authorizeUser,workSpaceCltr.revenue)

// app.get('/api/workSpace/:id',authenticateUser,(req,res,next)=>{
//     req.permitRoles = ['owner',"user"]
//     next()
// },authorizeUser,workSpaceCltr.single)

app.get('/api/workSpace/:id',workSpaceCltr.single)

// app.get('/api/EditworkSpace/:id',authenticateUser,(req,res,next)=>{
//     req.permitRoles = ['owner']
//     next()
// },authorizeUser,workSpaceCltr.singleEdit)

app.get('/api/workSpaceanalysis/:wid',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['owner']
    next()
},authorizeUser,workSpaceCltr.analysis)

app.put('/api/workSpace/:id',upload.array('files', 4),authenticateUser,checkSchema(editworkspaceSchema),(req,res,next)=>{
    req.permitRoles = ['owner']
    next()
},authorizeUser,workSpaceCltr.update)

app.delete('/api/workSpace/:id',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['admin','owner']
    next()
},authorizeUser,workSpaceCltr.delete)


 /// space type controllers 


app.post('/api/spaceType',authenticateUser,checkSchema(spaceTypeSchema),(req,res,next)=>{
    req.permitRoles = ['owner']
    next()
},authorizeUser,spaceTypeCtlr.create)

app.get('/api/spaceType/:id',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['owner','user']
    next()
},authorizeUser,spaceTypeCtlr.list)

// space controllers

app.post('/api/spaces',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['owner']
    next()
},authorizeUser,spaceCltr.create)

app.get('/api/spaces/:id',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['owner',"user"]
    next()
},authorizeUser,spaceCltr.list)

app.get('/api/editspaces/:id',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['owner']
    next()
},authorizeUser,spaceCltr.single)

app.put('/api/spaces/:id',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['owner']
    next()
},authorizeUser,spaceCltr.update)


app.delete('/api/spaces/:id',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['owner']
    next()
},authorizeUser,spaceCltr.delete)

// Booking controllers

app.post('/api/bookings',authenticateUser,checkSchema(bookingSchema),(req,res,next)=>{
    req.permitRoles = ['owner','user']
    next()
},authorizeUser,BookingCltr.create)

app.get('/api/bookings',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['owner','user']
    next()
},authorizeUser,BookingCltr.list)

app.get('/api/bookings/:id',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['owner']
    next()
},authorizeUser,BookingCltr.Single)

app.delete('/api/updateBookingStatus',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['user']
    next()
},authorizeUser,BookingCltr.delete)


// review controllers

app.post('/api/reviews/:id',authenticateUser,checkSchema(reviewSchema),(req,res,next)=>{
    req.permitRoles = ['user']
    next()
},authorizeUser,reviewCltr.create)

app.get('/api/reviews/:id',reviewCltr.list)

app.put('/api/reviews/:id',authenticateUser,checkSchema(reviewSchema),(req,res,next)=>{
    req.permitRoles = ['user']
    next()
},authorizeUser,reviewCltr.update)

app.delete('/api/reviews/:id',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['user']
    next()
},authorizeUser,reviewCltr.delete)


//notifications controllers 

app.post('/api/notification',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['owner']
    next()
},authorizeUser,notificationCltr.create)

app.get('/api/notification',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['owner','user']
    next()
},authorizeUser,notificationCltr.list)

app.put('/api/notification',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['owner']
    next()
},authorizeUser,notificationCltr.update)

app.delete('/api/notification',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['owner','user']
    next()
},authorizeUser,notificationCltr.delete)

////////

//map apis 

app.get('/api/mapWorkSpaces',workSpaceCltr.maps)

/// patment setup

app.post('/api/create-checkout-session',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['owner','user']
    next()
},authorizeUser,paymentCltr.create)

app.put('/api/updatePaymentStatus',authenticateUser,(req,res,next)=>{
    req.permitRoles = ['owner','user']
    next()
},authorizeUser,paymentCltr.update)



/// Cart routes   

app.post("/api/add-to-cart",authenticateUser,(req,res,next)=>{
    req.permitRoles = ['user']
    next()
},authorizeUser,cartCltr.add)

// app.post("/api/add-to-cart",authenticateUser,(req,res,next)=>{
//     req.permitRoles = ['user']
//     next()
// },authorizeUser,cartCltr.add)

app.post("/api/remove-to-cart",authenticateUser,(req,res,next)=>{
    req.permitRoles = ['user']
    next()
},authorizeUser,cartCltr.remove)

app.get("/api/all-cart-Items",authenticateUser,(req,res,next)=>{
    req.permitRoles = ['user']
    next()
},authorizeUser,cartCltr.list)

app.delete("/api/clear-cart-Items",authenticateUser,(req,res,next)=>{
    req.permitRoles = ['user']
    next()
},authorizeUser,cartCltr.clear)

app.delete("/api/remove-cart-Item/:id",authenticateUser,(req,res,next)=>{
    req.permitRoles = ['user']
    next()
},authorizeUser,cartCltr.removeItem)


app.listen(PORT,()=>{
    console.log(`server is running on the port ${PORT}`)
})
