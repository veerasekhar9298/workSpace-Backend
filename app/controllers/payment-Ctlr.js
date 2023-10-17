const Payment = require("../modals/payment-Modal");
const Booking = require('../modals/Booking-Modal')
const stripe = require('stripe')('sk_test_51Nt5LUSHgu4dGvsma8JrcLNYXJIvc7w7u1ih4MvNnUou7Psk7bnVPjEzOi9SONMnWVevnWaCYxxfhzKJJGGuOkuA00Q6VMjejk')
const qr = require('qrcode')
const paymentCltr = {};
const nodemailer = require("nodemailer")
const { validationResult } = require('express-validator')

let transporter = nodemailer.createTransport({
  service:"gmail",
  auth:{
      user:process.env.AUTH_EMAIL,
      pass:process.env.AUTH_PASS
  }

}) 

// test transporter  

transporter.verify((err,success)=>{
if(err){
  console.log(err)
}else{
  console.log(success,"ready for messages")

}
})


paymentCltr.create = async (req, res) => {
   
    try{
        const session = await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            mode:"payment",
            line_items: req.body.items.map(item => {
                return{
                    price_data:{
                        currency:"inr", 
                        product_data:{
                            name: item.name
                        },
                        unit_amount: (item.price)*100,

                    },
                    quantity: item.quantity
                }
            }),
            success_url: 'https://sharespace-xwig.onrender.com/success',
            cancel_url: 'https://sharespace-xwig.onrender.com/cancel'
        })

      const payment = new Payment()
            payment.amount=req.body.totalPrice
            payment.userId = req.user._id
            payment.Method = "Card"
            payment.transactionId = session.id
            payment.status = "pending"
                const paymentDoc = await payment.save()
          res.json({url: session.url,id:session.id})


    }catch(e){
     res.status(500).json({error:e})
    }

};





paymentCltr.list = async (req, res) => {
  try {


  } catch (e) {

  }

};





// paymentCltr.update = async (req, res) => {
//   try {
//     const transId = req.query.transaction
//     const bookingid = req.query.booking.split(',')
//         console.log(transId,"-----------",bookingid)
//       const status = req.body.status
//       const paymentUpdate = await Payment.findOneAndUpdate({transactionId:transId},{status},{new:true})

//       const updatedDocs = []

//       bookingid.forEach(async(ele)=>{
//         const bookingUpdatedDoc = await Booking.findByIdAndUpdate({_id:ele},{ paymentId:paymentUpdate._id},{new:true}).populate('workSpaceId').populate({path: 'spaceId', populate: {path: 'spaceTypeId',},})
//             bookingUpdatedDoc.paymentId = paymentUpdate

//             qr.toDataURL(JSON.stringify(bookingUpdatedDoc), (err, code) => {
//               if (err) {
//                 return res.status(500).json({ error: 'Error generating QR code' });
//               }
        
//               // Include the QR code data in the response
//               updatedDocs.push({ bookingUpdatedDoc, qrCode: code });
//             })

//       })

//       console.log(updatedDocs)

//       res.json(updatedDocs)


//   } catch (e) {

//       res.json(e)

//   }
// };

paymentCltr.update = async (req, res) => {
  try {
    const transId = req.query.transaction;
    const bookingid = req.query.booking.split(','); 
    // console.log(transId, "-----------", bookingid);
    const status = req.body.status;
    const paymentUpdate = await Payment.findOneAndUpdate(
      { transactionId: transId },
      { status },
      { new: true }
    );

    const updatedDocs = [];

    // Use Promise.all to wait for all asynchronous operations to complete
    await Promise.all(
      bookingid.map(async (ele) => {
        const bookingUpdatedDoc = await Booking.findByIdAndUpdate(
          { _id: ele },
          { paymentId: paymentUpdate._id },
          { new: true }
        )
          .populate('workSpaceId')
          .populate({
            path: 'spaceId',
            populate: { path: 'spaceTypeId' },
          });

        bookingUpdatedDoc.paymentId = paymentUpdate;

        // Generate the QR code for each bookingUpdatedDoc
        const qrCode = await new Promise((resolve, reject) => {
          qr.toDataURL(JSON.stringify(bookingUpdatedDoc), (err, code) => {
            if (err) {
              reject('Error generating QR code');
            } else {
              resolve(code);
            }
          });
        });

        // Push the bookingUpdatedDoc and qrCode into the updatedDocs array
        updatedDocs.push({ bookingUpdatedDoc, qrCode });
      })
    );
    sendBookingEmail(updatedDocs[0].bookingUpdatedDoc.workSpaceId.name,updatedDocs[0].qrCode)

    res.json(updatedDocs);
  } catch (e) {
    res.json(e);
  }
};






paymentCltr.delete = async (req, res) => {
  try {



  } catch (e) {




  }
};


const sendBookingEmail = async (name, imgBase64) => {
     
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: 'Muthakaniveerashekhar@gmail.com',
    subject: 'WorkSpace Booking Confirmed',
    html: `<h2>Booking is confirmed in ${name}</h2>

            <h3> Provide the qr code attached to this mail for validation in the workSpace</h3>
            <h3>Enjoy Share Space</h3>`,
            attachments: [
              {
                filename: 'qrcode.png', // Filename for the attachment
                path: `${imgBase64}`, // Path to the generated QR code image
                cid: 'unique@nodemailer.com', // Use a unique identifier
              },
            ]
  };

  transporter.sendMail(mailOptions);
}







module.exports = paymentCltr
