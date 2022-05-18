import fetch from "node-fetch";
import { API_URL } from '$lib/constants';
import isEmail from 'validator/lib/isEmail';
import isAlpha from 'validator/lib/isAlpha';
import normalizeEmail from 'validator/lib/normalizeEmail';

export async function post({request}) {
    try {
        
        let body = await request.json();
        
        let error = {name:'',surname:'',email:'',pass:''};

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

        //Password Validation
        if (!body.pass) {
            error.pass = "Password is required!"
        }
        
        if (error.name == "" && error.surname == "" && error.email == "" && error.pass == "") {
            const response = await fetch(API_URL+"api/user/register", {
                method: 'POST',
                body: JSON.stringify({ name: body.name.trim(), surname: body.surname.trim(), email: normalizeEmail(body.email.trim()), password: body.pass }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                let json = response.json();
                return {
                    status: 200, 
                    body : { 
                        status:"success"
                    }
                }
            } else {
                return {
                    status: 500, 
                    body : { 
                        status:"error", 
                        message:"ERROR Registering"
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

  export async function get({url}) {
    try {
        const urlSearchParams = new URLSearchParams(url.searchParams);
        let email = normalizeEmail(urlSearchParams.get("email"));
        if (email) {
            if (isEmail(email)) {
                const response = await fetch(API_URL+"api/user/email/check", {
                    method: 'POST',
                    body: email,
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    let json = await response.json();
                    let found = true;
                    if (json === "false" || json === false) { 
                        found = false;
                    } 
                    return {
                        status: 200, 
                        body : { 
                            found:found
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