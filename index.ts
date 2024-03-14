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
		if (route === '/secret') {
			// figlet is text -> art
			return new Response(figlet.textSync('Spencer likes boys :)'))
		} else {
			const body = figlet.textSync(`${route}`)
			return new Response(body)
		}
	},
})

// if you run this in wsl it should map to your
console.log(`Listening on http://localhost:${server.port} ...`)
