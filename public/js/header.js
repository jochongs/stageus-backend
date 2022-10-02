//로그아웃 버튼 클릭 이벤트
const clickLogoutBtnEvent = async ()=>{
    const request = await fetch(`/session`,{
        "method" : "DELETE",
        "headers" : {
            "Content-Type" : "application/json"
        },
    })
    const result = await request.json();

    if(result.state){
        alert('로그아웃 되었습니다.');
        location.reload();
    }else{
        alert('이미 로그아웃 되어있습니다.');
    }
}