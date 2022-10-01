const postAuthCheck = (req,res,next)=>{
    if(req.session.userId === undefined){
        const tempObj = {
            state : false,
            error : {
                DB : false,
                auth : false,
                errorMessage : "접근 권한이 없습니다."
            }
        }
        res.send(tempObj);
    }else{
        next();
    }
}   

module.exports = postAuthCheck;