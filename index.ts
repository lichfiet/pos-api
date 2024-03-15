import figlet from 'figlet'
import verifyJWT from './utils/auth';

const postRoutes: any = {
	'/login': async (req: Request) => {

		const reqBody: any = await req.json();

		const loginId: string = reqBody.loginId;
		const password: string = reqBody.password;

		try {
			console.log('Requesting token from Auth Server');
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
			return new Response(`{\n "token": "${body.token}"}`, {
				headers: {
					'Content-Type': 'application/json',
				},
			});
		} catch (error) {
			console.error('Error requesting token from Auth Server:', error);
			return new Response('Internal Server Error', { status: 500 });
		}
	},
	'/logout': async (req: Request) => {

		const reqHeaders: any = await req.headers;

		const access_token = reqHeaders.get('access_token');

		try {
			console.log('Requesting token from Auth Server');
			const response = await fetch('http://localhost:9011/api/logout', {
				method: 'POST',
				headers: {
					'Cookie': `access_token=${access_token}`,
				},
			});

			const body: any = await response.status;
			return new Response(`${body}`, {
				headers: {
					'Content-Type': 'application/json',
				},
			});
		} catch (error) {
			console.error('Error requesting token from Auth Server:', error);
			return new Response('Internal Server Error', { status: 500 });
		}
	},
}

const getRoutes: any = {
	'/secret': async (req: Request) => {
		return new Response(figlet.textSync('Spencer likes boys', { font: 'Ghost' }))
	},
	'/auth': async (req: Request) => {
		return new Response(`${await verifyJWT(req)}`)
	},
}

const server = Bun.serve({
	port: 8000,
	//more boiler plate --> this function runs every time this server is hit

	async fetch(req: Request) {
		const route = new URL(req.url).pathname

		switch (req.method) {
			case 'POST':
				if (postRoutes[route]) {
					return postRoutes[route](req)
				} else {
					return new Response(figlet.textSync('Route not found'), {
						status: 404,
					})
				}

			case 'GET':
				if (getRoutes[route]) {
					return getRoutes[route](req)
				} else {
					return new Response(figlet.textSync('Route not found'), {
						status: 404,
					})
				}

			default:
				return new Response('HTTP request method not allowed', { status: 405 })
		}
	},
})

// if you run this in wsl it should open the port and map it to your windows machine
console.log(`Listening on http://localhost:${server.port} ...`)
