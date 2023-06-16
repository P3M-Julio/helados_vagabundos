const {Schema, model} = require('mongoose');

const user_sch = new Schema ({
    username : {type : String, required : true},
    pass : {type : String, required : true},
    img : {type : String},
    products:[{
        name : {type : String},
        price : {type : Number},
        flavor : {type : String},
        imgProduct : {type : String}    
    }]
})

module.exports = model('user', user_sch);