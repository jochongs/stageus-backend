window.onload = ()=>{
    const postIdx = location.pathname.split('/')[location.pathname.split('/').length-1];
    requestPostData(postIdx);
    requestCommentData(postIdx);
    checkLoginState();
}

const requestPostData = async (postIdx)=>{
    const response = await fetch(`/post/${postIdx}`);
    const result = await response.json();
    console.log(result);

    const response2 = await fetch('/session');
    const result2 = await response2.json();

    if(result.state){
        if(result.data.length === 0){
            location.href = '/page/error404';
            return 0;
        }
        const data = result.data[0];

        const postAuthor = data.post_author;

        const date = new Date(data.post_date);
        const dateDiv = document.querySelector('.date_container');
        dateDiv.innerText = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate().toString().padStart(2,0)}`;

        const titleDiv = document.querySelector('.title_container');
        titleDiv.innerHTML = data.post_title;

        const contentsDiv = document.querySelector('.contents_container');
        contentsDiv.innerHTML = data.post_contents;

        const authorDiv = document.querySelector('.author_container');
        authorDiv.innerHTML = data.nickname;

        result.data.map((row,index)=>{
            if(row.img_path !== null){
                const img = document.createElement('img');
                img.setAttribute('src',`https://jochong.s3.ap-northeast-2.amazonaws.com/post/${row.img_path}`);
                document.querySelector('.contents_container').append(img);
            }
        })

        if(result2?.id === postAuthor || result2.authority === 'admin'){
            document.querySelector('.post_detail_btn_container').classList.remove('hidden');
        }
    }else{
        if(result.DB){
            location.href = "/page/error";
        }
    }
}

const requestCommentData = async (postIdx)=>{
    const response = await fetch(`/comment?postIdx=${postIdx}`);
    const result = await response.json();
    console.log(result);

    if(result.state){
        const commentDataArray = result.data;

        const response2 = await fetch('/session');
        const result2 = await response2.json();

        commentDataArray.forEach((commentData,index)=>{
            const author = commentData.nickname;
            const date = new Date(commentData.comment_date);
            const contents = commentData.comment_contents;
            const commentIdx = commentData.comment_idx;
            const commentAuthor = commentData.comment_author;
            
            //?????? ?????? div
            const commentContentsDiv = document.createElement('div');
            commentContentsDiv.classList.add('comment_contents');
            commentContentsDiv.innerText = contents;

            //?????? ????????? div
            const commentAuthorDiv = document.createElement('div');
            commentAuthorDiv.classList.add('comment_author');
            commentAuthorDiv.innerText = author;

            //?????? ????????? div
            const commentDateDiv = document.createElement('div');
            commentDateDiv.classList.add('comment_date');
            commentDateDiv.innerText = `${date.getFullYear()}??? ${date.getMonth()+1}??? ${date.getDate()}???`;

            //comment author date div
            const commentAuthorDateContainer = document.createElement('div');
            commentAuthorDateContainer.classList.add('comment_author_date_container');
            commentAuthorDateContainer.append(commentAuthorDiv);
            commentAuthorDateContainer.append(commentDateDiv);

            //comment item div
            const commentItem = document.createElement('div');
            commentItem.classList.add('comment_item');
            commentItem.append(commentContentsDiv);
            commentItem.append(commentAuthorDateContainer);


            if(result2?.id === commentAuthor || result2.authority === 'admin'){
                //?????? ?????? div
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '??????';
                deleteBtn.dataset.commentIdx = commentIdx;
                deleteBtn.classList.add('comment_delete_btn');
                deleteBtn.addEventListener('click',clickDeleteCommentBtnEvent);

                //?????? ?????? div
                const modifyBtn = document.createElement('button');
                modifyBtn.innerHTML = "??????";
                modifyBtn.dataset.commentIdx = commentIdx;
                modifyBtn.classList.add('comment_modify_btn');
                modifyBtn.addEventListener('click',clickModifyCommentBtnEvent);
                
                commentAuthorDateContainer.append(deleteBtn);
                commentAuthorDateContainer.append(modifyBtn);
            }

            document.querySelector('.comment_container').append(commentItem);
        })
    }else{
        location.href = '/page/error';
    }
}

