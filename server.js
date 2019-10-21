const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
var user = require('./models/user');
var bcrypt = require('bcrypt');

const app = express();

const url = "mongodb://127.0.0.1:27017/myDB"

//connect to mongo
mongoose.connect(url,{ useNewUrlParser: true})
      .then(() => console.log("Mongodb connect sucessfully...."))
      .catch(err => console.log(err));

//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('view'));

// app.use(app.router);
app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/main.html');
})

app.post('/login', (req, res) =>{
    console.log("hello",req.body);
    user.find({
        email:req.body.email
    },{password:1})
    .then(data=>{
        if(data.length == 0){
            res.send("Invalid Email_id");
        }else{
           bcrypt.compare(req.body.password,data[0].password,(err,isMatch)=>{
               if(err) console.log(err)
               if(isMatch){
                  res.send("Login successfully...");
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
    console.log(req.body.email,req.body.region,req.body.username,hashPassword);
   
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`server started on port ${PORT}`))