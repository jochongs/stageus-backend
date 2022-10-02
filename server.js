//모듈 import ==================================================================================================================================================
const express = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');

const sessionApi = require('./router/session');
const pagesApi = require('./router/pages');
const accountApi = require('./router/account');
const postApi = require('./router/post');
const commentApi = require('./router/comment');
const authApi = require('./router/auth');


//설정 =========================================================================================================================================================
dotenv.config();
const PUBLIC_PATH = path.join(__dirname,'public');

//전역 미들웨어 =====================================================================================================================================================
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(session({
    secret : "sadfklasdjfl", //대충 입력
    resave : false,
    saveUninitialized : true,
}))
app.use("/page",pagesApi); 
app.use('/account',accountApi);
app.use('/session',sessionApi);
app.use('/post',postApi);
app.use('/comment',commentApi);
app.use('/auth',authApi);

//페이지==========================================================================================================================================================
//메인페이지
app.get('/',(req,res)=>{
    res.sendFile(path.join(PUBLIC_PATH,'html','index.html'));
});

//404예외처리
app.get('*',(req,res)=>{
    res.sendFile(path.join(PUBLIC_PATH,'html','error404.html'));
})


//listen
app.listen(process.env.PORT,()=>{
    console.log(`web server on  PORT : ${process.env.PORT}`); //https://nodejs.org/api/process.html#process_process_env
});


//cohesion이 함수형 프로그래밍의 트렌드 -> 객체는 객체지향 설계를 하면서 유기적으로 연결되면서 설계를 함. 함수안에서 다 해결되도록 함수형으로 코딩하는 것을 말함