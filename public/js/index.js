window.onload = async ()=>{
    try{
        const result = await fetch('/post');
        const results = await result.json();
        
        if(results.error){ //데이터베이스 에러 발생시
            location.href = "/error";
        }else{ //잘 성공하면
            console.log(results);
        }
    }
    catch{
        location.href = '/error';
    }
}