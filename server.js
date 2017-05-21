let config = {};
try {
	config = require(`${__dirname}/server.config.json`);
	if (!config.host) throw new Error();
} catch (e) {
	console.error(`\n  error: please create file "server.config.json" included a field "host"\n`);
	process.exit(1);
}

let API_HOST = config.host;
let API_SERVER = `http://${API_HOST}/`;
let PORT = 8000;
let Express = require('express'),
	proxy = require('http-proxy-middleware'),	
	log = require('morgan'),
	app = Express();

app.use(log('dev'));
app.use(Express.static('dist'));
app.use('/work', proxy({
	target: API_SERVER,
	changeOrigin: true,
	// eslint-disable-next-line no-unused-vars
	onProxyReq: (proxyReq, req, res) => {
		proxyReq.setHeader('referer', API_SERVER);
		proxyReq.setHeader('host', API_HOST);
	}
}));

app.listen(PORT);
console.log(`server listening on ${PORT}`);

