 const WorkSpace = require('../modals/work_space-Modal')
 const s3Uploadv2 = require('../aws/s3Service')
const axios = require('axios')
const Booking = require('../modals/Booking-Modal')
const space = require('../modals/space-Modal')
const spaceType = require('../modals/space-Type-Modal')
const Review = require('../modals/review-Modal')
 const workSpaceCltr = {}
 const { validationResult } = require('express-validator')

 






 
 workSpaceCltr.create = async (req,res)=>{
    try{
      const errors = validationResult(req)
        if(! errors.isEmpty()){
              res.status(400).json({errors:errors.array()})
        }else{
          const body =req.body 
      const files = req.files
      const uploadedImages = [];
      
      for (const file of files) {
         const result = await s3Uploadv2(file);
         uploadedImages.push(result.Location);
      }
      const addressArr = body.address.split(',')
      const searchString = `${addressArr[0]}%2C%20${addressArr[1]}%2C%20${addressArr[2]}%2C%20${addressArr[3]}%2C%20${addressArr[4]}%2C%20${addressArr[5]}`
      
      const  mapResponse =  await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${searchString}&apiKey=80e77d2810ca41a28eaad0bfbf8735fe`)
      const space = new WorkSpace({...body,images:uploadedImages,facilities:body.facilities.split(','),owner:req.user._id,address:{name:body.address,latitude:mapResponse.data.features[0].properties.lat,longitude:mapResponse.data.features[0].properties.lon}})
        const spaceDoc = await space.save()
           
         res.json(spaceDoc)
        }
      

    }catch(e){
        res.json(e)
    }
 }
 

 workSpaceCltr.list = async (req, res) => {
  try {
    const aggregateResult = await Review.aggregate([
      {
        $group: {
          _id: "$workspaceId",
          averageRating: { $avg: "$rating" }, 
        },
      },
      {
        $project: {
          _id: 0, 
          workspaceId: "$_id",
          averageRating: 1, 
        },
      },
      {
        $project: {
          workspaceId: 1,
          averageRating: { $trunc: ["$averageRating", 1] }, 
        },
      },
    ]);

    if (req.user.role === "owner") {
      const allworkSpaces = await WorkSpace.find({ owner: req.user._id });
      res.json(allworkSpaces);
    } else {
      const { sort, filter } = req.query; 

      const allWorkSpaces = await WorkSpace.find({}).collation({ locale: "en", strength: 2 });

      const spaces = [...allWorkSpaces];
      const ratings = [...aggregateResult];

      const finalDoc = spaces.map((ele) => {
        const R = ratings.find((ele2) => ele2.workspaceId.toString() === ele._id.toString());
        if (R) {
          return { ...ele.toObject(), averageRating: R.averageRating };
        } else {
          return { ...ele.toObject(), averageRating: null };
        }
      });

      // Apply filtering if 'filter' query parameter is provided
      if (filter) {

        const filterValue = parseFloat(filter);
        if (!isNaN(filterValue) && filterValue >= 3) {
          const filteredDoc = finalDoc.filter((doc) => Math.floor(doc.averageRating) >= filterValue);
          applySorting(filteredDoc, sort);
        } else if(!isNaN(filterValue) && filterValue >= 4) {
          const filteredDoc = finalDoc.filter((doc) => Math.floor(doc.averageRating) >= filterValue);
          applySorting(filteredDoc, sort);
        } else if (!isNaN(filterValue) && filterValue >= 2){
          const filteredDoc = finalDoc.filter((doc) => Math.floor(doc.averageRating) >= filterValue);
          applySorting(filteredDoc, sort);
        }

      } else {
        
        applySorting(finalDoc, sort);
      }
    }

    function applySorting(docArray, sortValue) {
      if (sortValue === "1") {
        docArray.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
      } else if (sortValue === "2") {
        docArray.sort((a, b) => b.name.localeCompare(a.name, "en", { sensitivity: "base" }));
      }
     
      res.json(docArray);
    }
  } catch (e) {
    res.json(e);
  }
}

 workSpaceCltr.single = async (req,res)=>{
   try{
      const id = req.params.id
      const workSpace = await WorkSpace.findById(id).populate({
         path: 'bookings',
         populate: {
           path: 'userId',
           select: 'username email', 
         },
       })
      res.json(workSpace)

   }catch(e){
            res.json(e)
   }
 }

 workSpaceCltr.singleEdit = async (req,res)=>{
   try{
      const id = req.params.id

    

   }catch(e){

      res.json(e)

   }
 }


workSpaceCltr.allWorkSpaceAnalysis = async (req, res) => {
   try {
     const allworkSpaces = await WorkSpace.find({ owner: req.user._id });
     const arrayworkSpaceIds = allworkSpaces.map((ele) => ele._id);
 
     const analysis = await space.aggregate([
       {
         $match: {
           workSpaceId: { $in: arrayworkSpaceIds },
         },
       },
       {
         $group: {
           _id: '$workSpaceId',
           availableCount: { $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] } },
           occupiedCount: { $sum: { $cond: [{ $eq: ['$isAvailable', false] }, 1, 0] } },
         },
       },
     ]);
    
 
     // Map the analysis data to the desired format
     const formattedData = analysis.map((item) => ({
       name: item._id,
       data: {
         Available: item.availableCount,
         Occupied: item.occupiedCount,
       },
     }));
     res.json(formattedData);
   } catch (e) {
     res.json(e);
   }
 };




 workSpaceCltr.revenue = async (req,res)=>{

   try{
      const allworkSpaces = await WorkSpace.find({ owner: req.user._id });
       const arrayworkSpaceIds = allworkSpaces.map((ele) => ele._id);

       const revenueData = await Booking.aggregate([
         {
           $match: {
             workSpaceId: { $in: arrayworkSpaceIds },
           },
         },
         {
           $group: {
             _id: '$workSpaceId',
             totalRevenue: { $sum: '$totalPrice' },
           },
         },
       ])

        const formattedData = revenueData.map((item) => ({
      workSpaceId: item._id,
      totalRevenue: item.totalRevenue,
    }));

    // Calculate overall revenue
    const overallRevenue = formattedData.reduce((acc, item) => acc + item.totalRevenue, 0);

    res.json({
      workspaceRevenues: formattedData,
      overallRevenue: overallRevenue,
    })

   }catch(e){

      res.json(e)

   }
 }
 


 workSpaceCltr.analysis = async (req,res)=>{
   try{
      const id = req.params.wid
      const spaces = await space.find({workSpaceId:id})

      const analysis = {availability:spaces.filter((ele)=>{return ele.isAvailable}).length,occupied:spaces.filter((ele)=>{return !ele.isAvailable}).length}
         res.json(analysis)
   }catch(e){

      res.json(e)
   }
 }


 workSpaceCltr.update = async (req,res)=>{
    try{
     
        const id = req.params.id
      const body =req.body 
      const files = req.files
   
      const uploadedImages = [];
      
      for (const file of files) {
         const result = await s3Uploadv2(file);
         uploadedImages.push(result.Location);
      }
      const addressArr = body.address.split(',')
      const searchString = `${addressArr[0]}%2C%20${addressArr[1]}%2C%20${addressArr[2]}%2C%20${addressArr[3]}%2C%20${addressArr[4]}%2C%20${addressArr[5]}`
      
      const  mapResponse =  await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${searchString}&apiKey=80e77d2810ca41a28eaad0bfbf8735fe`)

      if(uploadedImages.length ===0){
        const updatedDoc = await WorkSpace.findByIdAndUpdate({_id:id},{...body,facilities:body.facilities.split(','),owner:req.user._id,address:{name:body.address,latitude:mapResponse.data.features[0].properties.lat,longitude:mapResponse.data.features[0].properties.lon}},{new:true})
        res.json(updatedDoc)
      }else{
       
        const updatedDoc = await WorkSpace.findByIdAndUpdate({_id:id},{...body,images:uploadedImages,facilities:body.facilities.split(','),owner:req.user._id,address:{name:body.address,latitude:mapResponse.data.features[0].properties.lat,longitude:mapResponse.data.features[0].properties.lon}},{new:true})

        res.json(updatedDoc)
      }

           


      
    }catch(e){ 

         res.json(e)


    }
 }


 workSpaceCltr.listPublic = async (req,res)=>{

  try{
    const aggregateResult = await Review.aggregate([
      {
        $group: {
          _id: "$workspaceId",
          averageRating: { $avg: "$rating" }, 
        },
      },
      {
        $project: {
          _id: 0, 
          workspaceId: "$_id",
          averageRating: 1, 
        },
      },
      {
        $project: {
          workspaceId: 1,
          averageRating: { $trunc: ["$averageRating", 1] }, 
        },
      },
    ])
    const allWorkSpaces = await WorkSpace.find({})
    const spaces = [...allWorkSpaces];
      const ratings = [...aggregateResult];

      const finalDoc = spaces.map((ele) => {
        const R = ratings.find((ele2) => ele2.workspaceId.toString() === ele._id.toString());
        if (R) {
          return { ...ele.toObject(), averageRating: R.averageRating };
        } else {
          return { ...ele.toObject(), averageRating: null };
        }
      })
        
    res.json(finalDoc)

  }catch(e){


    res.json(e)


  }
 }
 


 workSpaceCltr.delete = async (req,res)=>{
    try{
      const id = req.params.id
      const spaceDoc =  await WorkSpace.findByIdAndDelete({_id:id})

      res.json(spaceDoc)

    }catch(e){
         res.json(e)
    }
 }



 workSpaceCltr.maps = async (req,res)=>{
   try {
      const pipeline = [
        {
          $project: {
            workSpaceId: '$_id',
            address: '$address.name',
            latitude: '$address.latitude',
            longitude: '$address.longitude',
          },
        },
      ];

      const result = await WorkSpace.aggregate(pipeline);

      res.json(result);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'An error occurred while aggregating data.' });
    }

 }

 module.exports = workSpaceCltr




 