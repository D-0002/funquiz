 import { Hono } from 'hono';
 import { 
    loginController, 
    signupController,
    updateUserScoreController,
    getLeaderboardController,
    updateProfilePictureController,
    getUserController,
 } from './index.js';
 
 const router = new Hono()
     .post('/api/login', loginController)
     .post('/api/signup', signupController)
     .post('/api/update-score', updateUserScoreController)
     .get('/api/leaderboard', getLeaderboardController)
     .post('/api/user/profile-picture', updateProfilePictureController)
     .get('/api/user/:userId', getUserController); 


 export default router 