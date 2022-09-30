const router = require('express').Router();
const testRegExp = require('../function/reg_exp/reg_exp');
const path = require('path');
const { Client } = require('pg');

// // /account/all
// const temp = 
// {
//     state : false,
//     error : {
//         DB : false,
//         auth : true,
//         errorMessage : [
//             {
//                 class : string,
//                 message : string
//             }
//         ]
//     }
// }

// {
//     contents
// }


// DB연결 =====================================================================================
const pgConfig = {
    user : "ubuntu",
    password : "1234",
    host : "localhost",
    database : "stageus",
    post : 5432,
}


// api ==========================================================================================
//회원정보 시도 api (회원가입 api)
router.post('/', (req,res)=>{
    //get input data
    const idValue = req.body.id;
    const pwValue = req.body.pw;
    const pwCheckValue = req.body.pwCheck;
    const nameValue = req.body.name;
    const nicknameValue = req.body.nickname;
    
    //temp data
    const signupRegExp = {
        id : /^[a-z]+[a-z0-9]{5,13}$/g, //영문자로 시작하는 영문자 또는 숫자 6~12자
        pw : /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,12}$/, //8~12자 영문, 숫자 조합
        name : /^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,6}$/, //한글 또는 숫자 2~6글자
        nickname : /^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,12}$/ //한글 또는 숫자 2~12글자
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
    const error = {
        state : false,
        errorArray : [],
        db : {
            state : false
        }
    };

    //exception
    if(!signupRegExp.id.test(idValue)){ //id RegExp error 
        const tempObj = {
            class : "id_input_container",
            message : errorMessage.id.regError,
        }
        error.state = true; 
        error.errorArray.push(tempObj);
    }
    if(!signupRegExp.pw.test(pwValue)){ //pw RegExp error
        const tempObj = {
            class : "pw_input_container",
            message : errorMessage.pw.regError,
        }
        error.state = true; 
        error.errorArray.push(tempObj);
    }
    if(pwCheckValue !== pwValue){ //if pwCheckValue is different from pw
        const tempObj = {
            class : "pw_check_input_container",
            message : errorMessage.pwCheck.difPwError,
        }
        error.state = true;
        error.errorArray.push(tempObj);
    }
    if(!signupRegExp.name.test(nameValue)){ //name RegExp error
        const tempObj = {
            class : "name_input_container",
            message : errorMessage.name.regError,
        }
        error.state = true; 
        error.errorArray.push(tempObj);
    }
    if(!signupRegExp.nickname.test(nicknameValue)){ //nickname RegExp error
        const tempObj = {
            class : "nickname_input_container",
            message : errorMessage.nickname.regError,
        }
        error.state = true; 
        error.errorArray.push(tempObj);
    }
    
    if(!error.state){ //에러가 없을 경우 실행
        const sql = `INSERT INTO account VALUES (?,?,?,?,?)`;

        DB.query(sql,[idValue,pwValue,null,nameValue,nicknameValue],(err,results,fields)=>{
            if(err){

                //믿어도 되는가 ? 안되면 db 아이디를 뽑아서 있는 지 확인후 insert query 실행
                if(err.code === 'ER_DUP_ENTRY'){
                    const tempObj = {
                        class : "id_input_container",
                        message : "이미 있는 아이디입니다."
                    }
                    error.errorArray.push(tempObj);
                    error.state = true;
                }else{
                    error.db.state = true;
                }
            }
            res.send(error);
        });
    }else{
        res.send(error);
    }
})

//시험용 
router.post('/login', async (req,res)=>{
    const client = new Client(pgConfig);
    console.log('/account/login api 호출');
    const result = {
        error : false,
        loginState : false,
    }


    client.connect((err)=>{
        if(err){
            console.log(err);
            return;
        }
    });

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



