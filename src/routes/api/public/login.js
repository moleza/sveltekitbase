import fetch from "node-fetch";
import { API_URL } from '$lib/constants';
import { encodeCookie } from "../../../lib/cookieUtils";
import cookie from 'cookie';
import isEmail from 'validator/lib/isEmail';
import normalizeEmail from 'validator/lib/normalizeEmail';

export async function post({request}) {
    try {
        
        let body = await request.json();
        
        let valid = false;

        try {
            if (Object.prototype.toString.call(body) === "[object Uint8Array]") {
                body = JSON.parse(new TextDecoder().decode(body));
            }
        } catch(err) {
            console.error("ConversionError:",err);
        }

        if (body.email) {
            if (isEmail(body.email)) {
                valid = true;
            }
        }

        if (!body.pass) {
            valid = false;
        }
    
        if (valid) {

            const response = await fetch(API_URL+"login", {
                method: 'POST',
                body: JSON.stringify({username:normalizeEmail(body.email),password:body.pass}),
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status == 401) {
                return {
                    status: 401, 
                    body : { 
                        status: "failed"
                    }
                }
            } else if (response.ok) {

                let json = await response.json();

                let userDetails = await fetch(API_URL+"api/user/email/"+json.username, {
                    headers: { 
                        'Content-Type': 'application/json', 
                        Authorization: `Bearer ${json.access_token}`,
                    },
                });

                let json2 = await userDetails.json();

                let user = { username: json.username, roles: json.roles, token: json.access_token, name: json2.name, surname: json2.surname, created: new Date(), expires: json.expires_in};
                let userBody = { username: json.username, roles: json.roles, name: json2.name, surname: json2.surname, created: new Date(), expires: json.expires_in};

                return {
                    status: 200, 
                    headers: {
                        'Set-Cookie': cookie.serialize('session_id', encodeCookie(user), {
                            httpOnly: true,
                            maxAge: 60 * 60,
                            sameSite: "Strict",
                            path: '/'
                        })
                    },
                    
                    body : { 
                        status:"success",
                        user:userBody
                    }
                }
            } else {
                return {
                    status: 500, 
                    body : { 
                        status:"error", 
                        message:"ERROR Authenticating"
                    }
                }
            }
        } else {
            return {
                status: 422, 
                body : { 
                    status:"error", 
                    message:"Invalid Email Address or Password"
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