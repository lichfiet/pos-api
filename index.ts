import figlet from 'figlet'
import auth from './utils/auth';
import logger from './utils/logger';

const postRoutes: any = {
	'/user/login': async (req: Request) => {
		try {
			return new Response(JSON.stringify(await auth.token.create(req)), { headers: { 'Content-Type': 'application/json' } });
		} catch (error) {
			console.error('Error logging in user:', error);
			return new Response('Internal Server Error', { status: 500 });
		}
	},
	'/user/logout': async (req: Request) => {
		// TODO: Implement logout
		try {
			return new Response(JSON.stringify(await auth.token.invalidate(req)), { headers: { 'Content-Type': 'application/json' } });
		} catch (error) {
			console.error('Error logging out user:', error);
			return new Response('Internal Server Error', { status: 500 });
		}
	},
	'/user/register': async (req: Request) => {
		try {
			return new Response(JSON.stringify(await auth.user.register(req)), { headers: { 'Content-Type': 'application/json' } });
		} catch (error) {
			console.error('Error registering user:', error);
			return new Response('Internal Server Error', { status: 500 });
		}
	},
}

const getRoutes: any = {
	'/secret': async (req: Request) => {
		return new Response(figlet.textSync('Spencer likes boys \nand that is okay', { font: 'Ghost' }), { status: 201 })
	},
	'/user/auth': async (req: Request) => {
		return new Response(`${JSON.stringify(await auth.token.verify(req))}`)
	},
	'/health': async (req: Request) => {
		return new Response(JSON.stringify({ message: `She's a runnin'!`, status: 200, value: '' }), { headers: { 'Content-Type': 'application/json' } })
	}
}

const deleteRoutes: any = {
	'/user/delete': async (req: Request) => {
		try {
			return new Response(JSON.stringify(await auth.user.remove(req)), { headers: { 'Content-Type': 'application/json' } });
		} catch (error) {
			console.error('Error deleting user:', error); return new Response('Internal Server Error', { status: 500 });
		}
	},
}

const putRoutes: any = {
	'/user/update': async (req: Request) => { },
	'/user/inactivate': async (req: Request) => { },
	'/user/activate': async (req: Request) => { },
}

const server = Bun.serve({
	port: 8000,

	//more boiler plate --> this function runs every time this server is hit
	async fetch(req: Request) {

		const route = new URL(req.url).pathname
		const priviledgedRoutes: string[] = ['/user/logout', '/user/auth', '/user/delete', '/user/update', '/secret'];

		// if the route is priviledged, check the token validity
		if (priviledgedRoutes.includes(route)) {
			const authResponse: any = await auth.token.verify(req);
			
			if (authResponse.status !== 200) 
			{
				return new Response(JSON.stringify(authResponse), { headers: { 'Content-Type': 'application/json' } });
			} 
			else 
			{
				logger.info(`User ${authResponse.value.email} is accessing route ${route}`);
			}
		};

		switch (req.method) {
			case 'POST':
				if (postRoutes[route]) {
					return postRoutes[route](req)
				} else {
					return new Response(figlet.textSync('Route not found'), { status: 404 })
				}

			case 'GET':
				if (getRoutes[route]) {
					return getRoutes[route](req)
				} else {
					return new Response(figlet.textSync('Route not found'), { status: 404 })
				}

			case 'DELETE':
				if (deleteRoutes[route]) {
					return postRoutes[route](req);
				} else {
					return new Response(figlet.textSync('Route not found'), { status: 404 })
				}
			default:
				return new Response('HTTP request method not allowed', { status: 405 })


		}
	},
})

// if you run this in wsl it should open the port and map it to your windows machine
logger.info(`Listening on http://localhost:${server.port} ...`)
