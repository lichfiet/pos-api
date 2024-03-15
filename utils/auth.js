/**
 * TLDR of how the auth works
 * 
 * 1. You hit the fushionauth url and port at /api/login, with request body:
 *  {
 *  "loginId": "test@email.com",
 *  "password": "password",
 *  "applicationId": "895f0bde-71bb-45d0-930a-c2fd80f01a19"
 *  }  
 * and optionally the X-Authorization header, with api key
 *
 * 2. You get the token from the response, and use it as the Bearer token in the bun api request
 *  (ex. Header > "authorization": "Bearer <token>")
 * 
 * 3. When the route is called, it will pass the token from the header into this function, which will verify the token
 * against the jwks endpoint, and return the decoded token if it is valid,
 * 
 * TLDR; If the token you received when you authenticated, is decoded successfully, you are authenticated
 */

const jose = require('jose');
require('dotenv').config({ path: '../.env' });



// uses jose to decode json tokens, this looks for valid public tokens at an endpoint to check against supplied tokens
const jwksClient = jose.createRemoteJWKSet(
    new URL(`${process.env.BASE_URL}/.well-known/jwks.json`)
    // The URL of the JWKS endpoint, fusionauth url+port (ex: http://localhost:9011/.well-known/jwks.json)
);



// This function is called when the route is hit, and the token is passed in the header
const verifyJWT = async (req, res, next) => {
    console.log('Authorizing...');

    /** extracts the token from the header, "Bearer <token>" gets turned into raw "<token>" */
    const authHeader = req.headers.get('authorization')
    const tokenFromHeader = authHeader ? authHeader.split(' ')[1] : null;
    const access_token = tokenFromHeader // || req.cookies.get(access_token); // if using cookies


    if (!access_token) {
        return new Response('Unauthorized, missing token')
    } else {
        try {
            const result = await jose.jwtVerify(access_token, jwksClient, {
                issuer: process.env.BASE_URL,
                audience: process.env.CLIENT_ID,
            });

            console.log(result.payload.preferred_username);
            return (`${JSON.stringify({message: 'Authorized', email: result.payload.preferred_username, status: 200})}`);
        } catch (e) {
            if (e instanceof jose.errors.JOSEError) {
                console.dir(`${e.code} JWT Token Error: ${e.message}`);
                return (`Error: ${e.message}`);
            } else {
                console.dir(`Internal server error: ${e}`);
                return new Response({ error: JSON.stringify(e) }, { status: 500 });
            }
        }
    }
};

module.exports = verifyJWT;