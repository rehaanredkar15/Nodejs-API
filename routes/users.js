const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
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

router.get("/:id", async(req,res) => {

  try{
     const user = await User.findById(req.params.id);
     const {password,updateAt,...other} = user._doc
     // destructing the data and removing password and updateAt from received data by only passing other data 
     res.status(200).json(other);
    
  }
  catch(err){
     res.status(500).json(err);
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



module.exports = router;

