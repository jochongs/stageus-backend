const path = require('path');
module.exports = (req,res,next)=>{
    console.log(req.session.authority);
    if(req.session.authority === 'admin'){
        next();
    }else{
        res.sendFile(path.join(__dirname,'..','public','html','index.html'));
    }
}