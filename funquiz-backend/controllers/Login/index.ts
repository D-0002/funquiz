import { type  Context } from "hono"
import { 
    signupData,
    loginData,
    updateUserScoreData,
    getLeaderboardData,
} from "../../data/Login.js"


export function signupController(c: Context) {
    return signupData(c);
  }

export function loginController(c: Context) {
    return loginData(c);
  }

export function updateUserScoreController(c: Context) {
    return updateUserScoreData(c);
  }

export function getLeaderboardController(c: Context) {
    return getLeaderboardData(c);
  }