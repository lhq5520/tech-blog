// Import dependencies
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import {User} from '../models/User'

// Admin email whitelist from env (comma-separated)
const whitelists = process.env.ADMIN_EMAILS;
const adminEmails = whitelists?.split(",");

// Configure Passport strategy
passport.use(
  new GoogleStrategy(
    {
      // Google OAuth credentials (from env)
      clientID: process.env.GOOGLE_CLIENT_ID!, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      
      // OAuth callback URL
      callbackURL: '/api/auth/google/callback' 
    },
    // Verify callback with Google profile
    async (accessToken, refreshToken, profile: Profile, done) => {
      try {
        // 1) Get email from profile
        const email = profile.emails?.[0]?.value;

        // 2) Enforce admin whitelist
        if (!email || !adminEmails?.includes(email)) {
          return done(null, false, { message: 'Unauthorized email' });
        }

        // 3) Find user by email
        let user = await User.findOne({ email })

        // 4) Create or update user
        if (!user) {
          // Create new user
          user = await User.create({ 
            email, 
            googleId: profile.id 
          });

        } else {
          // Update missing googleId
          if (!user.googleId){
            user.googleId = profile.id;
            await user.save();
          }
        }

        // 5) Done
        return done(null, user);

      } catch (error) {
        // Handle errors
        return done(error, false);
      }
    }
  )
);

// Export passport
export default passport;