// User authoriation based on: https://medium.com/@faizanv/authentication-for-your-react-and-express-application-w-json-web-tokens-923515826e0#18d5
require("@babel/polyfill");
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const cookieParser = require('cookie-parser');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();

const imageRoutes = require('./routes/image');
const userRoutes = require('./routes/user');
const styleRoutes = require('./routes/style');
const emailRoutes = require('./routes/email');
const uploadRoutes = require('./routes/upload');
const editRoutes = require('./routes/edit');
const removeRoutes = require('./routes/remove');

const errorHandler = require('./middleware/globalError');

const page = require("./models/Page")
const HomePage = require('./models/HomePage');
const textPage = require('./models/TextPage');
const  {ListPage, ListObject} = require('./models/ListPage');
const portfolio = require('./models/Portfolio');
const genericPage = require('./models/GenericPage');
const Image = require('./models/image');
const Footer = require("./models/Footer");
const {Blog, BlogPost} = require('./models/Blog');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, 'client/build')));
app.use('/image', imageRoutes);
app.use('/user', userRoutes);
app.use('/style', styleRoutes);
app.use('/email', emailRoutes);
app.use('/upload', uploadRoutes);
app.use('/edit', editRoutes);
app.use('/remove', removeRoutes);
app.use(errorHandler);
app.use(cors());

const mongo_uri = 'mongodb://localhost/react-auth';
// const {  mongo_uri } = require("./config")


mongoose.connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true}, function(err) {
  if (err) {
    throw err;
  } else {
    console.log(`Successfully connected to ${mongo_uri}`);
  }
});

// app.get('/', function (req, res) {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
})


/*API end point to return the information for a single page*/
app.get('/api/getPage', (req,res) => {
	var pageId = (req.query.pageId);
  var pageType = (req.query.pageType);

  if (pageType==="text"){
      textPage.findById(pageId).lean().exec(
      function (err, textPage) {  
          res.send(textPage);
      }); 
  } else if (pageType==="list"){

    ListPage.findById(pageId).lean().exec(
      function (err, listPage) {  
        ListObject.find({_id: {$in: listPage.objectIds}}, function (err, array) {
          if (err) {
            console.log(err);
            throw(err);
          } else {
            let pageData ={
              type:listPage.type,
              title:listPage.title,
              childObjects:array
            }
            res.send(pageData);
          }
        });
      }); 
  } else if (pageType==="portfolio"){
    portfolio.findById(pageId).lean().exec(
    function (err, portfolioPage) {         
        res.send(portfolioPage);
    }); 
  } else if (pageType==="blog"){
    Blog.findOne({}).lean().exec(
      function (err, blog) {  
        BlogPost.find({}, function (err, blogPosts) {
          if (err) {
            console.log(err);
            throw(err);
          } else {
            let pageData ={
              title:blog.title,
              text:blog.text,
              posts:blogPosts
            }
            res.send(pageData);
          }
        });
      }); 
  } else if (pageType==="genericPage"){
    genericPage.findById(pageId).lean().exec(
    function (err, genPage) {         
        res.send(genPage);
    }); 
  } else {
    res.send("Page type not recognized");
  }
    
});

/*API end point to return a list of page titles and ids*/
app.get('/api/getPageInfo', (req,res) => {
  page.find().lean().exec(
      function (err, pages) {  
          res.send(pages);
      });     
});

app.get('/api/getHomePage', (req,res) => {
  HomePage.findOne({}, function(err, page) {
      if (err) return res.send(500, {error: err});
      if(!page){
        page = new HomePage({type:'simpleImage', name:'', images:[], subHeader:'', imageLinks:[]});
        page.save(function(err){console.log(err)});
      }
      return res.send(page);
  });
});

app.get('/api/getFooter', (req,res) => {
  Footer.findOne({}, function(err, footer) {
      if (err) return res.send(500, {error: err});
      if(!footer){
        footer = new Footer({
          message:"Thank you for visiting my site!",
          facebook:"",
          instagram:"",
          twitter:"",
          etsy:"",
          linkedin:"",
          other:""
        });
        footer.save(function(err){console.log(err)});
      }
      return res.send(footer);
  });
});

app.get('/api/getPortfolioImages', (req, res)=>{
  let images = [];
  if (req.query.imageNames){
    req.query.imageNames.forEach((imageName, index)=>{
      Image.find({fileName:imageName}).lean().exec(
        function (err, img) {  
          images.push(img[0])
            if (images.length==req.query.imageNames.length) {   
              res.send(images)
            };
        }
      ); 
    })
  }
});

app.get('/api/getPortfolioTitles', (req, res)=>{
  let portfolioTitles=[];
  portfolio.find({}, (err, portfolios)=>{
    portfolios.forEach((port)=>{
      portfolioTitles.push(port.title);
    })

    res.send(portfolioTitles);
  })
})


app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
 })

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.send('Invalid GET request');
});

app.post('*', (req,res) =>{
    res.send('Invalid POST request');
});

app.listen(port, () => {
    console.log('Server is listening on port: ' + port);
});