const mongoose = require('mongoose');
require('dotenv').config();

module.exports = async () => {

    console.log('connecting')
    await  mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser:true,
       useUnifiedTopology:true, 
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      
    })
        .then(x => {
            console.log(
                `Connected to Mongo! Database name: "${x.connections[0].name}"`,
            );
        })
        .catch(err => {
            console.error('Error connecting to mongo', err);
        });
    return mongoose;
};