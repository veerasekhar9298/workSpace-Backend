 const  Space = require('../modals/space-Modal')
const spaceType = require('../modals/space-Type-Modal')
const Booking = require('../modals/Booking-Modal')

 const spaceCltr = {} 

 spaceCltr.create = async (req,res)=>{
    try{
      
    }catch(e){
         
    }
 }

spaceCltr.list = async (req, res) => {
  try {
    const id = req.params.id;
    const spaces = await Space.find({ workSpaceId: id }).populate('spaceTypeId')
    res.json(spaces);
  } catch (e) {
    res.json(e);
  }
};

spaceCltr.single = async (req,res) =>{

  try{
    const id = req.params.id
        const spaceDetails = await Space.findById({_id:id}).populate({
          path: 'tenentId',
          select: 'username email'
        })

          const bookingdetails = await Booking.findOne({spaceId:{$in:[id]}})
        // const spaceDetailsZ = {...spaceDetails,startDate:bookingdetails.startDate,endDate:bookingdetails.endDate,totalPrice:bookingdetails.totalPrice}
          
        res.json({spaceDetails,bookingdetails})

  }catch(e){

    res.json(e)
 
  }

}





 spaceCltr.update = async (req,res)=>{
    
    try{
      const id = req.params.id
        const updatedSpace = await Space.findByIdAndUpdate({_id:id},req.body,{new:true}).populate('spaceTypeId')
      res.json(updatedSpace)
    }catch(e){

    }
 }


 spaceCltr.delete = async (req,res)=>{
    try{
      const id  = req.params.id
      const deleteSpace = await Space.findByIdAndDelete({_id:id}).populate('spaceTypeId')
      if(deleteSpace){
        const spacetype=  await spaceType.findOneAndUpdate({_id:deleteSpace.spaceTypeId._id,name:deleteSpace.spaceTypeId.name},{$inc:{quantity:-1}})
                res.json(deleteSpace)
        }

    }catch(e){

      res.json(e)


    }
 }

 module.exports = spaceCltr