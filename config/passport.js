const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const db = require('../functions/db').getDb();
const moment = require('moment');

const collection = db.collection('users');

/*  passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	collection.findOne({ _id: ObjectId(id) }).then((user) => {
		done(null, user);
	});
});  */

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.G_CLIENT_ID,
			clientSecret: process.env.G_CLIENT_SECRET,
			callbackURL: process.env.G_REDIRECT_URL,
		},
		async (accessToken, refreshToken, params, profile, done) => {
			const existingUser = await collection.findOne({ googleId: profile.id });
			if (existingUser) {
				console.log('Existing User', accessToken, refreshToken, params, profile);
				done(null, existingUser);
			} else {
				//convert params.expires_in which is in seconds to a unix timestamp of the time now + expires_in
				const expiryToken = params.expires_in = moment().add(params.expires_in, 'seconds').unix();
				const newUser = await collection.insertOne({
					googleId: profile.id,
					email: profile.emails[0].value,
					accessToken,
					refreshToken,
					expires_in: expiryToken,
				});
				done(null, newUser);
			}
		}
	)
);
