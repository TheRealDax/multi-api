const router = require('express').Router();
const passport = require('passport')

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.modify'],
    accessType: 'offline'
}));

// Callback
router.get('/google/redirect', passport.authenticate('google', {
    session: false,
}), (req, res) =>{
    res.redirect('/public/gauthsuccess.html');
});


module.exports = router;