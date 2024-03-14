import figlet from 'figlet'

//boiler plate
const server = Bun.serve({
	port: 8000,
	//more boiler plate --> this function runs every time this server is hit
	fetch(req) {
		const route = new URL(req.url).pathname
		if (route === '/secret') {
			return new Response(figlet.textSync('Spencer likes boys :)'))
		} else {
			const body = figlet.textSync(`${route}`)
			return new Response(body)
		}
	},
})

console.log(`Listening on http://localhost:${server.port} ...`)
