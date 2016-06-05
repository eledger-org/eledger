var jsdom					= require('jsdom');
var $	          	= require('jquery')(jsdom.jsdom('<p></p>').defaultView);
module.exports.$	= $

