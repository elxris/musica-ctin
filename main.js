var http  = require('http'),
    util  = require('util'),
    fs    = require('fs'),
    jade  = require('jade'),
    less  = require('less'),
    parser= new(less.Parser)({paths: ['./less', './less/bootstrap']}),
    xprss = require('express'),
    app   = xprss(),
    server = http.Server(app),
    io    = require('socket.io')(server);


var viewsCache = {less: {}, jade: {}, js: {}};
var renderCSS = function(archivo, callback) {
  if (!viewsCache.less[archivo]) {
    fs.readFile('./less/'+archivo+'.less', {encoding: 'UTF-8', flag: 'r'}, function(err, data){
      if (err) {
        callback(err, null);
        return;
      }
      parser.parse(data, function(e, tree) {
        if (e) throw e;
        viewsCache.less[archivo] = tree.toCSS({compress: true});
        callback(null, viewsCache.less[archivo]);
      });
    });
  } else {
    callback(null, viewsCache.less[archivo]); 
  }
};
var renderHTML = function(archivo, callback) {
  if (!viewsCache.jade[archivo]) {
    fs.readFile('./jade/'+archivo+'.jade', {encoding: 'UTF-8', flag: 'r'}, function(err, data){
      if (err) {
        callback(err, null);
        return;
      }
      viewsCache.jade[archivo] = jade.compile(data, {filename: './jade/'+archivo+'.jade', debug: false});
      callback(null, viewsCache.jade[archivo]);
    });
  } else {
    callback(null, viewsCache.jade[archivo]);
  }
}
var renderJS = function(archivo, callback) {
  if (!viewsCache.jade[archivo]) {
    fs.readFile('./js/'+archivo+'.js', {encoding: 'UTF-8', flag: 'r'}, function(err, data){
      if (err) {
        callback(err, null);
        return;
      }
      viewsCache.jade[archivo] = data;
      callback(null, viewsCache.jade[archivo]);
    });
  } else {
    callback(null, viewsCache.jade[archivo]);
  }
}

var MongoClient = require('mongodb').MongoClient;
var MongoServer = require('mongodb').Server;
var mongoclient = new MongoClient(new MongoServer('localhost', 27017));
mongoclient.open(function (e, client) {
  var db = client.db('youtube');
  app.get('/:view', function(req, res, next){
    renderHTML(req.params.view, function(err, fn){
      if (err) {
        console.error(err);
        next();
        return;
      }
      res.send(fn({}));
    });
  });
  app.get('/static/css/:archivo.css', function(req, res, next){
    renderCSS(req.params.archivo, function(err, css){
      if (!err) {
        res.set('Content-Type', 'text/css')
        res.send(200, css);
      }else{
        console.error(err);
        next();
        return;
      }
    });
  });
  app.get('/static/js/:archivo.js', function(req, res, next){
    renderJS(req.params.archivo, function(err, css){
      if (!err) {
        res.set('Content-Type', 'text/css')
        res.send(200, css);
      }else{
        console.error(err);
        next();
        return;
      }
    });
  });
  app.get('*', function(req, res){
    db.collection('log', function(err, coll){
      if (err) {
        console.log(err);
        return;
      }
      coll.insert({'404': req.url}, function(err){
        if (err) throw err;
      });
    });
    res.send(404, "404: ¿Estás seguro que estaba aquí?");
  });
  server.listen(8080);
  console.log('Servidor abierto en el puerto 8080');
});