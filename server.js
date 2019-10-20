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

// app.use(app.router);
app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/main.html');
})

app.get('/login', (req, res) =>{
    res.send("hello");
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