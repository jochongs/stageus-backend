const router = require('express').Router();
const { Client } = require('pg');
const pgConfig = require('../module/pg_config');
const postAuthCheck = require('../module/post_auth_check')
const pgConfig = require('./module/pg_config');

//게시글 쓰기 api
router.post('/post',postAuthCheck,(req,res)=>{
    const {title : titleValue, contents : contentsValue} = req.body;
    const result = {
        state : true,
        error : {
            DB : false,
            auth : false,
            errorMessage : "",
        }
    }

    //body data의 입력 길이 검사
    if(titleValue.length === 0 || titleValue.length > 32){
        result.state = false;   
        result.error.errorMessage = "제목의 길이는 1~32자여야 합니다.";
    }
    if(contentsValue.length ===0){ //contents 길이 어디까지로 해야되는지 물어보기
        result.state = false;
        result.error.errorMessage = "글의 내용은 필수로 입력해야합니다.";
    }

    if(result.state){
        const sql = `INSERT INTO backend.post (post_title,post_contents,post_author) VALUES (?,?,?)`;
        const valueArray = [titleValue,contentsValue, req.session.userId];
        const client = new Client(pgConfig);
        client.connect((err)=>{
            if(err) console.log(err);
        });
        client.query(sql,valueArray,(err,data)=>{
            if(err){
                console.log(err);
                result.error.DB = true;
                result.error.errorMessage = "DB 연결에 실패했습니다.";
            }
            result.data = data.rows;
            res.send(result);
        })
    }else{
        res.send(result);
    }
});