const authorizeUser = (req,res,next)=>{
    if(req.permitRoles.includes(req.user.role)){
        next()
    }else{
        res.status(403).json({
            errors: 'Access denied'
        })
    }
}

module.exports = authorizeUser