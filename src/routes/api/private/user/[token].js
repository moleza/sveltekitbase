import fetch from "node-fetch";
import { API_URL, AES_KEY } from '$lib/constants';
import isEmail from 'validator/lib/isEmail';
import isAlpha from 'validator/lib/isAlpha';
import isJWT from 'validator/lib/isJWT';
import isMobilePhone from "validator/lib/isMobilePhone";
import isDate from 'validator/lib/isDate';
import normalizeEmail from 'validator/lib/normalizeEmail';
import { encrypt } from '$lib/Aes256Gcm.js';

export async function post({request, params}) {
    try {
        
        let body = await request.json();
        
        let error = {name:'',surname:'',email:'',mobile:'',gender:'',birthdate:''};

        try {
            if (Object.prototype.toString.call(body) === "[object Uint8Array]") {
                body = JSON.parse(new TextDecoder().decode(body));
            }
        } catch(err) {
            console.error("ConversionError:",err);
        }

        //Name Validation
        if (!body.name) {
            error.name = "Name is required!"
        }
        if (error.name == '') {
            if (!isAlpha(body.name,'en-GB',{ignore: ' '})) {
                error.name = "Invalid Name (Alpha Only)!";
            }
        }

        //Surname Validation
        if (!body.surname) {
            error.surname = "Surname is required!"
        }
        if (error.surname == '') {
            if (!isAlpha(body.surname,'en-GB',{ignore: ' '})) {
                error.surname = "Invalid Surname (Alpha Only)!";
            }
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

        if (body.mobile) {
            if (!isMobilePhone(body.mobile,'any')) {
                error.mobile = "Invalid Mobile Number!";
            }
        }

        if (body.gender) {
            if (body.gender != "Male" || body.gender != "Female") {
                error.gender = "Invalid Gender!";
            }
        }
        
        if (body.birthdate) {
            if (!isDate(body.birthdate)) {
                error.birthdate = "Invalid Birthday!";
            }
        }

        if (error.name == "" && error.surname == "" && error.email == "" && error.mobile == "" && error.gender == "" && error.birthdate == "" && isJWT(params.token)) {
            const response = await fetch(API_URL+"api/user/profile", {
                method: 'POST',
                body: JSON.stringify({ name: body.name.trim(), surname: body.surname.trim(), email: normalizeEmail(body.email.trim())}),
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${params.token}` }
            });

            if (response.ok) {
                let json = await response.json();
                return {
                    status: 200, 
                    body : { 
                        status:"success"
                    }
                }
            } else {
                return {
                    status: response.status, 
                    body : { 
                        status:"error", 
                        message:"ERROR Updating"
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

  export async function put({request, params}) {
    try {

        let body = await request.json();
        
        let error = {current:'',password:'',retype:''};

        try {
            if (Object.prototype.toString.call(body) === "[object Uint8Array]") {
                body = JSON.parse(new TextDecoder().decode(body));
            }
        } catch(err) {
            console.error("ConversionError:",err);
        }

        //Current Password Validation
        if (!body.current) {
            error.current = "Current Password is required!"
        }

        //New Password Validation
        if (!body.password) {
            error.password = "Current Password is required!"
        }

        //Retype Password Validation
        if (!body.retype) {
            error.retype = "Compare Password is required!"
        }
        if (error.password == '' && error.retype == '') {
            if (body.password !== body.retype) {
                error.retype = "Passwords do not match!"
            }
        }
        
        if (error.current == "" && error.password == "" && error.retype == "" && isJWT(params.token)) {
            const response = await fetch(API_URL+"api/user/password", {
                method: 'POST',
                body: JSON.stringify({ oldpassword: encrypt(body.current,AES_KEY), newpassword: encrypt(body.password,AES_KEY) }),
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${params.token}` }
            });

            if (response.ok) {
                let json = await response.json();
                return {
                    status: 200, 
                    body : { 
                        status:"success"
                    }
                }
            } else {
                return {
                    status: response.status, 
                    body : { 
                        status:"error", 
                        message:"ERROR Updating"
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

  export async function get({params}) {
    try {
        if (params.token) {
            if (isJWT(params.token)) {
                let response = await fetch(API_URL+"api/user/info", {
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${params.token}` }
                });
                if (response.ok) {
                    let json = await response.json();
                    let user = json;
                    user.mobile = "";
                    user.gender = "";
                    user.birthdate = "";
                    let response2 = await fetch(API_URL+"api/user/profile", {
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${params.token}` }
                    });
                    if (response2.ok) {
                        let json2 = await response2.json();
                        user.mobile = json2.mobile;
                        user.gender = json2.gender;
                        user.birthdate = json2.birhtdate;
                        return {
                            status: 200, 
                            body : { 
                                user:user
                            }
                        }
                    } else {
                        return {
                            status: 200, 
                            body : { 
                                user:user
                            }
                        }
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