//모듈 import ==================================================================================================================================================
const express = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql');
const session = require('express-session');
const postAuthCheck = require('./module/post_auth_check');
const pgConfig = require('./module/pg_config');

const sessionApi = require('./router/session');
const pagesApi = require('./router/pages');
const accountApi = require('./router/account');
const postApi = require('./router/post');
const commentApi = require('./router/comment');


//설정 =========================================================================================================================================================
dotenv.config();
const PUBLIC_PATH = path.join(__dirname,'public');



//DB 설정 =========================================================================================================================================================
const DB_SET = {
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE,
}
const DB = mysql.createConnection(DB_SET);

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

//페이지==========================================================================================================================================================
//메인페이지
app.get('/',(req,res)=>{
    res.sendFile(path.join(PUBLIC_PATH,'html','index.html'));
});

//404예외처리
app.get('*',(req,res)=>{
    res.sendFile(path.join(PUBLIC_PATH,'html','error404.html'));
})


//api ========================================================================================================================================================


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



//listen
app.listen(process.env.PORT,()=>{
    console.log(`web server on  PORT : ${process.env.PORT}`); //https://nodejs.org/api/process.html#process_process_env
});


//cohesion이 함수형 프로그래밍의 트렌드 -> 객체는 객체지향 설계를 하면서 유기적으로 연결되면서 설계를 함. 함수안에서 다 해결되도록 함수형으로 코딩하는 것을 말함