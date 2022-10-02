window.onload = ()=>{
    const postIdx = location.pathname.split('/')[location.pathname.split('/').length-1];
    requestPostData(postIdx);
    requestCommentData(postIdx);
}

const requestPostData = async (postIdx)=>{
    const response = await fetch(`/post/${postIdx}`);
    const result = await response.json();
    const data = result.data[0];
    
    const titleDiv = document.querySelector('.title_container');
    titleDiv.innerHTML = data.post_title;

    const contentsDiv = document.querySelector('.contents_container');
    contentsDiv.innerHTML = data.post_contents;

    const authorDiv = document.querySelector('.author_container');
    authorDiv.innerHTML = data.nickname;
}

const requestCommentData = async (postIdx)=>{
    const response = await fetch(`/comment?postIdx=${postIdx}`);
    const result = await response.json();

    if(result.state){
        const commentDataArray = result.data;

        commentDataArray.forEach((commentData,index)=>{
            const author = commentData.nickname;
            const date = new Date(commentData.comment_date);
            const contents = commentData.comment_contents;
            const commentIdx = commentData.comment_idx;

            const commentContentsDiv = document.createElement('div');
            commentContentsDiv.classList.add('comment_contents');
            commentContentsDiv.innerText = contents;

            const commentAuthorDiv = document.createElement('div');
            commentAuthorDiv.classList.add('comment_author');
            commentAuthorDiv.innerText = author;

            const commentDateDiv = document.createElement('div');
            commentDateDiv.classList.add('comment_date');
            commentDateDiv.innerText = `${date.getFullYear()}년 ${date.getMonth()+1}월 ${date.getDate()}일`;

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '삭제';
            deleteBtn.dataset.commentIdx = commentIdx;
            deleteBtn.addEventListener('click',clickDeleteCommentBtnEvent);

            const modifyBtn = document.createElement('button');
            modifyBtn.innerHTML = "수정";
            modifyBtn.dataset.commentIdx = commentIdx;
            modifyBtn.addEventListener('click',clickModifyCommentBtnEvent);

            const commentItem = document.createElement('div');
            commentItem.classList.add('comment_item');
            commentItem.append(commentContentsDiv);
            commentItem.append(commentAuthorDiv);
            commentItem.append(commentDateDiv);
            commentItem.append(deleteBtn);
            commentItem.append(modifyBtn);

            document.querySelector('.comment_container').append(commentItem);
        })
    }else{
        location.href = '/page/error';
    }
}

const clickCommentSubmitBtnEvent = async ()=>{
    const postIdx = location.pathname.split('/')[location.pathname.split('/').length-1];
    const comment = document.getElementById('comment').value;

    const response = await fetch(`/comment?postIdx=${postIdx}`,{
        "method" : "POST",
        "headers" : {
            "Content-Type" : "application/json"
        },
        "body" : JSON.stringify({
            contents : comment,
        })
    })
    const result = await response.json();

    if(result.state){//성공 시
        location.reload();
    }else{
        if(!result.error.auth){
            alert(result.error.errorMessage);
        }else if(result.error.DB){
            location.href = '/page/error';
        }else{
            alert('댓글 달 내용을 입력해야합니다.');
        }
    }
}

const clickDeleteCommentBtnEvent = async (e)=>{
    const commentIdx = e.target.dataset.commentIdx;
    console.log(commentIdx);

    const response = await fetch(`/comment/${commentIdx}`,{
        "method" : "DELETE",
        "headers" : {
            "Content-Type" : "application/json"
        }
    })
    const result = await response.json();

    if(result.state){//성공 시
        location.reload();
    }else{
        if(!result.error.auth){
            alert(result.error.errorMessage);
        }else if(result.error.DB){
            location.href = '/page/error';
        }
    }
}

const clickModifyCommentBtnEvent = (e)=>{
    const commentItem = e.target.parentElement;
    const commentContents = commentItem.querySelector('.comment_contents').innerText;

    const input = document.createElement('input');
    input.id = "comment_modify_input";
    input.classList.add('comment_modify_input');
    input.value = commentContents;

    const submitBtn = document.createElement('button');
    submitBtn.innerText = "수정완료";
    submitBtn.addEventListener('click', async ()=>{
        const commentIdx = e.target.dataset.commentIdx;
        const contents = input.value;

        const response = await  fetch(`/comment/${commentIdx}`,{
            "method" : "PUT",
            "headers" : {
                "Content-Type" : "application/json"
            },
            "body" : JSON.stringify({
                contents : contents,
            })
        })
        const result = await response.json();   
        
        if(result.state){
            location.reload();
        }else{
            if(result.error.DB){
                location.href = "/page/error";
            }else if(!result.error.auth){
                location.href = '/page/login';
            }else{
                alert(result.error.errorMessage[0].message);
            }
        }
    })
    
    
    commentItem.innerHTML = "";
    commentItem.appendChild(input);
    commentItem.append(submitBtn);
}

const clickDeletePostBtnEvent = async ()=>{
    const postIdx = location.pathname.split('/')[location.pathname.split('/').length-1];

    const result = await  fetch(`/post/${postIdx}`,{
        "method" : "DELETE",
        "headers" : {
            "Content-Type" : "application/json"
        },
    })

    const auth = await result.json();
    if(auth.error){
        alert('권한이 없습니다.');
    }else{
        location.href = "/";
    }
}

const clickModifyPostBtnEvent = (e)=>{
    const post_container = document.querySelector('.post_container');

    const titleInput = document.createElement('input');
    titleInput.id = 'modify_post_title_input';
    titleInput.classList = 'modify_post_title_input';
    titleInput.setAttribute('placeholder','제목을 입력해주세요');

    const titleContainer = post_container.querySelector('.title_container');
    titleContainer.innerHTML = "";
    titleContainer.append(titleInput);

    const contentsInput = document.createElement('textarea');
    contentsInput.classList.add('modify_post_contents_input');
    contentsInput.id= "modify_post_contents_input";

    const postModifySubmitBtn = document.createElement('button');
    postModifySubmitBtn.classList.add('post_modify_submit_btn');
    postModifySubmitBtn.innerHTML = "수정완료";
    postModifySubmitBtn.addEventListener('click',async (e)=>{
        const postIdx = location.pathname.split('/')[location.pathname.split('/').length-1];       
        const titleValue = titleInput.value;
        const contentsValue = contentsInput.value;
        
        const response = await fetch(`/post/${postIdx}`,{
            "method" : "PUT",
            "headers" : {
                "Content-Type" : "application/json"
            },
            "body" : JSON.stringify({
                title : titleValue,
                contents : contentsValue,
            })
        })
        const result = await response.json();

        if(result.state){
            location.reload();
        }else{
            if(result.error.DB){
                location.href = '/page/error';
            }else if(!result.error.auth){
                alert(result.error.errorMessage);
            }else{

            }
        }
    })
    
    const contentsContainer = post_container.querySelector('.contents_container');
    contentsContainer.innerHTML = "";
    contentsContainer.append(contentsInput);

    post_container.append(postModifySubmitBtn);
}