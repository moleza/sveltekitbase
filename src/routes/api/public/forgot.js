import fetch from "node-fetch";
import { API_URL,AES_KEY } from '$lib/constants';
import isEmail from 'validator/lib/isEmail';
import isAlpha from 'validator/lib/isAlpha';
import normalizeEmail from 'validator/lib/normalizeEmail';
import { encrypt,decrypt } from '$lib/Aes256Gcm.js';
import { daysBetweenDates } from '$lib/dateUtils.js';
import base64url from "base64url";

export async function post({request}) {
    try {
        
        let body = await request.json();
        
        let error = {email:'',token:'',pass:'',option:''};

        try {
            if (Object.prototype.toString.call(body) === "[object Uint8Array]") {
                body = JSON.parse(new TextDecoder().decode(body));
            }
        } catch(err) {
            console.error("ConversionError:",err);
        }

        //Option Validation
        if (body.option) {
            if (body.option != "new" && body.option != "update") {
                error.option = 'Invalid Option Sent!'
            }
        } else {
            error.option = 'Invalid Option!'
        }

        //Email Validation
        if (!body.email) {
            error.email = "Email is required!"
        }
        if (error.email == '') {
            if (!isEmail(body.email)) {
                error.email = "Invalid Email Address!";
            }
        }

        if (body.option == "new") {
            if (error.email == "" && error.option == "") {
                const response = await fetch(API_URL+"api/user/forgot/send", {
                    method: 'POST',
                    body: encrypt(normalizeEmail(body.email.trim()),AES_KEY),
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    let json = await response.json();
                    if (json.status == "success") {
                        return {
                            status: 200, 
                            body : { 
                                status:"success"
                            }
                        }
                    } else {
                        return {
                            status: 200, 
                            body : { 
                                status:"failed"
                            }
                        }
                    }
                } else {
                    return {
                        status: 500, 
                        body : { 
                            status:"error", 
                            message:"ERROR with Forgot Password"
                        }
                    }
                }
            } else {
                return {
                    status: 422, 
                    body : { 
                        status:"error", 
                        message:error
                    }
                }
            }
        }
        
        if (body.option == "update") {

            //Password Validation
            if (!body.token) {
                error.token = "Token is required!"
            }

            //Password Validation
            if (!body.pass) {
                error.pass = "Password is required!"
            }
            
            if (error.email == "" && error.token == "" && error.pass == "" && error.option == "" && body.option == "update") {
                const response = await fetch(API_URL+"api/user/forgot/update", {
                    method: 'POST',
                    body: JSON.stringify({ "email": normalizeEmail(body.email.trim()), "password": encrypt(body.pass,AES_KEY), "token":body.token }),
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    let json = await response.json();
                    if (json.status == "success") {
                        return {
                            status: 200, 
                            body : { 
                                status:"success"
                            }
                        }
                    } else {
                        return {
                            status: 400, 
                            body : { 
                                status:"failed"
                            }
                        }
                    }
                } else {
                    return {
                        status: 500, 
                        body : { 
                            status:"error", 
                            message:"ERROR Forgot Password"
                        }
                    }
                }
            } else {
                return {
                    status: 422, 
                    body : { 
                        status:"error", 
                        message:error
                    }
                }
            }
        }

        return {
            status: 500, 
            body : { 
                status:"error", 
                message:"ERROR Forgot Password None"
            }
        }
    } catch(ex) {
        console.error(ex);
        return {
            status: 500, 
            body : { 
                status:"error", 
                message:ex.message
            }
        } 
    }
  }

  export async function get({url}) {
    try {
        const urlSearchParams = new URLSearchParams(url.searchParams);
        let email = urlSearchParams.get("email");
        if (email) {
            let decrypted = decrypt(base64url.decode(email), AES_KEY);
            let split = decrypted.split("|");
            let expire = new Date(parseInt(split[split.length - 1]));
            if (daysBetweenDates(new Date(),expire) > 8) {
                return {
                    status: 410, 
                    body : { 
                        status: "expired"
                    }
                }
            } else {
                return {
                    status: 200, 
                    body : { 
                        status:"valid",
                        email:split[split.length-2]
                    }
                }
            }
        } 

        return {
            status: 500, 
            body : { 
                status:"error", 
                message:"No Email Address!"
            }
        }     
    } catch(ex) {
        console.error(ex);
        return {
            status: 500, 
            body : { 
                status:"error", 
                message:ex.message
            }
        } 
    }
  }