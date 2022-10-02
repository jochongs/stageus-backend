const router = require('express').Router();
const { Client } = require('pg');
const pgConfig = require('../module/pg_config');
const postAuthCheck = require('../module/post_auth_check')


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
        sql = `SELECT post_idx,post_title,post_contents,post_date,nickname FROM backend.post JOIN backend.account ON id=post_author`;
    }else{
        sql = `SELECT post_idx,post_title,post_contents,post_date,nickname FROM backend.post JOIN backend.account ON id=post_author WHERE post_idx=$1`;
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

//post 수정 api
router.put('/:postIdx',postAuthCheck,(req,res)=>{
    //FE에서 받아온 데이터
    const postIdx = req.params.postIdx;
    const titleValue = req.body.title;
    const contentsValue = req.body.contents;
    const userId = req.session.userId;

    console.log(postIdx);
    console.log(titleValue);
    console.log(contentsValue);
    console.log(userId);

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

            console.log('hi');
            //DB연결
            const client = new Client(pgConfig);
            client.connect((err)=>{
                if(err) console.log(err);
            })
            client.query(sql,params,(err,data)=>{
                if(err){
                    console.log(err);
                    result.error.DB = true;
                    delete result.error.errorMessage;
                    result.error.errorMessage = "DB에러가 발생했습니다.";
                    res.send(result);
                }else{
                    const postAuthor = data.rows[0].post_author;
                    if(postAuthor === userId){
                        //sql준비
                        const sql2 = 'UPDATE backend.post SET post_title=$1,post_contents=$2 WHERE post_idx=$3';
                        const params = [titleValue,contentsValue,postIdx];
                        
                        //DB연결
                        client.query(sql2,params,(err2)=>{
                            if(err2){
                                console.log(err);
                                delete result.error.errorMessage;
                                result.error.DB = true;
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
router.delete('/:postIdx',postAuthCheck,(req,res)=>{
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

module.exports = router;