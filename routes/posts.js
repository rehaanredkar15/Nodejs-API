const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");



//writing the s3 configuration in controller to keep the code clean
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


router.post("/feed", async (req,res) => {


    
   const uploadSingle = upload("smile-app").single("file");

   uploadSingle(req, res, async (err) => {

    if (err)
      return res.status(400).json({ success: false, message: err.message });
    
    if(req.file.location){
      const savedPost = await Post.create({photoUrl:req.file.location,...req.body});
    res.status(200).json(savedPost)
    }
    else
    {
       res.status(200).json(savedPost)
    }
  });



})



router.get("/explore", async(req, res) => {

      try {

    const posts = await Post.find({});
    res.status(200).json(posts);

  } catch (err) {
     res.status(500).json(err.message);
  }
})




//update a post 
 router.post("/update/:id",async (req,res) => {
    try{
     //here we can  do findById and update but we need to check the user id also so first 
     //we search for post and then check and update it
        const post = await Post.findById(req.params.id);
        //set keyword to update the post details in  req.body
          const uploadSingle = upload("smile-app").single("file");

                uploadSingle(req, res, async (err) => {
                    if (err)
                    {
                        return res.status(400).json({ success: false, message: err.message });
                    }
                    const savedPost = await post.updateOne({$set:{photoUrl:req.file.location}});
                      await post.updateOne({$set:req.body});
                  })
        res.status(200).json(post);
    }catch(err){
        res.status(500).json(err.message);
    }
 })





//delete a post
router.delete("/:id",async (req,res) => {

    try{
     const post = await Post.findById(req.params.id);
   
        await post.deleteOne({$set:req.body});
        res.status(200).json("The post has been deleted");


    }catch(err){
        res.status(500).json(err);
    }
 })




//like a post
router.put("/:id/like",async (req,res) => {

   try {
        //set keyword to update the post details in  req.body
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {

      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    }
    else{

          await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
    }catch(err){
        res.status(500).json(err.message);
    }


 })


//getting a single post

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});




// get timeline posts
router.get("/timeline/:userId", async (req, res) => {
  try {

    // when we use get request using params instead of body is good practice
    const currentUser = await User.findById(req.params.userId);
    //  first we get the current user so that we can get the posts related to him
    // then we get all the posts for current user
    const userPosts = await Post.find({ userId: currentUser._id });
    // Now we get the posts of friends of current user through looping
    // through their followings list 
    // we have used promise here cause we are using loop and every time 
    // to use loop we need promises 
    const friendPosts = await Promise.all(
      //getting all the friends post
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.json(userPosts.concat(...friendPosts))
  } catch (err) {
    
    res.status(500).json(err.message);
  }
});



//get user's all posts 
router.get("/profile/:username", async(req, res) => {

  try {
    const user = await User.findOne({username:req.params.username});
    const posts = await Post.find({userId: user._id});
    res.status(200).json(posts);

  } catch (err) {
     res.status(500).json(err.message);
  }
})



module.exports = router;