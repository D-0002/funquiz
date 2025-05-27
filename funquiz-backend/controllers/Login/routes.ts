 import { Hono } from 'hono';
 import { 
    loginController, 
    signupController,
 } from './index.js';
 
 const router = new Hono()
     .post('/api/login', loginController)
     .post('/api/signup', signupController)
 
 export default router 