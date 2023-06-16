const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/heladospedro', {
    useNewUrlParser : true,
    useUnifiedTopology: true
})
.then (db => console.log("connect database"))
.catch (err => console.log("error" + err));