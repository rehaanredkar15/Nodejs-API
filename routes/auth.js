// using Router of express
const router = require("express").Router();
const User = require("../Model/User");
const bcrypt = require("bcrypt");



//REGISTER
router.post("/register", async(req,res) => {

     
     try{
         //now to encrypt the password we use  
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(req.body.password,salt);



   // taking the values from schema and making user to save in the database 
        const newUser = new User({

            username:req.body.username,
            email:req.body.email,
            password:hashedPassword,
        })


        const user = await newUser.save();
        res.status(200).json(user)
     }
     catch(err){
         res.status(500).json(err);
     }

    //this operation will be with database to save 
    // await user.save();   
});

//Login
router.post("/login", async(req,res) => {
  

  //now to  search user 
    try{
      const user = await User.findOne({ email:req.body.email});
      !user && res.status(404).json("User Not Found");
      
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      !validPassword && res.status(400).json("wrong password");

      res.status(200).json(user);

    }
    catch(err){

       
       res.status(500).json(err);


    }
})




module.exports = router;
