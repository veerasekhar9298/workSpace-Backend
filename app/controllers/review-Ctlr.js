const Review = require('../modals/review-Modal')
const { validationResult } = require('express-validator')
const reviewCltr = {}

reviewCltr.create = async (req,res)=>{
    try{

        const errors = validationResult(req)

        if(! errors.isEmpty()){
            res.status(400).json({errors:errors.array()})
        }else{
            const body = req.body
            const id  = req.params.id
        const review = new Review({
            comment:body.comment,
            rating:body.rating,
            userId:req.user._id,
            workspaceId:id
        })

            const reviewDoc = await review.save()
                    const final = await reviewDoc.populate({path:'userId',select:"username email"})
        res.json(final) 



        }


    }catch(e){
            res.json(e)
    }
}



reviewCltr.list = async (req,res)=>{
  
    try{
        const id = req.params.id 
        
        const allreviews = await Review.find({workspaceId:id}).populate({path:'userId',select:"username email"})
       
        res.json(allreviews)

    }catch(e){

        res.json(e)

    }
}



 

reviewCltr.update = async (req,res)=>{
    try{
        const errors = validationResult(req)

        if(! errors.isEmpty()){
            res.status(400).json({errors:errors.array()})
        }else{
            const reviewId = req.params.id
        const body = req.body
        const updatedreview = await Review.findByIdAndUpdate({_id:reviewId},body,{new:true}).populate({path:'userId',select:"username email"})
        res.json(updatedreview)

        }

        

    }catch(e){
            res.json(e)
    }
}




reviewCltr.delete = async (req,res)=>{
    try{
        const reviewId = req.params.id
        const  delReview = await Review.findOneAndDelete({_id:reviewId,userId:req.user._id})

        res.json(delReview)
    }catch(e){

        res.json(e)


    }
}

module.exports = reviewCltr