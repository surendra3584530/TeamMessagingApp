const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
var user = require('./models/user');
const session = require('express-session');
var bcrypt = require('bcrypt');
var userChannel = require('./models/channel');
var postMsg = require('./models/post');

const app = express();

app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));

var sess;

const url = "mongodb://127.0.0.1:27017/myDB"

const secret = process.env.SECRET || 'some other secret as default';

//connect to mongo
mongoose.connect(url,{ useFindAndModify: false})
      .then(() => console.log("Mongodb connect sucessfully...."))
      .catch(err => console.log(err));

//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('view'));

app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/main.html');
})

app.post('/login', (req, res) =>{
    sess = req.session;
    user.find({
        email:req.body.email
    },{password:1,userName:1})
    .then(data=>{
        if(data.length == 0){
            res.send("Invalid Email_id");
        }else{
           bcrypt.compare(req.body.password,data[0].password,(err,isMatch)=>{
               if(err) console.log(err)
               if(isMatch){
                sess.email = req.body.email;
                res.send(data[0].userName);
               }else{
                  res.send("Password Incorrect");
               }
           })
        }
    })

})

app.post("/signUp", (req, res) =>{
    var salt = bcrypt.genSaltSync(10);
    // Hash the password with the salt
    var hashPassword = bcrypt.hashSync(req.body.password, salt);
   
    user.insertMany({
        email: req.body.email,
        region: req.body.region,
        userName: req.body.username,
        password: hashPassword
    }).then(data=>{
        res.send("SignUp succcessfully.....")
    }).catch(err=>{
        console.log(err)
    })

})
app.get('/channel', (req, res) =>{
    sess = req.session;
    var channelName = [];
    if(sess.email != undefined) {
         user.find({
             email: sess.email
         },{channels:1,userName:1}).then(async data=>{ 
            data[0].channels.map(id=>{
                 channelName.push(new Promise((resolve, reject) =>{
                    userChannel.find({
                        _id:id
                    },{channelName:1}).then(data1=>{
                       resolve(data1[0]);
                    })
                }))
        })
        channelName.push(data[0].userName); 
        res.send(await Promise.all(channelName));
    })
    }
    else
    {
        res.send("No")
    }
})

app.get('/getUser', (req, res) =>{
    user.find({},{userName:1,region:1,email:1}).then(data=>{
        res.send(data);
    })
})

app.post('/createChannel',(req,res)=>{
    userChannel.insertMany({
        channelName: req.body.name,
        description: req.body.description,
        tags: req.body.tags,
        persons: req.body.person
    },{_id:1}).then((data)=>
    {
        req.body.person.map(id=>{
            user.findOneAndUpdate({ 
                _id: mongoose.Types.ObjectId(id)
            }, { $push: { "channels": data[0]._id }}).then(()=>{})
        })
        res.send("channel created");
    })
})

app.post('/postMsg',(req,res)=>{
    postMsg.insertMany({
        msg: req.body.msg,
        create_by: req.body.username,
        channelName: req.body.name
    }).then(()=>{
        res.send(req.body.msg);
    })
})

app.post('/searchMsg',(req,res)=>{
    const regex = new RegExp(req.body.message);
    postMsg.find({
        channelName: req.body.channelName,
        msg: {$regex: regex},
    }).then(data=>{
    if(data.length == 0){
        res.send("No Message In This Channel")
    }else{
        res.send(data);
    }
    })
})

app.post('/getMsg',(req,res)=>{
    postMsg.find({
        channelName: req.body.channelName
    },{_id:0,msg:1}).skip(req.body.skip).
    limit(req.body.limit)
    .then(data=>{
    if(data.length == 0){
        res.send("No Message In This Channel")
    }else{
        res.send(data);
    }
    })
})

app.post('/getData',(req,res)=>{
    sess = req.session;
    if(sess.email == undefined)
    {
        res.send("No")
    }else if(req.body.req === 1){
            postMsg.aggregate([
                { $group: { _id: "$channelName", count: { $sum: 1 } } },
                { $sort: {count: -1 } },
                { $limit: 5}
            ]).then(data=>{
                res.send(data);
            })
        }else if( req.body.req === 2){
            res.send("ok")
        }else if( req.body.req === 3){
            user.aggregate([
                { $group: { _id: "$region", count: { $sum: 1 } } },
                { $sort: {count: -1 } },
                { $limit: 5}
            ]).then(data=>{
                res.send(data);
            })
        }else{
            postMsg.aggregate([
                { $group: { _id: "$create_by", count: { $sum: 1 } } },
                { $sort: {count: -1 } },
                { $limit: 5}
            ]).then(data=>{
                res.send(data);
            })
        }
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`server started on port ${PORT}`))