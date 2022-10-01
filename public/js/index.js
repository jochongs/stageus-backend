window.onload = async ()=>{
    try{
        const result = await fetch('/post');
        const results = await result.json();
        
        if(results.error){ //데이터베이스 에러 발생시
            location.href = "/error";
        }else{ //잘 성공하면
            addPostItem(results);
            console.log(results);
        }
    }
    catch{
        //location.href = '/error';
    }
}

//게시글을 뿌려주는 함수
const addPostItem = (postItemArray=[])=>{
    postItemArray.forEach((postItem,index)=>{
        const postIdx = postItem.post_idx;
        const postTitle = postItem.post_title;
        const postAuthor = postItem.nickname; //닉네임을 표시하는 것으로 설정
        const postDate = new Date(postItem.post_date);


        const titleContainer = document.createElement('div');
        titleContainer.classList.add('post_item_title_container');
        titleContainer.innerText = postTitle;

        const authorContainer = document.createElement('div');
        authorContainer.classList.add('post_item_author_container');
        authorContainer.innerText = postAuthor;

        const dateContainer = document.createElement('div');
        dateContainer.classList.add('post_item_date_container');
        dateContainer.innerText = `${postDate.getFullYear()}년 ${postDate.getMonth()+1}월 ${postDate.getDate()}`;

        const postItemDiv = document.createElement('div');
        postItemDiv.classList.add('post_item');
        postItemDiv.dataset.postIdx = postIdx;
        postItemDiv.append(titleContainer);
        postItemDiv.append(authorContainer);
        postItemDiv.append(dateContainer);
        postItemDiv.addEventListener('click',()=>{
            location.href = `/post/detail/${postIdx}`;
        })

        document.querySelector('.post_container').append(postItemDiv);
    })
}

//로그아웃 버튼 클릭 이벤트
const clickLogoutBtnEvent = async ()=>{
    //이미 로그아웃 된 상태에서 눌렀을 때의 예외처리는 굳이 하지 않음
    try{
        const request = await fetch(`/session`,{
            "method" : "DELETE",
            "headers" : {
                "Content-Type" : "application/json"
            },
        })
        const result = await request.json();
        if(result.error){
            location.href = "/error";
        }else{
            alert('로그아웃 되었습니다.');
            location.reload();
        }
    }catch{
        location.href = '/error';
    }
}