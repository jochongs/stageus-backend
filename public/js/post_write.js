const clickWriteBtnEvent = async ()=>{
    const titleValue = document.getElementById('title').value;
    const contentsValue = document.getElementById('contents').value;

    const response = await fetch('/post',{
        "method" : "POST",
        "headers" : {
            "Content-Type" : "application/json"
        },
        "body" : JSON.stringify({
            "title" : titleValue,
            "contents" : contentsValue,
        })
    })
    const result = await response.json();
    
    console.log(result);

    if(result.state){ //성공시 
        location.reload();
    }else{
        if(result.DB){
            console.log(result.error.errorMessage);
            location.href = '/page/error';
        }else if(!result.error.auth){ //권한이 없을 시
            location.href = '/page/login';
        }else{ //입력 내용 예외상황 발생시
            alert(result.error.errorMessage[0].message);
        }
    }
}