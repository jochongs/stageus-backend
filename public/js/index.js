window.onload = async ()=>{
    const response = await fetch('/post/all');
    const result = await response.json();

    if(result.state){ //성공하면
        addPostItem(result.data);
    }else if(result.error.DB){ //데이터베이스 에러 발생시
        location.href = "/error";
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
        dateContainer.innerText = `${postDate.getFullYear()}년 ${postDate.getMonth()+1}월 ${postDate.getDate()}일`;

        const postItemDiv = document.createElement('div');
        postItemDiv.classList.add('post_item');
        postItemDiv.dataset.postIdx = postIdx;
        postItemDiv.append(titleContainer);
        postItemDiv.append(authorContainer);
        postItemDiv.append(dateContainer);
        postItemDiv.addEventListener('click',()=>{
            location.href = `/page/post/${postIdx}`;
        })

        document.querySelector('.post_container').append(postItemDiv);
    })
}

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
    }else{
        alert('이미 로그아웃 되어있습니다.');
    }
}