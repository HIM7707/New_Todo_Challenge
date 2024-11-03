const express = require('express')
const jwtAuth = require('./middleware/jwtAuth')
const connect_db = require('./config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Mymodel_Project , Mymodel_todo, User_} = require('./models/userModel')
const app = express()
const cors = require('cors');
app.use(cors());
const port = 3000;
JWT_SECRET = 'ANiket@';



//FYI -> i am using email for Jwt , I am using Email for db related.
app.use(express.json());
// Db connection here
connect_db();

app.post('/api/Signup', async(req,res)=>{
  const {Email, Password} = req.body;
  // save email and password to db
  const saltRounds = 10;
  const hashed_password = await bcrypt.hash(Password,saltRounds);
  try{

    const existing_user = await User_.findOne({Email:Email});
    if(existing_user){
      return res.status(400).json({message:"User already Exist"});
    }

    const new_user = new User_({Email:Email, Password:hashed_password});
    const saved_data = await new_user.save();
    
    // signing the jwt token
    const token = jwt.sign(
      {userId: saved_data._id, email: saved_data.Email},
      JWT_SECRET,
      {expiresIn: '1h'}
    );

    res.status(201).json({
      message: "New User Created",
      data: saved_data,
      token
  });
  }
  catch(exception){
    res.status(500).json({
      message : "Error" , exception
    })
  }
})

// this route gives me information about my projects 
// i want to fetch all the projects of a particular user with their unique email address
app.get('/api/me',jwtAuth, async(req,res)=>{

  // This is the JWT Auth system
  try{

    // Now , Fectch all the Projects from the db related to that email.
    const allProjects =await Mymodel_Project.find({Createdby: req.user.email});
    console.log(allProjects);
    res.status(200).json({
      data : allProjects
    })
  }
  catch(e){
    console.log("Error in showing the user Projects");
    res.status(500).json({
      message: e
    })
  }
  
})


app.post('/api/addProject',jwtAuth, async (req, res) => {
  try{
    // extractting token from auth header 
    const {Title, Date} = req.body;
    const adddata = new Mymodel_Project({Title: Title, Date: Date, Createdby: req.user.email}); // creating new instance of the data model 
    const savedata =await  adddata.save();
    console.log("data added",savedata);

    res.status(201).json({
      message: "Project added",
      data : savedata
    })
    
  }
  catch(e){
    console.error("Error adding the project");
    res.status(500).json({
      message:"server error", e
    })
  }
  })

app.post('/api/Signin', async(req,res)=>{
  const {Email, Password} = req.body;
  // now verify the credentials 
  const existing_user = await User_.findOne({Email});

  if(!existing_user){
    res.status(400).json({
      message: "User does not exist , First register"
    })
  }

  const isMatch = await bcrypt.compare(Password,existing_user.Password);
  if(isMatch){
    console.log("Login Successfull");

    const token = jwt.sign(
      {userId : existing_user._id , email : existing_user.Email},
      JWT_SECRET,
      {expiresIn : '1h'}
    );

    res.json({
      message: "Login successfull",
      token : token
    });
  }
  else {
    console.log("Invalid Credentials");
    res.json({
      message: "Invalid Credentials"
    })
  }
})

// This route add Creates a Todo and then adds it to ListofTodo array of PRojects 
app.post('/api/projects/:project_id/todos',jwtAuth, async (req,res)=>{


  try{
    const {project_id} = req.params;

    const {Title, Description, Status, CreatedDate} = req.body;
    const Todo_data = new Mymodel_todo({Title: Title, Description: Description , Status: Status, CreatedDate: CreatedDate});
    const saved_todo = await Todo_data.save();

    console.log("Todo is saved", saved_todo);
    // now link todo with project 
    const Project_desc = await  Mymodel_Project.findOne({
      _id : project_id,
      Createdby: req.user.email
    });

    if(!Project_desc){
      return res.status(404).json({
        message: "Project not found"
      })
    }
    Project_desc.ListofTodos.push(saved_todo);
    const saved_project = await Project_desc.save();

    res.status(201).json({
      message: "Todo created and project updated",
      Todo : saved_todo,
      Project : saved_project
    })
  }
  catch(e){
    res.status(500).json({
      message : e
    })
  }
})

// This route will display all the Todos list 
app.get('/api/projects/:project_id/todos',jwtAuth , async(req,res)=>{
  const {project_id} = req.params;
  
  
  console.log(project_id);
  // i have projectid , find the project with this project id and then display all list of todos

  try{
    const project_data = await Mymodel_Project.findOne({_id:project_id}).populate('ListofTodos');
    if (!project_data) {
      return res.status(404).json({
          message: 'Project not found'
      });
    }
    const arrayoftodo = project_data.ListofTodos;
    console.log(arrayoftodo);
    res.status(200).json({
      Message: "Here are The Todos ",
      Data : arrayoftodo
    })
  }
  catch(e){
    console.log(e);
  }
  
})

// This route will update the status of a specific Todo
app.put('/api/todos/:todoId', jwtAuth, async (req, res) => {
  const { todoId } = req.params;
  const { Status } = req.body; // Expecting the new status in the request body

  try {
    // Find the todo by ID
    const todo = await Mymodel_todo.findById(todoId);
    
    if (!todo) {
      return res.status(404).json({
        message: 'Todo not found',
      });
    }

    // Update the Status
    todo.Status = Status;
    const updatedTodo = await todo.save();

    res.status(200).json({
      message: 'Todo status updated successfully',
      todo: updatedTodo,
    });
  } catch (error) {
    console.error('Error updating todo status:', error);
    res.status(500).json({
      message: 'Server error',
      error,
    });
  }
});

// This route will delete a project by its ID
app.delete('/api/projects/:projectId', jwtAuth, async (req, res) => {
  const { projectId } = req.params;

  try {
      const deletedProject = await Mymodel_Project.findOneAndDelete({
          _id: projectId,
          Createdby: req.user.email
      });

      if (!deletedProject) {
          return res.status(404).json({ message: 'Project not found or you do not have permission to delete it' });
      }

      res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ message: 'Server error' });
  }
});




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})