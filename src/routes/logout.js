import * as cookie from 'cookie';

export async function get() {
    return {
        status: 302,
        headers: {
        location: '/',
        'Set-Cookie': cookie.serialize('session_id', "", {
            httpOnly: true,
            expires: new Date(Number(new Date()) - 315360000000),
            sameSite: "Strict",
            path: '/'
        })
        }
    }
}
