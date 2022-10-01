const router = require('express').Router();
const { Client } = require('pg');
const pgConfig = require('../module/pg_config');
const postAuthCheck = require('../module/post_auth_check')

//게시글 쓰기 api
router.post('/',postAuthCheck,(req,res)=>{
    //FE로부터 값 받기
    const {title : titleValue, contents : contentsValue} = req.body;

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

    console.log(req.session.userId);
    if(result.state){ //Body Data들의 조건이 맞을 때
        const sql = `INSERT INTO backend.post (post_title,post_contents,post_author) VALUES ($1,$2,$3)`;
        const valueArray = [titleValue, contentsValue, req.session.userId];
        const client = new Client(pgConfig);
        client.connect((err)=>{
            if(err) console.log(err);
        });
        client.query(sql,valueArray,(err)=>{
            if(err){
                console.log(err);
                result.state = false;
                result.error.DB = true;
                result.error.errorMessage = "DB 연결에 실패했습니다.";
            }else{
                delete result.error;
            }
            res.send(result);
        })
    }else{
        res.send(result);
    }
});

//모든 게시글 데이터를 가져오는 api
router.get('/',(req,res)=>{
    const sql = `SELECT nickname,post_author,post_title,post_contents,post_idx,post_date,post_title FROM post JOIN account ON id=post_author`;
    const result ={
        error : false,
        data : []
    }
    // DB.query(sql,(err,results)=>{
    //     if(err){
    //         result.error = true;
    //     }else{
    //         result.data = results;
    //     }
    //     res.send(results);
    // })
})

//특정 게시글의 db데이터 가져오는 api
router.get('/:postIdx',(req,res)=>{
    const postIdx = req.params.postIdx;
    const sql = `SELECT * FROM post JOIN account ON post_author=id WHERE post_idx=?`;
    // DB.query(sql,[postIdx],(err,results)=>{
    //     if(err){
    //         console.log(err);
    //         res.send(err);
    //     }else{
    //         res.send(results);  
    //     }
    // })
})

module.exports = router;