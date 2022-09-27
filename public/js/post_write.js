const clickWriteBtnEvent = async ()=>{
    const titleValue = document.getElementById('title').value;
    const contentsValue = document.getElementById('contents').value;

    const errorMessageDiv = document.querySelector('.error_container');
    errorMessageDiv.innerText = "";
    try{
        const result = await fetch('/post',{
            "method" : "POST",
            "headers" : {
                "Content-Type" : "application/json"
            },
            "body" : JSON.stringify({
                "title" : titleValue,
                "contents" : contentsValue,
            })
        })
        const error = await result.json();
        
        if(error.db.state){ //데이터베이스 에러 발생시
            location.href = '/error';
        }else if(error.state){ //input 내용 예외처리
            errorMessageDiv.innerText = error.message;
        }else{
            location.href = '/';
        }
        
    }
    catch{
        location.href = '/error';
    }
}