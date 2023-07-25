const express = require('express');
const mongose = require('mongoose');
const app = express();
const path = require('path');
const formRoutes = require('./routes/formRoutes');
const port = process.env.PORT || 5000;


mongose.connect('mongodb://localhost:27017/test', 
{ 
    useNewUrlParser: true ,
    useUnifiedTopology: true,

});

const db = mongose.connection;



db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function(){
   console.log('connected') ;
});




// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// API routes
app.use('/api', formRoutes);

// Serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});





app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})