const path = require('path');
module.exports = (req,res,next)=>{
    if(req.session.userId !== undefined){
        next();
    }else{
        res.sendFile(path.join(__dirname,'..','public','html','login.html'));
    }
}