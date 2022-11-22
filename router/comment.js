const router = require('express').Router();
const {Client} = require('pg');
const pgConfig = require('../config/pg_config');
const loginAuthCheck = require('../module/login_auth_check');


//댓글의 db데이터를 가져오는 api
router.get('/', async (req, res) => {
    //FE로 받을 데이터
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

    try{
        //DB connect
        const client = new Client(pgConfig);
        await client.connect();

        //SELECT comment data
        const sql = `SELECT comment_idx,post_idx,comment_contents,comment_date,nickname,comment_author FROM backend.comment JOIN backend.account ON comment_author=id WHERE post_idx = $1 ORDER BY comment_idx DESC`;
        const selectData = await client.query(sql,[postIdx]);

        //send result
        result.data = selectData.rows;
        delete result.error;
        res.send(result);
    }catch(err){
        console.log(err);

        //send result
        result.state = false;
        result.error.DB = true;
        result.error.errorMessage = "DB 에러가 발생했습니다.";
        delete result.data;
        res.send(result);
    }
});

//comment에 데이터 삽입 api
router.post('/', loginAuthCheck, async (req, res) => {
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

    //check data exception
    if(contents.length === 0){
        //send result
        result.state = false;
        result.error.errorMessage = [{
            class : "contents",
            message : "내용을 입력해야합니다."
        }]
        res.send(result);
    }else{ 
        try{
            //DB connect
            const client = new Client(pgConfig);
            await client.connect();

            //INSERT comment data
            const sql = `INSERT INTO backend.comment (comment_author,comment_contents,post_idx) VALUES ($1,$2,$3)`;
            const params = [req.session.userId, contents, postIdx];
            await client.query(sql, params);

            //send result
            delete result.error;
            res.send(result);
        }catch(err){
            console.log(err);
            
            //send result
            result.state = false;
            result.error.DB = true;
            result.error.errorMessage = "DB에러가 발생헀습니다.";
            res.send(result);
        }
    }
})

//comment 수정 api
router.put('/:commentIdx', loginAuthCheck, async (req, res) => {
    //FE에서 받아온 데이터
    const commentIdx = req.params.commentIdx;
    const userId = req.session.userId;
    const contents = req.body.contents;

    //FE에 줄 데이터
    const result = {
        state : true,
        error : {
            DB : false,
            auth : true,
            errorMessage : ""
        }
    }

    //check data exception
    if(contents.length === 0){
        //send result
        result.state = false;
        delete result.error.errorMessage;
        result.error.errorMessage = [];
        result.error.errorMessage.push({
            class : "contents",
            message : "내용을 입력해야합니다."
        })
        res.send(result);
    }else{
        try{
            //DB connect
            const client = new Client(pgConfig);
            await client.connect();

            //SELECT comment author
            const sql = `SELECT comment_author FROM backend.comment WHERE comment_idx=$1`;
            const selectData = await client.query(sql, [commentIdx]);

            if(userId === selectData.rows[0].comment_author || req.session.authority === 'admin'){
                //UPDATE comment data
                const sql2 = `UPDATE backend.comment SET comment_contents=$1 WHERE comment_idx = $2`;
                const params = [contents, commentIdx];
                await client.query(sql2, params);

                //send result ( scuccess )
                delete result.error;
                res.send(result);
            }else{
                //send result ( no auth )
                result.state = false;
                result.error.auth = false;
                result.error.errorMessage = "접근 권한이 없습니다.";
                res.send(result);
            }
        }catch(err){
            console.log(err);

            //send result ( server error )
            result.state = false;
            result.error.DB = true;
            result.error.errorMessage = "DB에러가 발생했습니다.";
            res.send(result);
        }
    }
})


//comment 삭제 api
router.delete('/:commentIdx', loginAuthCheck, async (req, res) => {
    //FE로부터 받은 데이터
    const commentIdx = req.params.commentIdx;
    const userId = req.session.userId;

    //FE로 보내줄 데이터
    const result = {
        state : true,
        error : {
            DB : false,
            auth : true,
            errorMessage : ""
        }
    }

    try{
        //DB connect
        const client = new Client(pgConfig);
        await client.connect();

        //SELECT comment
        const sql = `SELECT comment_author FROM backend.comment WHERE comment_idx=$1`;
        const selectData = await client.query(sql, [commentIdx]);
        
        //auth check
        if(userId === selectData.rows[0].comment_author || req.session.authority === 'admin'){
            //DELETE comment data
            const sql2 = 'DELETE FROM backend.comment WHERE comment_idx=$1';
            client.query(sql2, [commentIdx]);

            //send result ( success )
            delete result.error;
            res.send(result);
        }else{
            //send result ( no auth )
            result.state = false;
            result.error.errorMessage = "DB에러가 발생했습니다.";
            res.send(result);
        }
    }catch(err){
        console.log(err);
        
        //send result( server error )
        result.state = false;
        result.error.DB = true;
        result.error.errorMessage = "DB에러가 발생했습니다.";
        res.send(result);
    }
})

module.exports = router;