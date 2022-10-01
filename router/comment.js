const router = require('express').Router();
const {Client} = require('pg');
const pgConfig = require('../module/pg_config');
const postAuthCheck = require('../module/post_auth_check');


//댓글의 db데이터를 가져오는 api
router.get('/',(req,res)=>{
    //FE로 받을 데이터 준비
    const postIdx = req.query.postIdx;

    //FE로 보내줄 데이터
    const result = {
        state : true,
        error : {
            DB : false,
            errorMessage : ""
        },
        data : []
    }

    //sql문 준비
    const sql = `SELECT comment_idx,post_idx,comment_contents,comment_date,nickname FROM backend.comment JOIN backend.account ON comment_author=id WHERE post_idx=$1`;

    //DB 준비 
    try{
        const client = new Client(pgConfig);
        client.connect((err)=>{
            if(err) console.log(err);
        })
        client.query(sql,[postIdx],(err,data)=>{
            if(err){
                console.log(err);
                result.state = false;
                result.error.DB = true;
                result.error.errorMessage = "DB 에러가 발생했습니다.";
                delete result.data;        
            }else{
                result.data = data.rows;
                delete result.error;
            }
            res.send(result);
        })
    }catch(err){
        result.state = false;
        result.error.DB = true;
        result.error.errorMessage = "DB 에러가 발생했습니다.";
        delete result.data;
        res.send(result);
    }
});

//comment에 데이터 삽입 api
router.post('/',postAuthCheck,(req,res)=>{
    //FE에서 받아온 값
    const author = req.session.userId;
    const postIdx = req.query.postIdx;
    const contents = req.body.contents;

    //FE에 보낼 값
    const result = {
        state : true,
        error : {
            DB : false,
            auth : true
        }
    }

    if(contents.length === 0){ //입력값 예외상황
        result.state = false;
        result.error.errorMessage = [{
            class : "contents",
            message : "내용을 입력해야합니다."
        }]
        res.send(result);
    }else{ 
        //sql준비
        const sql = `INSERT INTO backend.comment (comment_author,comment_contents,post_idx) VALUES ($1,$2,$3)`;
        const params = [req.session.userId, contents, postIdx];

        //DB연결
        try{
            const client = new Client(pgConfig);
            client.connect((err)=>{
                if(err) console.log(err);
            })
            client.query(sql,params,(err)=>{
                if(err){
                    result.state = false;
                    result.error.DB = true;
                    result.error.errorMessage = "DB에러가 발생헀습니다.";
                }else{
                    delete result.error;
                }
                res.send(result);
            })
        }catch{
            result.state = false;
            result.error.DB = true;
            result.error.errorMessage = "DB에러가 발생헀습니다.";
            res.send(result);
        }
    }
    // if(contents.length === 0){
    //     res.send({lengthError : true});
    // }else{
    //     const sql = `INSERT INTO comment (comment_author,comment_contents,post_idx) VALUES (?,?,?)`
    //     const params = [author,contents,postIdx];
    //     DB.query(sql,params,(err,results)=>{
    //         if(err){
    //             console.log(err);
    //         }else{
    //             res.send({error : false})
    //         }
    //     })
    // }
})

//comment 삭제 api
router.delete('/:commentIdx',postAuthCheck,(req,res)=>{
    const commentIdx = req.params.commentIdx;
    const userId = req.session.userId;

    const sql = `SELECT comment_author FROM comment WHERE comment_idx=?`;
    const params = [commentIdx];
    // DB.query(sql,params,(err,results)=>{
    //     if(err){
    //         console.log(err)
    //     }else{
    //         const commentAuthor = results[0].comment_author;
            
    //         console.log(userId,commentAuthor);
    //         if(commentAuthor === userId){
    //             const sql2 = `DELETE FROM comment WHERE comment_idx = ?`;
    //             const params2 = [commentIdx];
    //             DB.query(sql2,params2,(err2)=>{
    //                 if(err2){
    //                     console.log(err2);
    //                 }else{
    //                     res.send({error:false});
    //                 }
    //             })
    //         }else{
    //             res.send({error : true});
    //         }
    //     }
    // })
})

module.exports = router;