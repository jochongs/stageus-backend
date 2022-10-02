const router = require('express').Router();
const testRegExp = require('../module/reg_exp');
const path = require('path');
const { Client } = require('pg');
const pgConfig = require('../module/pg_config');

//api ===============================================================================
//회원정보 시도 api (회원가입 api)
router.post('/', (req,res)=>{
    //get input data
    const idValue = req.body.id;
    const pwValue = req.body.pw;
    const pwCheckValue = req.body.pwCheck;
    const nameValue = req.body.name;
    const nicknameValue = req.body.nickname;

    console.log(pgConfig);

    const result = {
        state : true,
        error : {
            DB :false,
            errorMessage : []
        }
    }

    const errorMessage = {
        id : {
            regError : "아이디는 영문자로 시작하는 영문자 또는 숫자 6~12자이어야 합니다."
        },
        pw : {
            regError : "비밀번호는 8~12자의 영문과 숫자의 조합이여야 합니다. "
        },
        pwCheck : {
            difPwError : "비밀번호와 다릅니다."
        },
        name : {
            regError : "이름은 2~6글자의 한글 또는 영문자이어야 합니다."
        },
        nickname : {
            regError : "닉네임은 2~12글자의 한글 또는 영문자이어야 합니다."
        }
    }

    //exception
    if(!testRegExp(idValue,'id')){ //id RegExp error 
        const tempObj = {
            class : "id",
            message : errorMessage.id.regError,
        }
        result.state = false; 
        result.error.errorMessage.push(tempObj);
    }
    if(!testRegExp(pwValue,'pw')){ //pw RegExp error
        const tempObj = {
            class : "pw",
            message : errorMessage.pw.regError,
        }
        result.state = false;
        result.error.errorMessage.push(tempObj);
    }
    if(pwCheckValue !== pwValue){ //if pwCheckValue is different from pw
        const tempObj = {
            class : "pw_check",
            message : errorMessage.pwCheck.difPwError,
        }
        result.state = false;
        result.error.errorMessage.push(tempObj);
    }
    if(!testRegExp(nameValue,'name')){ //name RegExp error
        const tempObj = {
            class : "name",
            message : errorMessage.name.regError,
        }
        result.state = false;
        result.error.errorMessage.push(tempObj);
    }
    if(!testRegExp(nicknameValue,'nickname')){ //nickname RegExp error
        const tempObj = {
            class : "nickname",
            message : errorMessage.nickname.regError,
        }
        result.state = false;
        result.error.errorMessage.push(tempObj);
    }
    
    if(result.state){ //예외 상황이 발생하지 않을 시
        const client = new Client(pgConfig);
        client.connect((err)=>{
            if(err){
                console.log(err);
            }
        });
        const sql = `INSERT INTO backend.account VALUES ($1,$2,$3,$4)`;
        try{
            client.query(sql,[idValue,pwValue,nameValue,nicknameValue],(err,results)=>{
                if(err){
                    console.log(err.code);
                    if(err.code === '23505'){
                        result.state = false;
                        const tempObj = {
                            class : "id",
                            message : "이미 있는 아이디입니다."
                        }
                        result.error.errorMessage.push(tempObj);
                    }else{
                        result.state = false;
                        result.error.DB = true;
                        result.error.errorMessage = "DB에러가 발생했습니다.";
                    }
                }
                res.send(result);
            });
        }catch{ //혹시 몰라서
            result.state = false; 
            result.error.DB = true;
            result.error.DB = "DB에러가 발생했습니다.";
            res.send(result);
        }
    }else{ //예외 상황 발생 시
        res.send(result);
    }
})

//시험용 안씀
router.post('/login', async (req,res)=>{
    const client = new Client(pgConfig);
    client.connect((err)=>{
        if(err){
            console.log(err);
            return;
        }
    });
    console.log('/account/login api 호출');
    const result = {
        error : false,
        loginState : false,
    }

    const idValue = req.body.id;
    const pwValue =req.body.pw;
    
    const sql = "SELECT * FROM backend.account WHERE id=$1 AND pw=$2";
    const values = [idValue,pwValue];
    client.query(sql,values,(err,data)=>{
        if(err){
            console.log(err);
            res.send(result);
            return;
        }else{
            const row = data.rows;
            console.log(row);
            if(row.length != 0){
                result.loginState = true;
            }
            res.send(result);
        }
    })
})

module.exports = router;