require('./libs/material.min.js');
require('./tags/app.tag.js');
require('./tags/task.tag.js');

var riot = require('riot');
var App = require('./app.js');

riot.mount('app', new App());
