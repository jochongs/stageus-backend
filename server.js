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

const postAuthCheck = (req,res,next)=>{
    if(req.session.userId === undefined){
        res.send({
            error : true
        })
    }else{
        next();
    }
}


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

//게시글 디테일 페이지
app.get('/post/detail/:postIdx',(req,res)=>{
    res.sendFile(path.join(PUBLIC_PATH,'html','post_detail.html'));
})




//게시글 쓰기 api
app.post('/post',postAuthCheck,(req,res)=>{
    console.log('hi');
    const {title : titleValue, contents : contentsValue} = req.body;
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
    if(contentsValue.length ===0){ //contents 길이 어디까지로 해야되는지 물어보기
        error.state = true;
        error.message = "글의 내용은 필수로 입력해야합니다.";
    }

    if(!error.state){
        const sql = `INSERT INTO post (post_title,post_contents,post_author) VALUES (?,?,?)`;
        console.log('요청한 회원의 아이디 : '+req.session.userId);
        const valueArray = [titleValue,contentsValue, req.session.userId];
        DB.query(sql,valueArray,(err,results,fields)=>{
            if(err){
                console.log(err);
                error.db.state = true;
            }
            res.send(error);
        })
    }else{
        res.send(error);
    }
});

//로그인 시도 api
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
        const sql = `SELECT * FROM account WHERE id=?`;
        DB.query(sql,[idValue],(err,results,fields)=>{
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

//모든 게시글 데이터를 가져오는 api
app.get('/post',(req,res)=>{
    const sql = `SELECT nickname,post_author,post_title,post_contents,post_idx,post_date,post_title FROM post JOIN account ON id=post_author`;
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

//특정 게시글의 db데이터 가져오는 api
app.get('/post/:postIdx',(req,res)=>{
    const postIdx = req.params.postIdx;
    const sql = `SELECT * FROM post JOIN account ON post_author=id WHERE post_idx=?`;
    DB.query(sql,[postIdx],(err,results)=>{
        if(err){
            console.log(err);
            res.send(err);
        }else{
            res.send(results);  
        }
    })

})

//댓글의 db데이터를 가져오는 api
app.get('/comment',(req,res)=>{
    const postIdx = req.query.postIdx;
    const sql = `SELECT * FROM comment JOIN account ON comment_author=id WHERE post_idx=?`;
    DB.query(sql,[postIdx],(err,results)=>{
        if(err){
            res.send(err);
        }else{
            res.send(results);
        }
    })
});

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
        const sql = `INSERT INTO account VALUES (?,?,?,?,?)`;

        const checkIdSql = `SELECT * FROM account WEHRE id='${idValue}'`; //이걸 쓸까 말까 고민 

        DB.query(sql,[idValue,pwValue,null,nameValue,nicknameValue],(err,results,fields)=>{
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

//comment에 데이터 삽입 api
app.post('/comment',postAuthCheck,(req,res)=>{
    const author = req.session.userId;
    const contents = req.body.contents;
    const postIdx = req.query.postIdx;

    if(contents.length === 0){
        res.send({lengthError : true});
    }else{
        const sql = `INSERT INTO comment (comment_author,comment_contents,post_idx) VALUES (?,?,?)`
        const params = [author,contents,postIdx];
        DB.query(sql,params,(err,results)=>{
            if(err){
                console.log(err);
            }else{
                res.send({error : false})
            }
        })
    }
})

//comment 삭제 api
app.delete('/comment/:commentIdx',postAuthCheck,(req,res)=>{
    const commentIdx = req.params.commentIdx;
    const userId = req.session.userId;

    const sql = `SELECT comment_author FROM comment WHERE comment_idx=?`;
    const params = [commentIdx];
    DB.query(sql,params,(err,results)=>{
        if(err){
            console.log(err)
        }else{
            const commentAuthor = results[0].comment_author;
            
            console.log(userId,commentAuthor);
            if(commentAuthor === userId){
                const sql2 = `DELETE FROM comment WHERE comment_idx = ?`;
                const params2 = [commentIdx];
                DB.query(sql2,params2,(err2)=>{
                    if(err2){
                        console.log(err2);
                    }else{
                        res.send({error:false});
                    }
                })
            }else{
                res.send({error : true});
            }
        }
    })
})

//post삭제 api
app.delete('/post/:postIdx',postAuthCheck,(req,res)=>{
    const postIdx = req.params.postIdx;
    const userId = req.session.userId;

    const sql = `SELECT post_author FROM post WHERE post_idx=?`;
    const params = [postIdx];
    DB.query(sql,params,(err,results)=>{
        if(err){
            console.log(err);
        }else{
            const postAuthor = results[0].post_author;
            
            if(postAuthor === userId){
                const sql2 = `DELETE FROM post WHERE post_idx=?`;
                const params2 = [postIdx];
                DB.query(sql2,params2,(err)=>{
                    if(err) console.log(err);
                    else{
                        res.send({error : false});
                    }
                })
            }else{
                res.send({error : true});
            }
        }
    })
})

//comment 수정 api
app.put('/comment/:commentIdx',postAuthCheck,(req,res)=>{
    const commentIdx = req.params.commentIdx;
    const userId = req.session.userId;
    const contents = req.body.contents;


    const sql = `SELECT comment_author FROM comment WHERE comment_idx=?`;
    const params = [commentIdx];
    DB.query(sql,params,(err,results)=>{
        if(err){
            console.log(err);
        }else{
            const commentAuthor = results[0].comment_author;
            if(commentAuthor=== userId){
                const sql2 = `UPDATE comment SET comment_contents=? WHERE comment_idx=?`;
                const params2 = [contents,commentIdx];
                DB.query(sql2,params2,(err)=>{
                    if(err) console.log(err);
                    res.send({error:false});
                })
            }else{
                res.send({error:true});
            }
        }
    })
})

//post 수정 api
app.put('/post/:postIdx',postAuthCheck,(req,res)=>{
    const postIdx = req.params.postIdx; 
    const titleValue = req.body.title;
    const contentsValue = req.body.contents;
    const userId = req.session.userId;

    if(titleValue.length === 0 || contentsValue.length === 0){
        res.send({lengthError : true});
    }else{
        const sql = `SELECT post_author FROM post WHERE post_idx=?`;
        const params = [postIdx];
        DB.query(sql,params,(err,results)=>{
            if(err){
                console.log(err);
            }else{
                const postAuthor = results[0].post_author;
                
                if(postAuthor === userId){
                    const sql2 = `UPDATE post SET post_title=?,post_contents=? WHERE post_idx=?`;
                    const params2 = [titleValue,contentsValue,postIdx];
                    DB.query(sql2,params2,(err)=>{
                        if(err) console.log(err);
                        else{
                            res.send({error : false});
                        }
                    })
                }else{
                    res.send({error : true});
                }
            }
        })
    }
})

//로그아웃 api
app.delete('/session',(req,res)=>{
    try{
        console.log(`${req.session.userId} 회원이 로그아웃을 시도 `);
        req.session.userId = undefined;
        res.send({error:false});
    }catch{
        res.send({error : true});
    }
})





app.get('*',(req,res)=>{
    res.sendFile(path.join(PUBLIC_PATH,'html','error404.html'));
})

//listen
app.listen(process.env.PORT,()=>{
    console.log(`web server on  PORT : ${process.env.PORT}`); //https://nodejs.org/api/process.html#process_process_env
});