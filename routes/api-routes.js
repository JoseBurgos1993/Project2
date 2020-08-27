// Requiring our models and passport as we've configured it
const db = require("../models");
const passport = require("../config/passport");
const nodeMailer = require("nodeMailer");
module.exports = function(app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Sending back a password, even a hashed password, isn't a good idea
    res.json({
      email: req.user.email,
      id: req.user.id
    });
  });
  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", (req, res) => {
    db.User.create({
      name: req.body.username,
      age: req.body.age,
      sex: req.body.sex,
      species: req.body.species,
      email: req.body.email,
      password: req.body.password
    })
    //.then(db.Profile.create({
    //  name: req.body.username,
    //  age: req.body.age,
    //  sex: req.body.sex,
    //  species_id: req.body.species
    //}))
    .then(() => {
      res.redirect(307, "/api/login");
    }).catch(err => {
      res.status(401).json(err);
    });
    
  });

  // Route for logging user out
  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.post('/api/send-email', function (req, res) {
    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            // should be replaced with real sender's account
            user: 'donotreply.to.PetMatch@gmail.com',
            pass: '1+sCH33P\\/\/ine'
        }
    });
    let mailOptions = {
        // should be replaced with real recipient's account
        to: req.body.email,//'patelcatalina@gmail.com',
        subject: req.body.subject,
        text: req.body.message
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", (req, res) => {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        name: req.user.name,
        age: req.user.age,
        sex: req.user.sex,
        species: req.user.species,
        email: req.user.email,
        id: req.user.id
      });
    }
  });
};
