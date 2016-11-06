
var riot = require('riot');
var App = require('./app.js');

require('./libs/material.min.js');
require('./tags/app.tag.js');
require('./tags/tasks/tasks.tag.js');
require('./tags/tasks/task.tag.js');
require('./tags/tasks/notasks.tag.js');
require('./tags/tasks/addtask.tag.js');
require('./tags/tasks/taskmanager.tag.js');
require('./tags/tasks/taskoftheday.tag.js');

require('./tags/sprints/sprints.tag.js');
require('./tags/sprints/listsprints.tag.js');
require('./tags/sprints/addsprint.tag.js');

require('./tags/documentation/documentation.tag.js');
require('./tags/documentation/tooltips.tag.js');

riot.mount('app', {app: new App()});
