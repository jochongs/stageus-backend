const router = require('express').Router();
const pgConfig = require('../config/pg_config');
const { Client } = require('pg');
const redis = require('redis').createClient();

//로그인된 사용자의 아이디
router.get('/', (req, res) => {
    if(req.session.userId === undefined){
        res.send({state : false});
    }else{
        res.send({
            state : true,
            id : req.session.userId,
            name : req.session.userName,
            nickname : req.session.userNickname,
            authority : req.session.authority
        })
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

        //SELECT user data
        const sql = `SELECT id, authority, name, nickname FROM backend.account WHERE id=$1 AND pw=$2`;
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
            //prepare data
            const userId = selectData.rows[0].id;
            const userName = selectData.rows[0].name;
            const userNickname = selectData.rows[0].nickname;
            const userAuthority = selectData.rows[0].authority;

            //redis connect
            await redis.connect();

            //get sessionSid width userId
            const sessionSid = await redis.get(userId);
            
            //check duplication login
            if(sessionSid !== null){
                req.sessionStore.destroy(sessionSid, async (err) => {
                    if(err){
                        console.log(err);
                        throw err;
                    }

                    //add new login session
                    await redis.del(userId);
                    await redis.set(userId, req.sessionID);
                    await redis.expire(userId, 10);
                    await redis.disconnect();

                    //assign user data to session
                    req.session.userId = userId;
                    req.session.userName = userName;
                    req.session.userNickname = userNickname;
                    req.session.authority =  userAuthority;

                    //send result ( success )
                    result.state = true;
                    res.send(result);
                });
            }else{
                //add login session
                await redis.set(userId, req.sessionID);
                await redis.expire(userId, 60 * 60);
                await redis.disconnect();

                //assign user data to session
                req.session.userId = userId;
                req.session.userName = userName;
                req.session.userNickname = userNickname;
                req.session.authority =  userAuthority;

                //send result ( success )
                result.state = true;
                res.send(result);
            }
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
router.delete('/', async (req, res) => {
    //FE로 보낼 데이터
    const result = {
        state : false
    }

    //check login state
    if(req.session?.userId !== undefined){
        result.state = true;
        result.auth = false;

        //delete login state on redis
        await redis.connect();
        await redis.del(req.session.userId);
        await redis.disconnect();
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
