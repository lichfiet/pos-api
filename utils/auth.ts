/**
 * TLDR of how the auth works
 * 
 * 1. You hit the fushionauth url and port at /api/login (auth.token.create()), with request body:
 *  {
 *  "loginId": "test@email.com",
 *  "password": "password",
 *  "applicationId": "895f0bde-71bb-45d0-930a-c2fd80f01a19" // this is filled in automatically with the auth.token.create() function
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

import logger from './logger';

// uses jose to decode jwt tokens, this looks for valid public tokens at an endpoint to check against supplied tokens
const jwksClient = jose.createRemoteJWKSet(
    new URL(`${process.env.BASE_URL}/.well-known/jwks.json`)
    // The URL of the JWKS endpoint, fusionauth url+port (ex: http://localhost:9011/.well-known/jwks.json)
);

class AuthResponse {
    message: string;
    status: number;
    value: any;
    
    constructor(message: string, status: number, value: any) {
        this.message = message;
        this.status = status;
        this.value = value;
    }
}

const auth = {
    token: {
        // This function is called when a route is hit, and the token is passed in the header
        verify: async (req: Request) => {
            logger.info('Authorizing...');

            /** extracts the token from the header, "Bearer <token>" gets turned into raw "<token>" */
            const authHeader = req.headers.get('authorization')
            const tokenFromHeader = authHeader ? authHeader.split(' ')[1] : null;
            const access_token = tokenFromHeader // || req.cookies.get(access_token); // if using cookies


            if (!access_token) {
                return new AuthResponse('Bad request, missing token', 400, '');
            } else {
                try {
                    const result = await jose.jwtVerify(access_token, jwksClient, {
                        issuer: process.env.BASE_URL,
                        audience: process.env.CLIENT_ID,
                    });

                    return new AuthResponse('Authorized', 200, { email: result.payload.email });
                } catch (e: any) {
                    if (e instanceof jose.errors.JOSEError) {
                        console.dir(`${e.code} JWT Token Error: ${e.message}`);
                        return new AuthResponse(`Error: ${e.message}`, 401, '');
                    } else {
                        console.dir(`Internal server error: ${e}`);
                        return ({ error: JSON.stringify(e), status: 500 });
                    }
                }
            }
        },
        invalidate: async (req: Request) => {

        },
        create: async (req: Request) => {
            const reqBody: any = await req.json();
    
            const loginId: string = reqBody.loginId;
            const password: string = reqBody.password;
    
            try {
                logger.info('Requesting token from Auth Server');
                const response = await fetch('http://localhost:9011/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        applicationId: `${process.env.APPLICATION_ID}`,
                        loginId: `${loginId}`,
                        password: `${password}`,
                    }),
                });
    
                const body: any = await response.json();
                return new AuthResponse('Authenticated', 200, {token: `${body.token}`});
    
            } catch (error) {
                console.error('Error requesting token from Auth Server:', error);
                return new AuthResponse('Internal Server Error', 500, '');
            }
        },
    },
    user: {
        register: async (req: Request) => {
            const reqBody: any = await req.json();
    
            const email: string = reqBody.email;
            const name: string = reqBody.name;
            const password: string = reqBody.password;
    
            try {
                logger.info('Requesting user registration from Auth Server');
                const response = await fetch('http://localhost:9011/api/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${process.env.FUSION_API_KEY}`
                    },
                    body: JSON.stringify({
                        applicationId: `${process.env.APPLICATION_ID}`,
                        user: {
                            email: `${email}`,
                            firstName: `${name}`,
                            password: `${password}`
                        },
                        email: `${email}`
                    }),
                });

                const body: any = await response.json();

                if (response.status === 200) {
                    return new AuthResponse('User Registered', 201, body);
                } else {
                    return new AuthResponse('User Registration Failed', response.status, body);
                }
    
            } catch (error) {
                console.error('Error requesting token from Auth Server:', error);
                return new AuthResponse('Internal Server Error', 500, '');
            }
        },
        modify: async (req: Request) => {},
        remove: async (req: Request) => {
            const reqBody: any = await req.json();
            const userId: string = reqBody.userId;

            try {
                logger.info('Requesting user registration from Auth Server');
                const response = await fetch(`http://localhost:9011/api/user/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${process.env.FUSION_API_KEY}`
                    },
                });

                const body: any = await response.json();

                if (response.status === 200) {
                    return new AuthResponse('User Deleted', 200, body);
                } else {
                    return new AuthResponse('Unable to Delete User', response.status, body);
                }
    
            } catch (error) {
                console.error('Error requesting deletion from Auth Server:', error);
                return new AuthResponse('Internal Server Error', 500, '');
            }
        },
        deactivate: async (req: Request) => {},
        activate: async (req: Request) => {},
        api: {
            createKey: async (req: Request) => {},
            removeKey: async (req: Request) => {},
        }
    },
};


export default auth;