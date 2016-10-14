
var riot = require('riot');
var App = require('./app.js');

require('./libs/material.min.js');
require('./tags/app.tag.js');
require('./tags/tasks/tasks.tag.js');
require('./tags/tasks/task.tag.js');
require('./tags/tasks/notasks.tag.js');
require('./tags/tasks/addtask.tag.js');
require('./tags/tasks/taskmanager.tag.js');

require('./tags/sprints/addsprint.tag.js');

riot.mount('app', {app: new App()});
