 import { Hono } from 'hono';
 import { 
    loginController, 
    signupController,
    updateUserScoreController,
    getLeaderboardController,
    updateProfilePictureController,
    getUserController,
    updateUserProfileController,
 } from './index.js';
 
 const router = new Hono()
     .post('/api/login', loginController)
     .post('/api/signup', signupController)
     .post('/api/update-score', updateUserScoreController)
     .get('/api/leaderboard', getLeaderboardController)
     .post('/api/user/profile-picture', updateProfilePictureController)
     .get('/api/user/:userId', getUserController)
     .put('/api/user/profile/:userId', updateUserProfileController); 


 export default router 