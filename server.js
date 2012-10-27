var http = require("http");
var fs = require("fs");

var handler = function(req, res)
{
    fs.readFile ("." + req.url, function(err, data)
    {
        if (err)
        {
            res.writeHead(404);
            return res.end("File not found.");
        }

        res.writeHead(200);
        res.end(data);
    });
}

var game_server = http.createServer(handler);
game_server.listen(8080);
