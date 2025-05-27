 import { Hono } from 'hono';
 import { 
    loginController, 
    signupController,
    updateUserScoreController,
    getLeaderboardController,
 } from './index.js';
 
 const router = new Hono()
     .post('/api/login', loginController)
     .post('/api/signup', signupController)
     .post('/api/update-score', updateUserScoreController)
     .get('/api/leaderboard', getLeaderboardController);

 export default router 