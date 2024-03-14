import figlet from 'figlet'
import verifyJWT from './auth/verifyJWT';
import hasRole from './auth/hasRole';

const postRoutes: any = {
	'/api/login': async (req: Request) => {
		try {
			const body = (await req.json()) as {
				username: string
				password: string
			}
			if (!body.username) {
				return new Response('Please input a valid username.', { status: 400 })
			} else if (!body.password) {
				return new Response('Please input a valid password.', { status: 400 })
			}
			return new Response(`hit login endpoint with ${JSON.stringify(body)}`)

		} catch {
			return new Response('Invalid JSON', { status: 400 })
		}
	},
}

const getRoutes: any = {
	'/secret': async (req: Request) => {
		return new Response(figlet.textSync('Spencer likes boys', { font: 'Ghost' }))
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
