//모듈 import ==================================================================================================================================================
const express = require('express');
const testRegExp = require('./function/reg_exp/reg_exp');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql');
const session = require('express-session');
const app = express();

const sessionApi = require('./router/session');
const pagesApi = require('./router/pages');
const accountApi = require('./router/account');



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
app.use("/",pagesApi); 
app.use('/account',accountApi);
app.use('/session',sessionApi);



//미들웨어 함수 ========================================================================================================================================================
//get요청 로그인 상태 확인 -> 로그인페이지로 이동
const authCheck = (req,res,next)=>{
    if(req.session.userId !== undefined){
        next();
    }else{
        res.sendFile(path.join(PUBLIC_PATH,'html','login.html'));
    }
}
//post요청 로그인 상태 확인 {error:true}
const postAuthCheck = (req,res,next)=>{
    if(req.session.userId === undefined){
        res.send({
            error : true
        })
    }else{
        next();
    }
}

//api ========================================================================================================================================================
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

//모든 게시글 데이터를 가져오는 api
app.get('/post',(req,res)=>{
    const sql = `SELECT nickname,post_author,post_title,post_contents,post_idx,post_date,post_title FROM post JOIN account ON id=post_author`;
    const result ={
        error : false,
        data : []
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

//404예외처리
app.get('*',(req,res)=>{
    res.sendFile(path.join(PUBLIC_PATH,'html','error404.html'));
})

//listen
app.listen(process.env.PORT,()=>{
    console.log(`web server on  PORT : ${process.env.PORT}`); //https://nodejs.org/api/process.html#process_process_env
});


//cohesion이 함수형 프로그래밍의 트렌드 -> 객체는 객체지향 설계를 하면서 유기적으로 연결되면서 설계를 함. 함수안에서 다 해결되도록 함수형으로 코딩하는 것을 말함