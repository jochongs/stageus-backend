const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3-transform');
const aws_config = require('../config/aws_config');
const sharp = require('sharp');

//setting ==================================================================
AWS.config.update(aws_config);

const s3 = new AWS.S3();

const postImgUpload = multer({
    storage: multerS3({
        s3 : s3,
        bucket : "jochong/post",
        contentType : multerS3.AUTO_CONTENT_TYPE,
        shouldTransform: function (req, file, cb) {
            cb(null, /^image/i.test(file.mimetype)); //이미지 파일인지 아닌지 확인하는 정규표현식
        },
        transforms: [
            {
                id: 'post_img',
                key: function (req, file, cb) {
                    cb(null, Date.now().toString()+'.png');
                },
                transform: function (req, file, cb) {
                    cb(null, sharp().resize({width : 300}));
                }
            }
        ],
        acl : 'public-read',
        contentType : multerS3.AUTO_CONTENT_TYPE,
    }),
    fileFilter : (req, file, cb)=>{
        if(req.body.title.length !==0 && req.body.title.length <= 32 && req.body.contents.length !== 0){
            cb(null, true);
        }else{
            console.log('입력 input 조건이 안맞아서 저장 못햇네요~');
            cb(null, false);
        }
    }
})

module.exports = postImgUpload;