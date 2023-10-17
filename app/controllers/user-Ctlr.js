const User = require('../modals/user-Modal')
const bcrypt = require('bcryptjs')
const lodash = require('lodash')
const jwt = require('jsonwebtoken')
const accountSid = 'AC2b25905ee745d9a7aa6034d7175e6b43';
const authToken = '4a7c280581fee7bb63f7e8040cf3b317';
const client = require('twilio')(accountSid, authToken)
const Payment = require('../modals/payment-Modal')
const Booking = require('../modals/Booking-Modal')
const Otp = require('../modals/otp-Modal')
const { validationResult } = require('express-validator')
const UsersCltr = {}

 UsersCltr.register = async (req,res)=>{

        try{
          const errors = validationResult(req)
              if(! errors.isEmpty()){
                res.status(400).json({errors:errors.array()})
              }else{
                const body = lodash.pick(req.body,['username','email','password',"mobile",'firstName','lastName','type'])
            const user = new User (body)

            const userCount = await User.countDocuments()

            if(userCount === 0){
                user.role = 'admin'
            }
        
            if(body.type){
                    user.role = 'owner'
                }
    
            const salt = await bcrypt.genSalt()
            const hashedPassword = await bcrypt.hash(user.password,salt)
                user.password = hashedPassword
                const userDoc = await user.save()
                res.status(200).json({msg:"Registration Successfull"})


              }
            
        }catch(e){
            res.status(404).json(e)
        }
 }

 UsersCltr.login = async (req,res)=>{
    try{

        const errors = validationResult(req)
        
        if(! errors.isEmpty()){
          res.status(400).json({errors:errors.array()})
        }else{

          const body = lodash.pick(req.body,['email','password'])
          const user = await User.findOne({email:body.email})
          if(user){
              const result = await bcrypt.compare(body.password,user.password)
              if(result){
                  const tokenData =  {
                      _id :user._id,
                      role:user.role
                  }
                  const token = jwt.sign(tokenData,process.env.JWT_SECRET)
                  res.json({
                      token:`Bearer ${token}`
                  })
              }else{
  
                res.status(404).json({errors:"invalid Credentials"})
              }
          }else{
              res.status(404).json({errors:"invalid Credentials"})
          }

        }

       
    }catch(e){
        res.json(e)
    }
 }

 
 UsersCltr.account = async (req,res)=>{
    try {
        const user = await User.findById(req.user._id)
        res.json(lodash.pick(user, ['_id', 'username', 'email','role']))
    } catch(e) {
        res.json(e)
    }
 }




 UsersCltr.profile = async (req,res)=>{
    try {
      
        const user = await User.findById(req.user._id)
        const result = lodash.pick(user, [ 'username', 'email','firstName','lastName','mobile'])

        const Bookings = await Booking.find({userId:req.user._id}).populate('workSpaceId')
          const today = new Date();

          // Separate bookings into upcoming and history
          const upcomingBookings = [];
          const bookingHistory = [];
  
          Bookings.forEach((booking) => {
              // Convert the booking's startDate to a Date object
              const startDate = new Date(booking.startDate);
  
              if (startDate >= today) {
                  // Booking is upcoming
                  upcomingBookings.push(booking);
              } else {
                  // Booking is in history
                  bookingHistory.push(booking);
              }
          })
          result.upcomingBookings = upcomingBookings
          result.bookingHistory = bookingHistory

          console.log(upcomingBookings)
        res.json(result)
        // res.json(result)
    } catch(e) {

        res.json(e)

    }
 }


 UsersCltr.adminlist = async (req,res) =>{
    try{
       
        const allusers = await User.find({},'-password')
        const result = await User.aggregate([
            {
              $project: {
                month: { $month: '$createdAt' }, // Extract the month from the createdAt field
              },
            },
            {
              $group: {
                _id: '$month', // Group by month
                count: { $sum: 1 }, // Count the number of documents in each group
              },
            },
            {
              $sort: {
                _id: 1, // Sort by month in ascending order
              },
            },
          ])
          
          const chartData = result.map((item) => ({
            month: item._id,
            count: item.count,
          }))   

          const result2 = await Payment.aggregate([
            {
              $project: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                amount: 1,
              },
            },
            {
              $group: {
                _id: { year: '$year', month: '$month' },
                count: { $sum: 1 }, // Count the number of transactions
                totalAmount: { $sum: '$amount' }, // Calculate the total amount
              },
            },
            {
              $sort: {
                '_id.year': 1,
                '_id.month': 1,
              },
            },
          ])
          const monthlyData = result2.map((item) => ({
            year: item._id.year,
            month: item._id.month,
            transactions: item.count,
            totalAmount: item.totalAmount,
          }));
      
          // Calculate the total revenue
          const totalRevenue = monthlyData.reduce((total, item) => total + item.totalAmount, 0)
          const transactionData = {monthlyData,totalRevenue}

          const finalData = {allusers,chartData,transactionData}

           
            res.json(finalData)

    }catch(e){

            res.json(e)

    }
 }



 UsersCltr.delete = async(req,res)=>{
    try{

    }catch(e){
        res.json(e)
    }
 }



 UsersCltr.edit = async (req,res)=>{
    try{
        const errors = validationResult(req)

        if(! errors.isEmpty()){
              res.status(400).json({errors:errors.array()})
        }else{

          const id = req.user._id
          const body = lodash.pick(req.body,['username','mobile','email','firstName','lastName'])
          const updateDoc = await User.findByIdAndUpdate({_id:id},body,{new:true})
          res.json(updateDoc)


        }



      
    }catch(e){

      res.json(e)



    }

 }

 UsersCltr.verifyMail = async (req,res)=>{
  try{
      const body = lodash.pick(req.body,['email'])
     
      const found = await User.findOne({email:body.email})
      if(found){
        res.status(200).json({msg:"credentials are valid"})
      }else{
          res.status(404).json({msg:"invalid Email"})
      }

  }catch(e){
    res.json(e)

  }
 }


 UsersCltr.verifyMobile = async (req,res)=>{

  try{
    const output = req.body.number;
    const OTP = Math.floor(Math.random() * 1000000);

    // console.log(OTP);
      const Doc = new Otp({otp:OTP})
    const otpDoc = await Doc.save()
    client.messages
      .create({
        body: `Hi your OTP is - ${otpDoc.otp}`,
        to: output, // Text your number
        from: '+12515817132', // From a valid Twilio number
      })
      .then((message) => console.log(message.sid))
      .catch((e) => {
        console.log('error', e);
      });
    res.json({ number: output ,msg:"OTP Send Successfully"});
    // console.log({ number: output, otp: otpDoc })

  }catch(e){

    res.json(e)
  }
 }

 UsersCltr.verifyOtp = async (req,res)=>{
  // console.log(req.body)
  try{
      const otp = parseInt(req.body.otp)

      const foundDoc = await Otp.findOne({otp:otp})

      if(foundDoc){
                  await Otp.findByIdAndDelete({_id:foundDoc._id})
          res.status(200).json({msg:"OTP is verified"})
      }else{
        res.status(404).json({msg:"Otp is Invalid"})
      }


  }catch(e){

    rs.json(e)

  }
 }


 UsersCltr.editPassword = async (req, res) => {
  try {
    const body = lodash.pick(req.body, ['email', 'password']);
    const findUser = await User.findOne({ email: body.email });

    if (findUser) {
     

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(body.password, salt);
     

      findUser.password = hashedPassword;
      const userDoc = await findUser.save();
   

      res.status(200).json({ msg: "Password Reset successfully" });
    } else {
      // Handle the case where no user with the given email was found.
      res.status(404).json({ msg: "User not found" });
    }
  } catch (e) {
    res.status(500).json(e);
  }
}

 
 module.exports = UsersCltr
