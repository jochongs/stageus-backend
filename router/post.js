const router = require('express').Router();
const path = require('path');
const { Client } = require('pg');
const { Transform } = require('stream');
const pgConfig = require('../config/pg_config');
const loginAuth = require('../module/login_auth_check');
const postImgUpload = require('../module/post_img_upload');

//api ===========================================================================
//게시글 받아오기 api
router.get('/:option',(req,res)=>{
    //option값 가져오기
    const option = req.params.option;

    //FE로 보낼 값
    const result ={
        state : true,
        error : {
            DB : false,
            auth : true,
            errorMessage : ""
        },
        data : []
    }   

    //sql 준비
    let sql = "";
    let params = [];
    if(option === 'all'){
        sql = `SELECT post_idx,post_title,post_contents,post_date,post_author,nickname FROM backend.post JOIN backend.account ON id=post_author ORDER BY post_idx DESC`;
    }else{
        sql = `SELECT 
                    post_title,
                    post_contents,
                    post_date,post_author,
                    nickname,
                    img_path 
                FROM 
                    backend.post 
                JOIN 
                    backend.account 
                ON 
                    id=post_author 
                LEFT JOIN 
                    backend.post_img_mapping 
                ON 
                    backend.post.post_idx=backend.post_img_mapping.post_idx  
                WHERE 
                    backend.post.post_idx=$1`;
        params.push(option);
    }

    //DB연결
    try{
        const client = new Client(pgConfig);
        client.connect((err)=>{
            if(err) console.log(err);
        })
        client.query(sql,params,(err,data)=>{
            if(err){
                result.state = false;
                result.error.DB = true;
                result.errorMessage = "DB에러가 발생헀습니다.";
            }else{
                delete result.error;
                result.data = data.rows;
            }
            res.send(result);
        })
    }catch{
        result.state = false;
        result.error.DB = true;
        result.errorMessage = "DB에러가 발생헀습니다.";
        res.send(result);
    }
})

//게시글 쓰기 api
router.post('/',loginAuth, postImgUpload.array('postImg'), (req,res)=>{
    //FE로부터 값 받기
    const {title : titleValue, contents : contentsValue, imgFileArray} = req.body;
    console.log(req.body);

    //FE로 보내줄 값
    const result = {
        state : true,
        error : {
            DB : false,
            auth : true,
            errorMessage : []
        }
    }

    //body data의 입력 길이 검사
    if(titleValue.length === 0 || titleValue.length > 32){
        result.state = false;   
        result.error.errorMessage.push({
            class : 'title',
            message : "제목의 길이는 1~32자여야 합니다."
        });
    }
    if(contentsValue.length ===0){ //contents 길이 어디까지로 해야되는지 물어보기
        result.state = false;   
        result.error.errorMessage.push({
            class : 'contents',
            message : "글의 내용은 필수 사항입니다."
        });
    }

    //예외사항 없으면
    if(result.state){
        const sql = `INSERT INTO backend.post (post_title,post_contents,post_author) VALUES ($1,$2,$3) RETURNING post_idx`;
        const valueArray = [titleValue, contentsValue, req.session.userId];
        const client = new Client(pgConfig);
        client.connect((err)=>{
            if(err) console.log(err);
        });
        client.query(sql,valueArray, async (err,data)=>{
            if(err){
                console.log(err);
                result.state = false;
                result.error.DB = true;
                result.error.errorMessage = "DB 연결에 실패했습니다.";
                res.send(result);
            }else{
                const post_idx = data.rows[0].post_idx;
                const sql2 = `INSERT INTO backend.post_img_mapping (post_idx,img_path) VALUES ($1,$2)`;
                //multiple data query insert 
                try{
                    console.log(req.files);
                    for(let i = 0; i < req.files.length; i++){
                        console.log(post_idx,req.files[i].transforms[0].key);
                        await client.query(sql2,[post_idx,req.files[i].transforms[0].key]);
                        console.log('하나 들어갑니다.');
                    }
                    delete result.error;
                    res.send(result);
                }catch(err){
                    console.log(err);
                    result.state = false;
                    result.error.DB = true;
                    result.error.errorMessage = "DB 연결에 실패했습니다.";
                    res.send(result);
                }
            }
        })
    }else{
        res.send(result);
    }
});

