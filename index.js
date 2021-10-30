const express = require('express');
const app = express();
const mongoose = require('mongoose');
const helmet = require('helmet');
const dotenv = require('dotenv');
const morgan = require("morgan");
const userRoutes = require("./routes/users");
const AuthRoutes = require("./routes/auth");
const PostRoutes = require("./routes/posts");


//to use dotenv 
dotenv.config();

//mongoose connection
mongoose.connect(process.env.MONGO_URL,{useNewUrlParser:true,useUnifiedTopology:true},()=>{
    
    console.log("Connected to Mongodb")
})


app.use(express.json());
app.use(helmet());
app.use(morgan("common"));



// app.get("/",(req,res)=>{

//     res.send("Serving the backend!");
// })

//when we go to this address this routes run 
app.use("/api/user",userRoutes);
app.use("/api/auth",AuthRoutes);
app.use("/api/posts",PostRoutes);



//server creation
app.listen(5000,() =>{
    console.log("Our Api is working BenStokes");
})