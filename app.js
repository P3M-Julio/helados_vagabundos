const express = require('express');
const bodyParse = require('body-parser');
const path = require('path');
const app = express();

const User = require("./util/mongo/user");
const database = require('./util/mongo/database');

var currentData;
var changedPass = false;

app.set('port', 3000);
app.set("view engine", "jade");
app.use(bodyParse.json());
app.use(bodyParse.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname, 'util')));

app.post("/registerUser", function(sol, res) {
    var name = sol.body.user;
    var password = sol.body.pass;
    var passwordConfirm = sol.body.passConfirm;

    if (name != "" && password != "" && passwordConfirm != "") {
        if (password == passwordConfirm) {
            const register = async () => {
                const user = await User.findOne({username:name, pass:password});
                
                if (user == null) {
                    var data = {
                        username:name,
                        pass:password,
                        desc:"none",
                        img:"./imgs/logo_person.png",
                        money:50000
                    }

                    var collection = new User(data);
                    collection.save();
                    res.render("loginAccount");
                } else{
                    res.render("createAccount");
                }
            }
            
            register();
        } else {
            res.render("createAccount");
        }
    } else {
        res.render("createAccount");
    }
});

app.post("/loginUser", function(sol, res) {
    var name = sol.body.user;
    var password = sol.body.pass;

    const login = async () => {
        const user = await User.findOne({username:name, pass:password});

        if (user != null) {
            res.render("home", {user : user, productList : user.products});
            currentData = user;
        }
    }
    login();
});

app.get("/consult", function(sol, res) {
    const search = async () => {
        const userList = await User.find({});
        res.render("consult", {userList:userList});
    }
    search();
});

app.post("/backhome", function(sol, res) {
    const back = async () => {
        const user = await User.findOne({username:currentData.username, pass:currentData.pass});

        if (user != null) {
            res.render("home", {user : user, productList : user.products});
            currentData = user;
        }
    }

    back();
});

app.post("/updateUser", function(sol, res) {
    const update = async () => {
        const user = await User.findOne({username:currentData.username, pass:currentData.pass});

        if (user != null) {
            var data = {
                username:sol.body.user,
                pass:sol.body.pass,
                img:sol.body.imgurl,
                products:currentData.products
            };

            if (data.username == "") {
                data.username = currentData.username;
            }

            if (data.pass == "") {
                data.pass = currentData.pass;
            }

            if (data.img == "") {
                data.img = currentData.img;

                if (currentData.img == "") {
                    data.img = "./imgs/logo_person.png";
                }
            }

            await User.updateOne(currentData, data);
            currentData = data;

            res.render("account", {user:currentData});
        }
    }

    update();
});

app.post("/deleteUser", function(sol, res) {
    const deleteUser = async () => {
        const user = await User.findOne({username:currentData.username, pass:currentData.pass});

        if (user != null) {
            User.deleteOne(user)
            .then(function(){})
            .catch(function(){});
            res.render("createAccount");
        }
    }
    deleteUser();
});

app.post("/addProduct", function(sol, res) {
    const push = async () => {
        var user = await User.findOne({username:currentData.username, pass:currentData.pass});
        
        var data = {
            name:sol.body.name,
            price:parseInt(sol.body.price),
            flavor:sol.body.flavor,
            imgProduct:sol.body.imgUrl
        }
        
        if (user != null) {
            await User.updateOne({username:user.username}, {$push:{products:data}});
            user = await User.findOne({username:currentData.username, pass:currentData.pass});
            res.render("home", {user : user, productList : user.products});
        }
    }

    push();
});

app.post("/deleteProduct", function(sol, res) {
    const pull = async () => {
        var data = {
            name:sol.body.name,
            price:sol.body.price,
            flavor:sol.body.flavor
        }

        var product = {
            'products.name':data.name,
            'products.price':data.price,
            'products.flavor':data.flavor
        }

        var user = await User.findOne(product);

        if (user != null) {
            await User.updateOne({username:user.username}, {$pull:{products:data}});
            user = await User.findOne({username:user.username, pass:user.pass});
            currentData = user;
            res.render("home", {user : currentData, productList : currentData.products});
        }
    }

    pull();
});

app.post("/addProductMenu", function(sol, res) {
    res.render("addProduct");
});

app.get("/", function(sol, res)  {
    res.render("createAccount");
});

app.post("/loginMenu", function(sol, res) {
    res.render("loginAccount");
});

app.post("/registerMenu", function(sol, res) {
    res.render("createAccount");
});

app.post("/deleteMenu", function(sol, res) {
    res.render("deleteAccount");
});

app.post("/updateAccount", function(sol, res) {
    res.render("updateAccount", {user : currentData});
});

app.post("/accountMenu", function(sol, res) {
    res.render("account", {user : currentData});
});

app.listen(app.get('port'), () => {
    console.log("connect server");
});