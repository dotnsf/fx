//. app.js
var express = require( 'express' ),
    axios = require( 'axios' ),
    app = express();

app.use( express.Router() );

var fxserver = 'http://www.gaitame.com/rate/neo20/rate_UTF8.asp';

var settings_cors = 'CORS' in process.env ? process.env.CORS : '';

app.get( '/', function( req, res ){
  res.contentType( 'application/json; charset=UTF-8' );
  if( settings_cors ){
    res.setHeader( 'Access-Control-Allow-Origin', settings_cors );
  }

  axios.get( fxserver ).then( function( result ){
    var rate = {};
    var csv = result.data;
    csv = csv.split( "\r" ).join( "" );
    var lines = csv.split( "\n" );
    for( var i = 0; i < lines.length; i ++ ){
      var line = lines[i];
      var x = line.split( "," );
      if( x.length > 1 ){
        var name = x[0];
        var bid = x[1];
        rate[name] = parseFloat( bid );
      }
    }

    var datetime = timestamp2datetime( ( new Date() ).getTime() );

    res.write( JSON.stringify( { status: true, datetime: datetime, rate: rate }, null, 2 ) );
    res.end();
  }).catch( function( err ){
    console.log( err );
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: err }, null, 2 ) );
    res.end();
  });
});

function timestamp2datetime( ts ){
  var dt = new Date( ts );
  var yyyy = dt.getFullYear();
  var mm = dt.getMonth() + 1;
  var dd = dt.getDate();
  var hh = dt.getHours();
  var nn = dt.getMinutes();
  var ss = dt.getSeconds();
  var tz = dt.getTimezoneOffset() / -60;
  var datetime = yyyy + '-' + ( mm < 10 ? '0' : '' ) + mm + '-' + ( dd < 10 ? '0' : '' ) + dd
    + ' ' + ( hh < 10 ? '0' : '' ) + hh + ':' + ( nn < 10 ? '0' : '' ) + nn + ':' + ( ss < 10 ? '0' : '' ) + ss
    + ( tz >= 0 ? '+' : '-' ) + Math.abs( tz );
  return datetime;
}

var port = process.env.PORT || 8080;
app.listen( port );
console.log( "server stating on " + port + " ..." );
