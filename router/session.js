const router = require('express').Router();
const testRegExp = require('../function/reg_exp/reg_exp');
const mysql = require('mysql');
const path = require('path');

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
router.delete('/session',(req,res)=>{
    try{
        console.log(`${req.session.userId} 회원이 로그아웃을 시도 `);
        req.session.userId = undefined;
        res.send({error:false});
    }catch{
        res.send({error : true});
    }
})

//로그인 시도 api
router.post('/session',(req,res)=>{
    //FE로부터 받아오는 값
    const idValue = req.body.id;
    const pwValue = req.body.pw;

    //FE로 보내줄 값
    const error = {
        state : false,
        message : "",
        db : {
            state : false,
        }
    }

    //예외처리
    if(!testRegExp(idValue) || !testRegExp(pwValue,"pw")){ //아이디가 정규표현식에 맞지 않을경우 db에 굳이 접근하지 않음
        error.message = "아이디가 잘못되었습니다.1";
        res.send(error);
    }else{
        const sql = `SELECT * FROM account WHERE id=?`;
        DB.query(sql,[idValue],(err,results,fields)=>{
            if(err){
                error.state  = true;
            }else{
                if(pwValue.length !== 0 && pwValue !== undefined && pwValue === results[0]?.pw){
                    error.state = true;
                    req.session.userId = idValue;
                }else{
                    error.message = '아이디또는 비밀번호가 잘못되었습니다.';
                }
            }
            res.send(error);
        });
    }
})


module.exports = router;