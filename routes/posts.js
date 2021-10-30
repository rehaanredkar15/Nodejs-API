const router = require("express").Router();
const Post = require("../models/Post");


router.post("/", async (req,res) => {
 
   const newPost = new Post(req.body);
   try {
       const savedPost = await newPost.save();
       res.status(200).json(savedPost)
   }
   catch(err) {
         res.status(500).json(err);
   }
})


//update a post 
 
 router.put("/:id",async (req,res) => {
    try{
     //here we can  do findById and update but we need to check the user id also so first 
     //we search for post and then check and update it
     const post = await Post.findById(req.params.id);
    if(post.userId == req.body.userId)
    {
        //set keyword to update the post details in  req.body

        await post.updateOne({$set:req.body});
        res.status(403).json("the post has been updated");

    }
    else{
        res.status(403).json("You can update only Your posts");

    }
    }catch(err){
        res.status(500).json(err);
    }
 })



//delete a post
router.delete("/:id",async (req,res) => {
    try{
     const post = await Post.findById(req.params.id);
    if(post.userId == req.body.userId)
    {
        //set keyword to update the post details in  req.body
        await post.deleteOne({$set:req.body});
        res.status(200).json("The post has been deleted");

    }
    else{
        res.status(403).json("You can deleted only Your posts");

    }
    }catch(err){
        res.status(500).json(err);
    }
 })

//like a post
router.put("/:id/like",async (req,res) => {
    try{ 
     const post = await Post.findById(req.params.id);
    if(!post.likes.includes(req.body.userId))
    {
        //set keyword to update the post details in  req.body
         await Post.updateOne({$push:{likes: req.body.userId}});
        res.status(200).json("The post has been liked");

    }
    else{
        await Post.updateOne({$pull:{likes: req.body.userId}});
        res.status(403).json("Post have been disliked");

    }
    }catch(err){
        res.status(500).json(err.message);
    }
 })



module.exports = router;