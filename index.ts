import figlet from 'figlet'
import auth from './utils/auth';

const postRoutes: any = {
	'/login': async (req: Request) => {
		try {
			return new Response(JSON.stringify(await auth.token.create(req)), { headers: { 'Content-Type': 'application/json' } });
		} catch (error) {
			console.error('Error requesting token from Auth Server:', error);
			return new Response('Internal Server Error', { status: 500 });
		}
	},
	'/logout': async (req: Request) => {
		// TODO: Implement logout
		try {
			return new Response(JSON.stringify(await auth.token.invalidate(req)), { headers: { 'Content-Type': 'application/json' } });
		} catch (error) {
			console.error('Error requesting token from Auth Server:', error);
			return new Response('Internal Server Error', { status: 500 });
		}
	},
}

const getRoutes: any = {
	'/secret': async (req: Request) => {

		return new Response(figlet.textSync('Spencer likes boys \nand that is \nsus amongus', { font: 'Ghost' }), {status: 201})
	},
	'/auth': async (req: Request) => {
		return new Response(`${JSON.stringify(await auth.token.verify(req))}`)
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
					if (route === '/login' || route === '/register') {
						return postRoutes[route](req)
					} else {
						const token: any = await auth.token.verify(req);
						const tokenStatus = (await token)
						console.log(tokenStatus);
						if (await token.status !== 200) {
							return new Response(token.message, { status: token.status });
						} else {
							return postRoutes[route](req)
						}
					}
				} else {
					return new Response(figlet.textSync('Route not found'), {
						status: 404,
					})
				}

			case 'GET':
				if (getRoutes[route]) {
					if (route === '/health' || route === '/testing') {
						return getRoutes[route](req)
					} else {
						const token: any = await auth.token.verify(req);
						const tokenStatus = (await token)
						console.log(tokenStatus);
						if (await token.status !== 200) {
							return new Response(JSON.stringify(token), { status: token.status, headers: { 'Content-Type': 'application/json' } });
						} else {
							return getRoutes[route](req)
						}
					}
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
