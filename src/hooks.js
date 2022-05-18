import cookie from 'cookie';
import { decodeCookie } from '$lib/cookieUtils';

export async function handle({ event, resolve }) {

  // console.log("[HOOKS][HANDLE]:EVENT:",event);
  // console.log("[HOOKS][HANDLE]:REQUEST:",event.request);
  // console.log("[HOOKS][HANDLE]:HEADERS:",event.request.headers);

  const cookies = cookie.parse(event.request.headers.get('cookie') || '');

  if(!cookies.session_id) {
    event.locals.authenticated = false;
  } else {
    try {
      let userSession = decodeCookie(cookies.session_id);
      if(userSession) {
        // console.log("[HOOKS][HANDLE][UserSession]:",userSession);
        event.locals.authenticated = true;
        event.locals.user = userSession;
      } else {
        event.locals.authenticated = false;
      }
    } catch(ex) {
      console.error("HOOK ERROR:",ex);
      event.locals.authenticated = false;
    }
  }

  const response = await resolve(event);
  
  return response;
}

export function getSession(event) {
  // console.log("[HOOKS][GETSESSION]:EVENT:",event);
  // console.log("[HOOKS][GETSESSION]:LOCALS:",event.locals);
  if (!event.locals.authenticated || event.locals.user == null) {
    return {
      authenticated: false,
      user: null
    }
  } else {
    return {
      authenticated: event.locals.authenticated,
      user: event.locals.user
    }
  }
}