const router = require('express').Router();
const path = require('path');
const PUBLIC_PATH = path.join(__dirname,'../','public');

//메인페이지
router.get('/',(req,res)=>{
    res.sendFile(path.join(PUBLIC_PATH,'html','index.html'));
});

//로그인 페이지
router.get('/page/login',(req,res)=>{
    res.sendFile(path.join(PUBLIC_PATH,'html','login.html'));
});

//회원가입 페이지 
router.get('/page/signup',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','html','signup.html'));
})

//에러 페이지
router.get('/page/error',(req,res)=>{
    res.sendFile(path.join(PUBLIC_PATH,'html','error.html'));
});

//게시글 디테일 페이지
router.get('/page/post/:postIdx',(req,res)=>{
    res.sendFile(path.join(PUBLIC_PATH,'html','post_detail.html'));
})



module.exports = router;