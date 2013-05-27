var spawn   = require('child_process').spawn
  , connect = require('connect')
  , _       = require('underscore')
  , path    = require('path');

var logdir = process.env.NODE_LOG_DIR || __dirname
  , port = process.env.NODE_PORT || 2112;

var app = connect()
  .use(connect.query())

  .use(function(req, res){
    if(!/curl/.test(req.headers['user-agent'])) {
      res.writeHead(406);
      res.write("Agent: "+req.headers['user-agent']);
      res.write("\nCurrently unsupported.");
      res.write("\nTry curl instead.");
      res.end("\n\nBye bye!");
      console.error("Trying to use an agent other than curl. Prevented.");
      return;
    }

    res.writeHead(200,{"Content-Type": "text/plain"});

    var filename = _.keys(req.query)[0];
    if(filename.split('.').pop() !== "log") {
      filename = filename+".log";
    }
    var filepath = path.join(logdir, filename);

    console.log("Streaming ", filepath);
    res.write("Streaming "+ filepath);

    var tail = spawn('tail', ['-f', filepath]);
    tail.stdout.pipe(res);
    tail.stderr.pipe(res);

  })

  .listen(port, function () {
    console.log('Running server on port '+port);
    console.log('Serving file from '+logdir);
  });