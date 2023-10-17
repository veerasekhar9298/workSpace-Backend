const  Booking = require('../modals/Booking-Modal')
const Space = require('../modals/space-Modal')
const workSpace = require('../modals/work_space-Modal')
const { validationResult } = require('express-validator')
const BookingCltr = {}
  
BookingCltr.create= async (req,res)=>{
   
    try{

      // const errors = validationResult(req)
       

        const body = req.body

        const workspaceIdToObjectMap = {};

        body.items.forEach(workspace => {
            const workspaceId = workspace.workSpaceId._id;
            
            if (!workspaceIdToObjectMap[workspaceId]) {
                workspaceIdToObjectMap[workspaceId] = [];
            }
            
            workspaceIdToObjectMap[workspaceId].push(workspace);
        });
        
      

        const bookingsDoc = []
        
        for(const key in workspaceIdToObjectMap){
             const book =    new Booking({
                    userId:req.user._id,
                    workSpaceId:key,
                    spaceId:workspaceIdToObjectMap[key].map((ele)=>ele.itemId).flat(),
                    startDate:workspaceIdToObjectMap[key][0].startDate,
                    endDate:workspaceIdToObjectMap[key][0].endDate,
                    totalPrice:workspaceIdToObjectMap[key].reduce((preV,curV)=>{return preV+curV.price},0)
                })

                const doc = await book.save()
                const bookedSpaces =  await Space.updateMany(
                                { _id: { $in: doc.spaceId } },
                                {
                                  $set: {
                                    isAvailable: false, 
                                    tenentId: doc.userId
                                  }
                                }
                              )
                    

                    bookingsDoc.push(doc)
                
        }

            bookingsDoc.forEach(async(ele)=>{
                await workSpace.findByIdAndUpdate({_id:ele.workSpaceId},{$push:{bookings:ele._id}})
            })

        res.status(200).json(bookingsDoc)


    }catch(e){
        res.json(e)
    }
    
}


BookingCltr.list= async (req,res)=>{
    try{
        if(req.user.role==='owner'){
            const bookings = await Booking.find({}).populate('workSpaceId')
            
            const ownersBookings = bookings.filter((ele)=>String(ele.workSpaceId.owner)===String(req.user._id))
            res.json(ownersBookings)
        }else if(req.user.role ==="user"){

            const bookings = await Booking.find({userId:req.user._id})

            res.json(bookings)

        }


    }catch(e){


        res.json(e)


    }
    
}


BookingCltr.Single = async (req,res)=>{
        
        const id = req.params.id
    try{
        const bookings = await Booking.find({}).populate('workSpaceId')
            
            const ownersBookings = bookings.filter((ele)=>String(ele.workSpaceId._id)===String(id))
           
            res.json(ownersBookings)

    }catch(e){
        res.json(e)

    }
}

BookingCltr.update= async (req,res)=>{
    try{

    }catch(e){

    }
    
}

BookingCltr.delete = async (req, res) => {
    try {
      const bookingIds = req.query.booking.split(',');
  
      const spaceIdsToDelete = []; // Collect space IDs to update
  
      for (const bookingId of bookingIds) {
        const booking = await Booking.findById(bookingId);
  
        if (!booking) {
          // Handle the case where the booking doesn't exist
          continue;
        }
  
        // Add spaceIds from the booking to the list
        spaceIdsToDelete.push(...booking.spaceId);
  
        // Delete the booking
        await Booking.findByIdAndDelete(bookingId);
      }
  
      if (spaceIdsToDelete.length > 0) {
        // Update the corresponding Space documents
        const updateSpacesResult = await Space.updateMany(
          { _id: { $in: spaceIdsToDelete } },
          {
            $set: {
              isAvailable: true,
              tenentId: null,
            },
          }
        );
  
        if (updateSpacesResult.nModified > 0) {
          res.status(200).json({ message: 'Bookings deleted and Spaces updated successfully' });
        } else {
          res.status(404).json({ message: 'No matching Spaces found for the deleted bookings' });
        }
      } else {
        res.status(404).json({ message: 'No bookings found with the provided IDs' });
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

module.exports = BookingCltr
