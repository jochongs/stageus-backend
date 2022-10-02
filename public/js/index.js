window.onload = ()=>{
    getPostData();
    checkLoginState();
}

//로그인 상태와 사용자의 아이디를 가져오는 함수
const checkLoginState = async ()=>{
    const response = await fetch('/session');
    const result = await response.json();
    
    if(result.state){ //로그인을 한 경우
        //로그인 버튼 생성
        document.querySelector('.nav_login_btn').classList.add('hidden');

        //로그아웃 버튼 제거
        document.querySelector('.nav_logout_btn').classList.remove('hidden');

        //유저 정보 보기 버튼 생성
        const userInfoBtn = document.querySelector('.user_info_btn');
        userInfoBtn.classList.remove('hidden');
        const img = userInfoBtn.querySelector('img');
        img.classList.remove('hidden');
        userInfoBtn.innerText = result.id;
        userInfoBtn.append(img);

        //글쓰기 section생성
        document.querySelector('.write_post_section').classList.remove('hidden');
    }else{ //로그인이 되지 않았을 경우
        //로그인 버튼 생성
        document.querySelector('.nav_login_btn').classList.remove('hidden');

        //로그아웃 버튼 제거
        document.querySelector('.nav_logout_btn').classList.add('hidden');

        //유저 정보 보기 버튼 제거
        const userInfoBtn = document.querySelector('.user_info_btn');
        userInfoBtn.classList.add('hidden');

        //글 쓰기 section 제거
        document.querySelector('.write_post_section').classList.add('hidden');
    }
}

//포스트데이터를 가져오는 함수
const getPostData = async ()=>{
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
    console.log(postItemArray);
    postItemArray.forEach((postItem,index)=>{
        const postIdx = postItem.post_idx;
        const postTitle = postItem.post_title;
        const postAuthor = postItem.nickname; //닉네임을 표시하는 것으로 설정
        const postDate = new Date(postItem.post_date);

        const idxContainer = document.createElement('div');
        idxContainer.innerText = postIdx;
        idxContainer.classList.add('post_item_idx_container');

        const titleContainer = document.createElement('div');
        titleContainer.classList.add('post_item_title_container');
        titleContainer.innerText = postTitle;

        const authorContainer = document.createElement('div');
        authorContainer.classList.add('post_item_author_container');
        authorContainer.innerText = postAuthor;

        const dateContainer = document.createElement('div');
        dateContainer.classList.add('post_item_date_container');
        dateContainer.innerText = `${postDate.getFullYear()}-${postDate.getMonth()+1}-${postDate.getDate()}`;

        const postItemDiv = document.createElement('div');
        postItemDiv.classList.add('post_item');
        postItemDiv.dataset.postIdx = postIdx;
        postItemDiv.append(idxContainer);
        postItemDiv.append(titleContainer);
        postItemDiv.append(authorContainer);
        postItemDiv.append(dateContainer);
        postItemDiv.addEventListener('click',()=>{
            location.href = `/page/post/${postIdx}`;
        })

        document.querySelector('.post_container').append(postItemDiv);
    })
}

