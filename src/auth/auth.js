const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const userDAO = require('../db/dao/userDAO');
const options = {};

passport.serializeUser((user, done) => { done(null, user.id); });

passport.deserializeUser(async (id, done) => {
 try{
    const user = await userDAO.query({id:id});
    done(null, user);
 }
 catch(err){
    done(err);
 }
});

passport.use(new LocalStrategy((username, password, done) => {
userDAO.query({username:username})
    .then(user => {
    if (username === user.username && password === user.password) {
        done(null, user);
    } else {
        done(null, false);
    }
    })
    .catch((err) => { done(err) });
}));