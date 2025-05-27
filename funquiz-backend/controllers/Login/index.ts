import { type  Context } from "hono"
import { 
    signupData,
    loginData
} from "../../data/Login.js"


export function signupController(c: Context) {
    return signupData(c);
  }

  export function loginController(c: Context) {
    return loginData(c);
  }