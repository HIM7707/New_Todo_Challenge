const mongoose = require("mongoose");

const mySchema_Project = mongoose.Schema({
     Title : {type : String, required: true}, 
     Date : {type: String, required: true}, 
     ListofTodos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mymodel_todo' }],
     Createdby : {type: String, required:true}
})

const mySchema_todo = mongoose.Schema({
    Title : {type: String, required: true},
    Description : {type: String , required: true},
    Status : {type: Boolean, required: true}, 
    CreatedDate : {type: String, required: true}
})

const User = mongoose.Schema({
    Email : {type: String, required: true},
    Password: {type: String , required: true}
})

const User_ = mongoose.model('Myuser',User);
const Mymodel_Project = mongoose.model('Mymodel_Project',mySchema_Project);
const Mymodel_todo = mongoose.model('Mymodel_todo',mySchema_todo);

module.exports = {Mymodel_Project , Mymodel_todo, User_};