//post 수정 api
router.put('/:postIdx',loginAuth,(req,res)=>{
    //FE에서 받아온 데이터
    const postIdx = req.params.postIdx;
    const titleValue = req.body.title;
    const contentsValue = req.body.contents;
    const userId = req.session.userId;

    //FE로 보내줄 데이터
    const result = {
        state : true,
        error : {
            DB : false,
            auth : true,
            errorMessage : []
        }
    }

    //데이터 검증
    if(titleValue.length === 0 || titleValue.length > 32){
        result.state = false;
        result.error.errorMessage.push({
            class : "title",
            message : "제목은 0~32자여야 합니다."
        })
    }
    if(contentsValue.length === 0){
        result.state = false;
        result.error.errorMessage.push({
            class : "contents",
            message : "내용을 입력해야합니다."
        })
    }

    if(result.state){
        try{
            //sql준비
            const sql = `SELECT post_author FROM backend.post WHERE post_idx=$1`;
            const params = [postIdx];

            //DB연결
            const client = new Client(pgConfig);
            client.connect((err)=>{
                if(err) console.log(err);
            })
            client.query(sql,params,(err,data)=>{
                if(err){
                    console.log(err);
                    delete result.error.errorMessage;
                    result.error.DB = true;
                    result.state = false;
                    result.error.errorMessage = "DB에러가 발생했습니다.";
                    res.send(result);
                }else{
                    const postAuthor = data.rows[0].post_author;
                    if(postAuthor === userId || req.session.authority === 'admin'){
                        //sql준비
                        const sql2 = 'UPDATE backend.post SET post_title=$1,post_contents=$2 WHERE post_idx=$3';
                        const params = [titleValue,contentsValue,postIdx];
                        
                        //DB연결
                        client.query(sql2,params,(err2)=>{
                            if(err2){
                                console.log(err2);
                                delete result.error.errorMessage;
                                result.error.DB = true;
                                result.state = false;
                                result.error.errorMessage = "DB에러가 발생했습니다.";
                            }else{
                                delete result.error;
                            }
                            res.send(result);
                        })
                    }else{
                        result.state = false;
                        result.error.DB = false;
                        result.error.auth = false;
                        result.error.errorMessage = "접근권한이 없습니다.";
                        res.send(result);
                    }
                }
            })
        }catch{
            delete result.error.errorMessage;
            result.error.DB = true;
            result.error.errorMessage = "DB에러가 발생했습니다.";
            rse.send(result);
        }
    }else{
        res.send(result);
    }
})

//post삭제 api
router.delete('/:postIdx',loginAuth,(req,res)=>{
    //FE에서 받은 데이터
    const postIdx = req.params.postIdx;
    const userId = req.session.userId;

    //FE로 보내줄 데이터
    const result = {
        state : true,
        error : {
            DB : false,
            auth : true,
            errorMessage : []
        }
    }

    try{
        //sql준비
        const sql = `SELECT post_author FROM backend.post WHERE post_idx=$1`;
        const params = [postIdx];

        //DB연결
        const client = new Client(pgConfig);
        client.connect((err)=>{
            if(err) console.log(err);
        })
        client.query(sql,params,(err,data)=>{
            if(err){
                console.log(err);
                delete result.error.errorMessage;
                result.error.DB = true;
                result.state = false;
                result.error.errorMessage = "DB에러가 발생했습니다.";
                res.send(result);
            }else{
                const postAuthor = data.rows[0].post_author;
                console.log(postAuthor,userId);
                if(postAuthor === userId || req.session.authority === 'admin'){
                    //sql준비
                    const sql2 = 'DELETE FROM backend.post WHERE post_idx=$1';
                    const params = [postIdx];
                    //DB연결
                    client.query(sql2,params,(err2)=>{
                        if(err2){
                            console.log(err2);
                            delete result.error.errorMessage;
                            result.state = false;
                            result.error.DB = true;
                            result.error.auth = true;
                            result.error.errorMessage = "DB에러가 발생했습니다.";
                        }else{
                            console.log('삭제됨');
                            delete result.error;
                        }
                        res.send(result);
                    })
                }else{
                    result.state = false;
                    result.error.DB = false;
                    result.error.auth = false;
                    result.error.errorMessage = "접근권한이 없습니다.";
                    res.send(result);
                }
            }
        })
    }catch{
        delete result.error.errorMessage;
        result.error.DB = true;
        result.error.errorMessage = "DB에러가 발생했습니다.";
        rse.send(result);
    }
})

module.exports = router;