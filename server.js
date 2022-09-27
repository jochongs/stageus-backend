//모듈 import 
const express = require('express');
const testRegExp = require('./function/reg_exp/reg_exp');
const path = require('path');
const app = express();
const dotenv = require('dotenv');
const mysql = require('mysql');
const session = require('express-session');

//설정
dotenv.config();
const PUBLIC_PATH = path.join(__dirname,'public');

//db 설정
const DB_SET = {
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE,
}
const DB = mysql.createConnection(DB_SET);

//미들웨어
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(session({
    secret : "sadfklasdjfl", //대충 입력
    resave : false,
    saveUninitialized : true,
}))

//미들웨어 함수
const authCheck = (req,res,next)=>{
    if(req.session.userId !== undefined){
        next();
    }else{
        res.sendFile(path.join(PUBLIC_PATH,'html','login.html'));
    }
}

//api

//메인페이지
app.get('/',(req,res)=>{
    res.sendFile(path.join(PUBLIC_PATH,'html','index.html'));
});

//로그인 페이지
app.get('/session/new',(req,res)=>{
    res.sendFile(path.join(PUBLIC_PATH,'html','login.html'));
});

//회원가입 페이지 
app.get('/account/new',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','html','signup.html'));
})

//에러 페이지
app.get('/error',(req,res)=>{
    res.sendFile(path.join(PUBLIC_PATH,'html','error.html'));
});

//게시글 쓰기 페이지
app.get('/post/new',authCheck,(req,res)=>{
    res.sendFile(path.join(PUBLIC_PATH,'html','post_write.html'));
})

//게시글 쓰기 api
app.post('/post',authCheck,(req,res)=>{
    const {title : titleValue,contents : contentsValue} = req.body;
    const error = {
        state : false,
        message : "",
        db : {
            state : false,
        }
    }
    if(titleValue.length === 0 || titleValue.length > 32){
        error.state = true;
        error.message = "제목의 길이는 1~32자여야 합니다.";
    }
    if(contentsValue.length ===0){
        error.state = true;
        error.message = "글의 내용은 필수로 입력해야합니다.";
    }

    const sql = `INSERT INTO post (post_title,post_contents,post_author) VALUES ('${titleValue}','${contentsValue}','${req.session.userId}')`;
    console.log('요청한 회원의 아이디 : '+req.session.userId);
    DB.query(sql,(err,results,fields)=>{
        console.log(results);
        if(err){
            console.log(err);
            error.db.state = true;
        }
        res.send(error);
    })
});

//로그인 시도 Api
app.post('/session',(req,res)=>{
    //FE로부터 받아오는 값
    const idValue = req.body.id;
    const pwValue = req.body.pw;

    //FE로 보내줄 값
    const error = {
        state : false,
        message : "",
        db : {
            state : false,
        }
    }

    //예외처리
    if(!testRegExp(idValue) || !testRegExp(pwValue,"pw")){ //아이디가 정규표현식에 맞지 않을경우 db에 굳이 접근하지 않음
        error.message = "아이디가 잘못되었습니다.1";
        res.send(error);
    }else{
        const sql = `SELECT * FROM account WHERE id='${idValue}'`;
        DB.query(sql,(err,results,fields)=>{
            if(err){
                error.state  = true;
            }else{
                if(pwValue.length !== 0 && pwValue !== undefined && pwValue === results[0]?.pw){
                    error.state = true;
                    req.session.userId = idValue;
                }else{
                    error.message = '아이디또는 비밀번호가 잘못되었습니다.';
                }
            }
            res.send(error);
        });
    }
})

//모든 게시글
app.get('/post',(req,res)=>{
    const sql = `SELECT * FROM post`;
    const result ={
        error : false,
        data : [],
    }
    DB.query(sql,(err,results)=>{
        if(err){
            result.error = true;
        }else{
            result.data = results;
        }
        res.send(results);
    })
})

//회원정보 시도 api (회원가입 api)
app.post('/account',(req,res)=>{
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
        db : {
            state : false,
        }
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
    
    if(!error.state){ //에러가 없을 경우 실행
        const sql = `INSERT INTO account VALUES ('${idValue}','${pwValue}',NULL,'${nameValue}','${nicknameValue}')`;
        const checkIdSql = `SELECT * FROM account WEHRE id='${idValue}'`; //이걸 쓸까 말까 고민 
        DB.query(sql,(err,results,fields)=>{
            if(err){

                //믿어도 되는가 ? 안되면 db 아이디를 뽑아서 있는 지 확인후 insert query 실행
                if(err.code === 'ER_DUP_ENTRY'){
                    const tempObj = {
                        class : "id_input_container",
                        message : "이미 있는 아이디입니다."
                    }
                    error.errorArray.push(tempObj);
                    error.state = true;
                }else{
                    error.db.state = true;
                }
            }
            res.send(error);
        });
    }else{
        res.send(error);
    }
})

//로그아웃 api
app.delete('/session',(req,res)=>{
    console.log(`${req.session.userId} 회원이 로그아웃을 시도 `);
    req.session.userId = undefined;
})

//listen
app.listen(process.env.PORT,()=>{
    console.log(`web server on  PORT : ${process.env.PORT}`); //https://nodejs.org/api/process.html#process_process_env
});