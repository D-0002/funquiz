import { type  Context } from "hono"
import { 
    signupData,
    loginData,
    updateUserScoreData,
    getLeaderboardData,
    getUserData,
    updateProfilePictureData,
    updateUserProfileData,
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

export function getUserController(c: Context) {
    return getUserData(c);
  }

export function updateProfilePictureController(c: Context) {
    return updateProfilePictureData(c);
  }

export function updateUserProfileController(c: Context) {
    return updateUserProfileData(c);
  }