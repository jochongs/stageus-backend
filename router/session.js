const router = require('express').Router();
const pgConfig = require('../config/pg_config');
const { Client } = require('pg');
const logging = require('../module/logging');

//로그인된 사용자의 아이디
router.get('/', (req, res) => {
    if(req.session.userId === undefined){
        res.send({state : false});
    }else{
        if(req.session.authority === 'admin'){
            res.send({
                state : true,
                id : req.session.userId,
                authority : 'admin'
            })
        }else{
            res.send({
                state : true,
                id : req.session.userId
            })   
        }
    }
})

//로그인 시도 api
router.post('/', async (req, res) => {
    //FE로부터 받아오는 값
    const idValue = req.body.id;
    const pwValue = req.body.pw;

    //FE로 보낼 값
    const result = {
        state : false,
        auth : true
    }

    //check logout auth
    if(req.session.userId !== undefined){
        //send result ( no auth )
        result.state = false;
        result.auth = false;
        result.error = {
            DB : false,
            errorMessage : "이미 로그인 되었습니다."
        }
        res.send(result);

        return 0;
    }

    try{
        //DB connect
        const client = new Client(pgConfig);
        await client.connect();

        //SELECT user dat a
        const sql = `SELECT id,authority FROM backend.account WHERE id=$1 AND pw=$2`;
        const selectData = await client.query(sql, [idValue, pwValue]);

        //check id, pw
        if(selectData.rows.length === 0){
            //send result ( no auth )
            result.error = {
                DB : false,
                auth : false,
                errorMessage : "아이디 또는 비밀번호가 잘못되었습니다."
            }
            res.send(result);
        }else{
            //중복로그인시 기존 로그인 해제
            req.sessionStore.all((err, sessions) => {
                let sessionSid = "";
                //search all session
                console.log(sessions);
                sessions.forEach((session)=>{
                    if(session.userId === idValue){
                        sessionSid = session.id;
                    }
                })

                //duplication id
                if(sessionSid.length !== 0){
                    //promise로 변경
                    req.sessionStore.destroy(sessionSid, (err) => {
                        if(err){
                            console.log(err);
                            throw "error";
                        }
                        //assign user data to session
                        req.session.userId = idValue;
                        if(selectData.rows[0].authority === 'admin'){
                            req.session.authority = 'admin';
                        }

                        //send result ( success )
                        result.state = true;
                        res.send(result);
                    });
                }else{
                    //assign user data to session
                    req.session.userId = idValue;
                    if(selectData.rows[0].authority === 'admin'){
                        req.session.authority = 'admin';
                    }

                    //send result ( success )
                    result.state = true;
                    res.send(result);
                }
            });
        }
    }catch(err){
        console.log(err);

        //send result ( server error )
        result.error = {
            DB : true,
            errorMessage : "DB 에러가 발생했습니다."
        }
        res.send(result);
    }
    
    
})

//로그아웃 api
router.delete('/', (req, res) => {
    //FE로 보낼 데이터
    const result = {
        state : false
    }

    //check login state
    if(req.session?.userId !== undefined){
        // delete req.session.userId;
        // delete req.session.authority;
        result.state = true;
        result.auth = false;
    }else{
        result.state = false;
        result.error = {
            errorMessage : "이미 로그아웃이 되어있습니다."
        }
    }
    
    //send result

    res.send(result);

    //destroy session
    req.session.destroy(req.sessionID, (err)=>{
        console.log(err);
    });
})


module.exports = router;