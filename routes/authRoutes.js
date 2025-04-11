// import express from 'express';
// import passport from 'passport';

// const router = express.Router();

// // Route to trigger Google OAuth
// router.get('/google', passport.authenticate('google', {
//   scope: ['profile', 'email']
// }));

// // Callback route Google redirects to
// router.get('/google/callback',
//   passport.authenticate('google', { failureRedirect: '/' }),
//   (req, res) => {
//     // Successful login
//     res.redirect('/dashboard'); // or wherever you want
//   }
// );

// // Logout route
// router.get('/logout', (req, res, next) => {
//     req.logout(function (err) {
//       if (err) return next(err);
//       req.session = null; // 🔐 Destroys the session properly
//       res.redirect('/');
//     });
//   });

// // Get current user (for frontend session check)
// router.get('/current-user', (req, res) => {
//   res.send(req.user);
// });




// // Route to trigger Facebook OAuth
// router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// // Facebook callback
// router.get('/facebook/callback',
//   passport.authenticate('facebook', {
//     failureRedirect: '/',
//     successRedirect: '/dashboard'
//   })
// );

// export default router;




// /*
// <script>
//   window.fbAsyncInit = function() {
//     FB.init({
//       appId      : '{your-app-id}',
//       cookie     : true,
//       xfbml      : true,
//       version    : '{api-version}'
//     });
      
//     FB.AppEvents.logPageView();   
      
//   };

//   (function(d, s, id){
//      var js, fjs = d.getElementsByTagName(s)[0];
//      if (d.getElementById(id)) {return;}
//      js = d.createElement(s); js.id = id;
//      js.src = "https://connect.facebook.net/en_US/sdk.js";
//      fjs.parentNode.insertBefore(js, fjs);
//    }(document, 'script', 'facebook-jssdk'));
// </script>



// {
//     status: 'connected',
//     authResponse: {
//         accessToken: '...',
//         expiresIn:'...',
//         signedRequest:'...',
//         userID:'...'
//     }
// }

// function checkLoginState() {
//     FB.getLoginStatus(function(response) {
//       statusChangeCallback(response);
//     });
//   }
// */



import express from 'express';
import passport from 'passport';
import { handleSocialAuth, handleOtpLogin } from '../controllers/authController.js';

const router = express.Router();

// ---------- GOOGLE AUTH ----------

// Trigger Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// Google OAuth Callback → custom controller to return JWT
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  handleSocialAuth
);

// ---------- FACEBOOK AUTH ----------

// Trigger Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Facebook OAuth Callback → custom controller to return JWT
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/' }),
  handleSocialAuth
);

// ---------- OTP LOGIN (Firebase) ----------
router.post('/verify-otp', handleOtpLogin);

// ---------- LOGOUT ----------
router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.session = null;
    res.redirect('/');
  });
});

// ---------- GET CURRENT USER ----------
router.get('/current-user', (req, res) => {
  res.send(req.user || null);
});

export default router;
