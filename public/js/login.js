const mainPageEvent = ()=>{
    location.href = '/';
}

const loginEvent = async ()=>{
    const idValue = document.querySelector('#id_input').value;
    const pwValue = document.querySelector('#pw_input').value;
    
    const result = await fetch('/account',{
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
}