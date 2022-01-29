// using Router of express
const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const SendEmail = require('../utils/SendEmail');
const crypto = require("crypto");


JWT_SECRET_KEY = "woierulqwurwefmc!@344*(^^&r%^eewjKLREW*(&^LJKLKSDKSJDF";


//REGISTER
router.post("/register", async (req, res) => {
  try {

    //create new user
     const { username, email, password,desc } = req.body;

     const token = jwt.sign({
                 username:username,
                 email:email,
           }, JWT_SECRET_KEY )

    //save user and respond
   const user = await User.create({
      username,
      email,
      desc,
      password,
    });

    res.status(200).json(token);
  } catch (err) {
    
    res.status(500).json(err.message)
  }
});



 router.post("/login", async(req,res) => {
    
    const { email, password } = req.body;

  // Check if email and password is provided
  if (!email || !password) {

     res.status(500).json("Please provide an email and password");
   
  }
  try {
    // Check that user exists by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(500).json("Invalid credentials");

    }
    else
    {


      const validPassword = await bcrypt.compare(req.body.password, user.password)

        !validPassword && res.status(500).json("Invalid Password");

        const token = user.getSignedJwtToken();
        res.status(200).json({ success: true, token });
    }

  } catch (err) {
    res.status(500).json(err.message);
  }
 });





router.get("/login/userdetails", async(req,res) => {

   const token = req.header['x-access-token']  || req.headers["authorization"];
  //now to  search user 
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
        const email  = decoded.email; 
        const user = await User.findOne({ email})
      
        res.status(200).json(user);
    }
    catch(err){
       res.status(500).json(err);
    }
})

router.post("/login/forgotPassword",async(req,res) => {
  const {email } = req.body;
  try {
    const user = await User.findOne({ email})
    !user && res.status(404).json("User Not Found");
     
    const resetToken = user.getResetPasswordToken();
    await user.save();
     // Create reset url to email to provided email
    const resetUrl = `http://localhost:3000/resetpassword/${resetToken}`;
    // HTML Message
    const message = `
      <h1>Hello ${user.username},</h1>
      <h3>You have requested a password reset</h3>
      <p>Tap Below to reset Your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;
    
    try {
      await SendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: message,
      });
      res.status(200).json({ success:true,data:"Email Sent Successfully "}) 
    } catch (error) {
       user.resetPasswordToken = undefined,
       user.resetPasswordExpire = undefined,
       await user.save();
      
        res.status(500).json(error);
    }
  } catch (error) {
   
      res.status(500).json(error.message);
  }
})





router.put("/resetpassword/:resetToken", async(req,res) => {
 
 
  //  getResetPasswordToken();
   const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");


  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {

     res.status(500).json("user not found "+ resetPasswordToken);
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
      success: true,
      data: "Password Updated Success",
      token: user.getSignedJwtToken(),
    });
  } catch (error) {
      res.status(500).json(error.message);
  }
});



const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(200).json({ success: true, token });
};


module.exports = router;