const checkLoginState = async ()=>{
    const response = await fetch('/session');
    const result = await response.json();

    if(result.state){ //???????????? ???????????????
        document.querySelector('.comment_container .input_container').classList.remove('hidden');

        //????????? ?????? ??????
        document.querySelector('.nav_login_btn').classList.add('hidden');

        //???????????? ?????? ??????
        document.querySelector('.nav_logout_btn').classList.remove('hidden');

        //?????? ?????? ?????? ?????? ??????
        const userInfoBtn = document.querySelector('.user_info_btn');
        userInfoBtn.classList.remove('hidden');
        const img = userInfoBtn.querySelector('img');
        img.classList.remove('hidden');
        userInfoBtn.innerText = result.id;
        userInfoBtn.append(img);
    }else{ //???????????? ???????????? ?????????
        document.querySelector('.comment_container .input_container').classList.add('hidden');

        //????????? ?????? ??????
        document.querySelector('.nav_login_btn').classList.remove('hidden');

        //???????????? ?????? ??????
        document.querySelector('.nav_logout_btn').classList.add('hidden');

        //?????? ?????? ?????? ?????? ??????
        const userInfoBtn = document.querySelector('.user_info_btn');
        userInfoBtn.classList.add('hidden');
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

    if(result.state){//?????? ???
        location.reload();
    }else{
        if(!result.error.auth){
            alert(result.error.errorMessage);
        }else if(result.error.DB){
            location.href = '/page/error';
        }else{
            alert('?????? ??? ????????? ?????????????????????.');
        }
    }
}

const clickDeleteCommentBtnEvent = async (e)=>{
    const commentIdx = e.target.dataset.commentIdx;

    const response = await fetch(`/comment/${commentIdx}`,{
        "method" : "DELETE",
        "headers" : {
            "Content-Type" : "application/json"
        }
    })
    const result = await response.json();

    if(result.state){//?????? ???
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
    const commentItem = e.target.parentElement.parentElement;
    const commentContents = commentItem.querySelector('.comment_contents').innerText;

    const input = document.createElement('input');
    input.id = "comment_modify_input";
    input.classList.add('comment_modify_input');
    input.value = commentContents;

    const submitBtn = document.createElement('button');
    submitBtn.classList.add('modify_comment_submit_btn');
    submitBtn.innerText = "????????????";
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

    const response = await  fetch(`/post/${postIdx}`,{
        "method" : "DELETE",
        "headers" : {
            "Content-Type" : "application/json"
        },
    })

    const result = await response.json();

    console.log(result);

    if(result.state){
        location.href = '/';
    }else{
        if(result.error.DB){
            location.href = '/page/error';
        }else if(!result.error.auth){
            alert(result.error.errorMessage);
        }
    }
}

const clickModifyPostBtnEvent = ()=>{
    //?????? ?????? ?????? ??????
    document.querySelector('.post_detail_btn_container').classList.add('hidden');

    const post_container = document.querySelector('.post_detail_container');

    const titleInput = document.createElement('input');
    titleInput.id = 'modify_post_title_input';
    titleInput.classList = 'modify_post_title_input';
    

    const titleContainer = post_container.querySelector('.title_container');
    titleInput.value = titleContainer.innerText;
    titleContainer.innerHTML = "";
    titleContainer.append(titleInput);

    const contentsInput = document.createElement('textarea');
    contentsInput.classList.add('modify_post_contents_input');
    contentsInput.id= "modify_post_contents_input";

    const postModifySubmitBtn = document.createElement('button');
    postModifySubmitBtn.classList.add('post_modify_submit_btn');
    postModifySubmitBtn.innerHTML = "????????????";
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
    contentsInput.value = contentsContainer.innerText;
    contentsContainer.innerHTML = "";
    contentsContainer.append(contentsInput);

    post_container.append(postModifySubmitBtn);
}