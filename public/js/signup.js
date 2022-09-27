const clickSignupBtnEvent = async ()=>{
    //get all input value
    const idValue = document.getElementById('id_input').value;
    const pwValue = document.getElementById('pw_input').value;
    const pwCheckValue = document.getElementById('pw_check_input').value;
    const nameValue = document.getElementById('name_input').value;
    const nicknameValue = document.getElementById('nickname_input').value;

    //delete all error-message div  
    const errorMessageDivArray = document.querySelectorAll('.error-message');
    errorMessageDivArray.forEach((div)=>{
        div.remove();
    })


    const result = await fetch('/account',{
        "method" : "POST",
        "headers" : {
            "Content-Type" : "application/json"
        },
        "body" : JSON.stringify({
            "id" : idValue,
            "pw" : pwValue,
            "pwCheck" : pwCheckValue,
            "name" : nameValue,
            "nickname" : nicknameValue,
        })
    })
    const error = await result.json();
    
    console.log(error);
    if(error.db.state){ //데이터베이스 에러 발생시
        location.href = "/error";
    }else if(error.state){ //로그인 에러 발생시 
        error.errorArray.map((data)=>{
            const div = document.createElement('div');
            div.classList.add('error-message');
            div.innerText = data.message;

            document.querySelector(`.${data.class}`).append(div);
        })
    }else{ //잘 성공하면
        location.href = "/session/new";
    }
}