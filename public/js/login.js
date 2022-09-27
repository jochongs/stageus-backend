const loginEvent = async ()=>{
    const idValue = document.querySelector('#id_input').value;
    const pwValue = document.querySelector('#pw_input').value;
    const errorDiv = document.querySelector('.error_message_div');
    
    //에러 메시지 초기화
    errorDiv.innerHTML = "";

    const result = await fetch('/session',{
        "method" : "POST",
        "headers" : {
            "Content-Type" : "application/json"
        },
        "body" : JSON.stringify({
            "id" : idValue,
            "pw" : pwValue,
        })
    })
    const response = await result.json();
    console.log(response);
    if(response.success){
        location.href = "/";
    }else{
        errorDiv.innerHTML = response.message;
    }
}

const moveMainPage = ()=>{
    location.href = '/';
}

const moveSignupPage = ()=>{
    location.href = '/account/new';
}

