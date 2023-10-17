const spaceType = require('../modals/space-Type-Modal')
const Space = require('../modals/space-Modal');
const { validationResult } = require('express-validator')
const spaceTypeCtlr = {}

  
spaceTypeCtlr.create= async (req,res)=>{
    try{
        const errors = validationResult(req)

        if(!errors.isEmpty){
            res.status(400).json({errors:errors.array()})
        }else{
            const body = req.body 
            const type = spaceType(body)
            const spaceTypeDoc =await type.save()
            // res.json(spaceTypeDoc)
            const spacesToCreate = [];
            for (let i = 0; i < spaceTypeDoc.quantity; i++) {
                spacesToCreate.push({
                    spaceTypeId: spaceTypeDoc._id,
                    workSpaceId: spaceTypeDoc.workspace,
                    isAvailable: true,
                });
            }
            const createdSpaces = await Space.create(spacesToCreate)
            
            res.json({ spaceType: spaceTypeDoc, createdSpaces })

        }

    }catch(e){
            res.json(e)
    } 
    
}


spaceTypeCtlr.list= async (req,res)=>{
    try{
        const allSpaceTypes = await spaceType.find({workspace:req.params.id})
        res.json(allSpaceTypes)
    }catch(e){
            res.json(e)
    }
    
}


spaceTypeCtlr.update= async (req,res)=>{
    try{

    }catch(e){

    }
    
}


spaceTypeCtlr.delete= async (req,res)=>{
    try{

    }catch(e){

    }
    
}


module.exports =  spaceTypeCtlr