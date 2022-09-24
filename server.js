//모듈 import 
const express = require('express');
const path = require('path');
const app = express();
const dotenv = require('dotenv');

//설정
dotenv.config();
const PUBLIC_PATH = path.join(__dirname,'public');

//미들웨어
app.use(express.json());
app.use(express.static(path.join(__dirname)));

//미들웨어 함수
const authCheck = (req,res,next)=>{
    
}

//api
app.get('/',(req,res)=>{
    res.sendFile(path.join(PUBLIC_PATH,'html','index.html'));
});

app.get('/login',(req,res)=>{
    res.sendFile(path.join(PUBLIC_PATH,'html','login.html'));
});

app.post('/account',(req,res)=>{
    console.log('post /account 실행됨');
    //FE로부터 받아오는 값
    const idValue = req.body.id;
    const pwValue = req.body.pw;

    //예외처리

    console.log(idValue,pwValue);
    //FE로 보내줄 값
    const result = {
        "success" : false
    }

    //API 로직
    if(idValue === 'stageus' && pw ==='1234'){
        result.success = true;
    }

    //값 반환
    res.send(result);
})

app.get('/signup',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','html','signup.html'));
})

app.post('/signup',(req,res)=>{
    //get input data
    const idValue = req.body.id;
    const pwValue = req.body.pw;
    const pwCheckValue = req.body.pwCheck;
    const nameValue = req.body.name;
    const nicknameValue = req.body.nickname;
    
    //temp data
    const signupRegExp = {
        id : /^[a-z]+[a-z0-9]{5,13}$/g, //영문자로 시작하는 영문자 또는 숫자 6~12자
        pw : /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,12}$/, //8~12자 영문, 숫자 조합
        name : /^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,6}$/, //한글 또는 숫자 2~6글자
        nickname : /^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,12}$/ //한글 또는 숫자 2~12글자
    }
    const errorMessage = {
        id : {
            regError : "아이디는 영문자로 시작하는 영문자 또는 숫자 6~12자이어야 합니다."
        },
        pw : {
            regError : "비밀번호는 8~12자의 영문과 숫자의 조합이여야 합니다. ",
        },
        pwCheck : {
            difPwError : "비밀번호와 다릅니다.",
        },
        name : {
            regError : "이름은 2~6글자의 한글 또는 영문자이어야 합니다.",
        },
        nickname : {
            regError : "닉네임은 2~12글자의 한글 또는 영문자이어야 합니다.",
        }
    }
    const error = {
        state : false,
        errorArray : [],
    };

    //exception
    if(!signupRegExp.id.test(idValue)){ //id RegExp error 
        const tempObj = {
            class : "id_input_container",
            message : errorMessage.id.regError,
        }
        error.state = true; 
        error.errorArray.push(tempObj);
    }
    if(!signupRegExp.pw.test(pwValue)){ //pw RegExp error
        const tempObj = {
            class : "pw_input_container",
            message : errorMessage.pw.regError,
        }
        error.state = true; 
        error.errorArray.push(tempObj);
    }
    if(pwCheckValue !== pwValue){ //if pwCheckValue is different from pw
        const tempObj = {
            class : "pw_check_input_container",
            message : errorMessage.pwCheck.difPwError,
        }
        error.state = true;
        error.errorArray.push(tempObj);
    }
    if(!signupRegExp.name.test(nameValue)){ //name RegExp error
        const tempObj = {
            class : "name_input_container",
            message : errorMessage.name.regError,
        }
        error.state = true; 
        error.errorArray.push(tempObj);
    }
    if(!signupRegExp.nickname.test(nicknameValue)){ //nickname RegExp error
        const tempObj = {
            class : "nickname_input_container",
            message : errorMessage.nickname.regError,
        }
        error.state = true; 
        error.errorArray.push(tempObj);
    }
    res.send(error);
})

//listen
app.listen(process.env.PORT,()=>{
    console.log(`web server on  PORT : ${process.env.PORT}`); //https://nodejs.org/api/process.html#process_process_env
});