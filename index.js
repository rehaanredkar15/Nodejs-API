const express = require('express');
const app = express();
const mongoose = require('mongoose');
const helmet = require('helmet');
const dotenv = require('dotenv');
const morgan = require("morgan");
const userRoutes = require("./routes/users");
const AuthRoutes = require("./routes/auth");
const PostRoutes = require("./routes/posts");
const conversationRoute = require("./routes/conversation");
const messageRoute = require("./routes/message");
const multer = require("multer");
const multers3 = require("multer-s3");
const uuid = require('uuid').v4;
const path = require("path")
const aws = require('aws-sdk');
var cors = require('cors')

require("dotenv").config({ path: "./config.env" });

app.use(cors(), express.json());


//mongoose connection
const connectDB = async () => {
    try {

        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongoDB connected!!');
    } catch (err) {
        console.log('Failed to connect to MongoDB', err);
    }
};

connectDB();


app.use(express.json());
app.use(helmet());
app.use(morgan("common"));


mongoose.set('bufferCommands', false);


const PORT = process.env.PORT|| 5000;
//server creation
app.listen(PORT,() =>{
    console.log("Our Api is working on 5000 ");
})


//when we go to this address this routes run 
app.use("/api/user",userRoutes);
app.use("/api/auth",AuthRoutes);
app.use("/api/posts",PostRoutes);
app.use("/api/conversations",conversationRoute);
app.use("/api/messages",messageRoute);


