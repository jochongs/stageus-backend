const loginEvent = async ()=>{
    const idValue = document.querySelector('#id_input').value;
    const pwValue = document.querySelector('#pw_input').value;
    const errorDiv = document.querySelector('.error_message_div');
    
    //에러 메시지 초기화
    errorDiv.innerHTML = "";
    try{
        const result = await fetch('/account/login',{
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
        if(response.state){
            location.href = "/";
        }else{
            errorDiv.innerHTML = response.message;
        }
    }
    catch{
        location.href = "/error";
    }
}