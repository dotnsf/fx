//. app.js
var express = require( 'express' ),
    axios = require( 'axios' ),
    app = express();

app.use( express.Router() );

//. #1
//var fxserver = 'http://www.gaitame.com/rate/neo20/rate_UTF8.asp';
var fxserver = 'https://navi.gaitame.com/v3/info/prices/rate';  // new server

var settings_cors = 'CORS' in process.env ? process.env.CORS : '';

app.get( '/', function( req, res ){
  res.contentType( 'application/json; charset=UTF-8' );
  if( settings_cors ){
    res.setHeader( 'Access-Control-Allow-Origin', settings_cors );
    res.setHeader( 'Vary', 'Origin' );
  }

  axios.get( fxserver ).then( function( result ){
    var rate = {};
    //console.log( result );
    if( result.status == 200 && result.data && result.data.data ){
      result = result.data;
      for( var i = 0; i < result.data.length; i ++ ){
        var line = result.data[i];
        var name = line.pair;
        var bid = line.bid;
        rate[name] = bid;
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
