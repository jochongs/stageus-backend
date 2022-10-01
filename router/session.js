const router = require('express').Router();
const testRegExp = require('../module/reg_exp');
const mysql = require('mysql');
const pgConfig = require('../module/pg_config');
const { Client } = require('pg');

//DB 설정 =========================================================================================================================================================
const DB_SET = {
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE,
}
const DB = mysql.createConnection(DB_SET);


//로그아웃 api
router.delete('/',(req,res)=>{
    const result = {
        state : true,
    }
    if(req.session.userId !== undefined){ //로그인이 되어있는 경우
        req.session.userId = undefined;
    }else{
        result.error = {
            auth : false,
            errorMessage : "이미 로그아웃이 되어있습니다."
        }
    }
    res.send(result);
})
 
//로그인 시도 api
router.post('/',(req,res)=>{
    //FE로부터 받아오는 값
    const idValue = req.body.id;
    const pwValue = req.body.pw;

    //FE로 보낼 값
    const result = {
        state : false
    }

    //DB연결
    const client = new Client(pgConfig);

    client.connect((err)=>{
        if(err){
            console.log(err);
        }
    })

    const sql = `SELECT id FROM backend.account WHERE id=$1 AND pw=$2`;
    try{
        client.query(sql,[idValue,pwValue],(err,data)=>{
            if(err){
                console.log(err);
                result.error = {
                    DB : true,
                    errorMessage : "DB 에러가 발생했습니다."
                }
            }else{
                if(data.rows.length === 0){ //아이디 비밀번호가 잘못됨
                    result.error = {
                        DB : false,
                        auth : false,
                        errorMessage : "아이디 또는 비밀번호가 잘못되었습니다."
                    } 
                }else{ //모두 성공
                    result.state = true;
                    req.session.userId = idValue;
                }
            }
            res.send(result);
        });
    }catch{
        res.send({
            state : false,
            error : {
                DB : true,
                errorMesage : "DB 에러가 발생했습니다."
            }
        })
    }
})


module.exports = router;