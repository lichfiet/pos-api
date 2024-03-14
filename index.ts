import figlet from 'figlet'

//boiler plate
const server = Bun.serve({
	port: 8000,
	//more boiler plate --> this function runs every time this server is hit
	fetch(req) {
		// this is everything that follows the last / in a url.
		// for example, https://wickedcrazy.com/i/love/hot/girls
		// our "route" variable would be /i/love/hot/girls
		const route = new URL(req.url).pathname
		// if the request is a POST and the route is /api/login
		// we return a response with a status of 200 and the body
		// "hit login endpoint"
		if (req.method === 'POST' && route === '/api/login') {
			return new Response('hit login endpoint', { status: 200 })
		} else if (req.method === 'GET' && route === '/secret') {
			// figlet is text -> art
			return new Response(
				figlet.textSync('Spencer likes boys :)', { font: 'Ghost' })
			)
		} else {
			const body = figlet.textSync(`${route}`)
			return new Response(body)
		}
	},
})

// if you run this in wsl it should open the port and map it to your windows machine
console.log(`Listening on http://localhost:${server.port} ...`)
