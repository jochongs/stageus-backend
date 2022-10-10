//없앨 예정
const router = require('express').Router();
const mongodb = require('mongodb').MongoClient;

router.post('/login',(req,res)=>{
    const idValue = req.body.id;
    const pwValue = req.body.pw;

    const reuslt = {
        state : false
    }
    
    mongodb.connect("mongodb://localhost:27017",(err,database)=>{
        if(err) {
            console.log(err);
            res.send(reuslt);
        }
        else{
            const data = {
                id : idValue,
                pw : pwValue,
            }
            database.db("stageus").collection("account").find(data).toArray((err,data)=>{
                if(err) console.log(err);
                else{
                    console.log(data);
                    if(data.length>=1){
                        console.log('login success');
                        reuslt.state = true;
                    }
                }
                database.close();
                res.send(reuslt);
            });
        }
    })
})

module.exports = router;