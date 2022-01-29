const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");


const s3 = new aws.S3({
  accessKeyId:"AKIASIVF2XC77RGESCCY",
  secretAccessKey:"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",
  region: "ap-south-1",
});

const upload = (bucketName) =>
  multer({
    storage: multerS3({
      s3,
      bucket: bucketName,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(null, `image-${Date.now()}.jpeg`);
      },
    }),
  });



//update user
router.put("/:id", async (req, res) => {

    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json(user);
    }catch(err) {
      return res.status(500).json(err);
    }
});


router.put("/profilePicture/:id", async (req, res) => {

      try{
          const user = await User.findById(req.params.id);
          const uploadSingle = upload("smile-app").single("file");


          uploadSingle(req, res, async (err) => {
              if (err)
              {
                return res.status(400).json({ success: false, message: err.message });
              }
             console.log(req.file.location);
              const savedPost = await user.updateOne({$set:{profilePicture:req.file.location}});
        res.status(200).json(savedPost);
          });


    }catch(err){
        res.status(500).json(err.message);
    }
});


router.put("/coverPicture/:id", async (req, res) => {

      try{
          const user = await User.findById(req.params.id);
          const uploadSingle = upload("smile-app").single("file");

          uploadSingle(req, res, async (err) => {


              if (err)
              {
                return res.status(400).json({ success: false, message: err.message });
              }
           
              const savedPost = await user.updateOne({$set:{coverPicture:req.file.location}});
               res.status(200).json(user);
          });


    }catch(err){
        res.status(500).json(err.message);
    }
});



//delete user 
router.delete("/:id", async(req,res) => {
  if(req.body.userId == req.params.id || req.user.isAdmin)
  {
    try{
      const user = await User.findByIdAndDelete(req.params.id);
      //findByIdAndDelete for searching and deleting other function is deleteOne
      res.status(200).json("Account has been deleted");
    }
    catch(err){
      return res.status(500).json(err.message);
    }
  }
  else{
    return res.status(403).json("You can delete only your account!"); 
  }
})




//get user 
router.get("/", async(req,res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try{
     const user = userId 
      ? await User.findById(userId)
       : await User.findOne({username:username});
     const {password,updateAt,...other} = user._doc
     // destructing the data and removing password and updateAt from received data by only passing other data 
     res.status(200).json(other); 
  }
  catch(err){
     res.status(500).json(err);
  }
});



//get friends 
router.get("/friends/:userId", async(req,res) => {

    try {
      //first we take the current user and then take all the
      const CurrentUser = await User.findById(req.params.userId);
      //  followings of the current user 
      //then we traverse over the current users followings 
      const userFriends =  await Promise.all(
           CurrentUser.followings.map(friendId => {
     //then we take the followings details by finding the user by id
              return User.findById(friendId)
           })
      ) 
      // now we take up a array of friend List
      let friendList = [];
      // we map over our userFriends 
      userFriends.map((friend) => {
          // we take up the id username and profile picture of the friend and then 
          const { _id,username,profilePicture} = friend;
          //insert that data in friendList
          friendList.push({ _id,username, profilePicture });
      });

       res.status(200).json(friendList);

    } catch (err) {
      
      res.status(500).json(err.message);
    }
})



router.get("/userprofile/", async(req, res) => {

        let userList = [];
  try {
    const user = await User.find();

     user.map((friend) => {
         
          userList.push(friend);
      });

      // console.log(userList);
    res.json({ status: 'ok', data: userList })

  } catch (err) {
     res.status(500).json(err.message);
  }
})





//follow a user 
router.put("/:id/follow", async(req,res) => {

  if(req.body.userId != req.params.id)
  {
    try{
          const user = await User.findById(req.params.id);
          const currentUser = await User.findById(req.body.userId);
          //findById for getting the user by Id
          if(!user.followers.includes(req.body.userId))
          {
            await user.updateOne({$push:{followers: req.body.userId}});
            //push keyword is used to push some data inside the new data 
            await currentUser.updateOne({$push:{followings:req.params.id}});
              res.status(200).json("User has  been followed");
          }
          else{
            res.status(403).json("You already follow this user");
          }
    }
    catch(err) 
    {
      res.status(403).json("You cant follow yourself");
    }
  }
})


//unfollow a user 
router.put("/:id/unfollow", async(req,res) => {

  if(req.body.userId != req.params.id)
  {
    try{
          const user = await User.findById(req.params.id);
          const currentUser = await User.findById(req.body.userId);
          //findById for getting the user by Id

          if(user.followers.includes(req.body.userId))
          {
            await user.updateOne({$pull:{followers: req.body.userId}});
            //pull keyword is used to remove some data inside the data 
            await currentUser.updateOne({$pull:{followings:req.params.id}});
              res.status(200).json("User has  been unfollowed");
          }
          else{
            res.status(403).json("You dont follow this user");
          }
    }
    catch(err) 
    {
      res.status(403).json("You cant unfollow yourself");
    }
  }
})



module.exports = router;

