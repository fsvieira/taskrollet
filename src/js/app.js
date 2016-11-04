var parser = require('./taskparser.js');

var LOCAL_STORAGE_PREFIX = "taskroulette@";
var LOCAL_STORAGE_STATE = LOCAL_STORAGE_PREFIX + "state";
var day = 1000*60*60*24;

function App () {
    riot.observable(this);
    var self = this;
    
    this.state = this.load();
    this.updateTreshold();

    this.title = "Task Roulette";
}

/* 
==============================
    Static Functions 
==============================
*/
App.enums = function (context, values) {
    App[context] = {};
    for (var i=0; i<values.length; i++) {
        App[context][values[i]] = i;
    }
};

// Maybe put this on utils ? 
App.date2string = function (date) {
    var d = new Date(date);
    return d.toISOString().replace("T", " ").split(".")[0];
};

App.tagPresentation = function (tag) {
    return tag.replace(/-/g, ' ');
};

App.getTags = function (description, tags) {
    tags = tags || [];
    var tag;
    if (description instanceof Array) {
        for (var i=0; i<description.length; i++) {
            App.getTags(description[i], tags);
        }
    }
    else if (typeof description === 'object') {
        for (var i in description) {
            if (i === 'tag') {
                tag = description[i];
                if (tags.indexOf(tag) === -1) {
                    tags.push(tag);
                }
            }
            else {
                App.getTags(description[i], tags);
            }
        }
    }

    return tags;
};


/* Static Constants */
App.constants = {
    allTags: 'all-tags'
};



// States,
App.enums("STATE", [
    "EMPTY_TASKS",
    "TASK_MANAGER",
    "TASK_OF_THE_DAY",
    "NO_TASKS_FOR_TODAY"
]);

const initialState = {
    tasks: [],
    currentState: App.STATE.EMPTY_TASKS,
    sprints: {},
    stats: {
        tasksClosed: 0,
        threshold: 0,
        parcialThreshold: 0,
        update: new Date().getTime()
    }
};


/* 
==============================
    Persistent data handle, (Local Storage)
==============================
*/
App.prototype.updateTreshold = function () {
    var today = new Date().getTime();
    var days = Math.ceil((today - this.state.stats.update) / (1000*60*60*24)); 

    var threshold = (this.state.stats.tasksClosed / days) || 1;
    this.state.stats.parcialThreshold = Math.floor((this.state.stats.threshold + threshold) / 2);
    
    // Close stats.
    if (days >= 30) {
        this.state.stats.threshold = this.state.stats.parcialThreshold;
        this.state.stats.tasksClosed = 0;
        this.state.stats.update = today;
    } 
    
    
    return this.state.stats.parcialThreshold;
};

App.prototype.save = function () {
    localStorage.setItem(LOCAL_STORAGE_STATE, JSON.stringify(this.state));
};

App.prototype.load = function () {
    var state = localStorage.getItem(LOCAL_STORAGE_STATE);
    state = state?JSON.parse(state):initialState;
    
    // TODO: remove this, since we are still in beta version,
    if (state.stats === undefined) {
        state.stats = {
            tasksClosed: 0,
            threshold: 1,
            parcialThreshold: 1,
            update: new Date().getTime()
        };
    }

    return state;
};



/*
==============================
    Sprints write
==============================
*/
App.prototype.addSprint = function (tag, date) {
    this.state.sprints[tag].date = date;
    this.state.sprints[tag].tag = tag;
    this.save();
    this.getState(true);
};

App.prototype.deleteSprint = function (tag) {
    this.state.sprints[tag].date = undefined;
    this.save();
    this.getState(true);
};

/*
==============================
    Sprints Read
==============================
*/
App.prototype.getSprints = function () {
    var sprints = [];
    
    for (var tag in this.state.sprints) {
        var sprint = this.state.sprints[tag];

        if (sprint.date !== undefined) {
            sprints.push(sprint);
        }
    }
    
    sprints.sort(function (a, b) {
        return a.date - b.date;
    });

    return sprints;
};

App.prototype.getAvailableSprintsTags = function () {
    var sprintsTags = [];
    
    for (var tag in this.state.sprints) {
        var sprint = this.state.sprints[tag];

        if (sprint.date === undefined) {
            sprintsTags.push(tag);
        }
    }
    
    sprintsTags.sort();

    return sprintsTags;
};

/* 
==============================
    Tasks Write
==============================
*/

App.prototype.addTask = function (task) {
    task.localId = this.state.tasks.length;
    task.createDate = task.createDate || new Date().getTime();
    task.parsedDescription = parser.parse(task.description);
    var tags = App.getTags(task.parsedDescription);

    if (tags.indexOf(App.constants.allTags) === -1) {
        tags.push(App.constants.allTags);
    }

    task.tags = tags;
    this.state.tasks.push(task);

    // add task to sprints
    for (var i=0; i<tags.length; i++) {
        var tag = tags[i];
        this.state.sprints[tag] = this.state.sprints[tag] || {tasks: []};
        this.state.sprints[tag].tasks.push(task.localId);
    }

    var taskOfTheDay = this.state.taskOfTheDay;
    if (taskOfTheDay && taskOfTheDay.task) {
        for (var i=0; i<tags.length; i++) {
            var t = tags[i];

            if (
                taskOfTheDay.task.activeTags.indexOf(t) === -1 &&
                taskOfTheDay.dismissTags.indexOf(t) === -1
            ) {
                taskOfTheDay.activeTags.push(t);
            }
        }
    }

    this.save();
    this.trigger("notification", {message: "Task '" + task.description.substring(0, 10) + "...' added"});
    this.getState(true);
};

App.prototype.dismissTask = function (localId) {
    this.deleteTask(localId, true);
};
    
App.prototype.deleteTask = function (localId, keep) {
    var taskOfTheDay = this.state.taskOfTheDay;
    var lastId = this.state.tasks.length-1;
    var task = this.state.tasks[localId];
    var tag;

    // clean up taskOfTheDay, if necessary.
    if (
        taskOfTheDay && 
        taskOfTheDay.tagTask
    ) {

        for (var tag in taskOfTheDay.tagTask) {
            if (taskOfTheDay.tagTask[tag] === localId) {
                delete taskOfTheDay.tagTask[tag];
                if (tag !== App.constants.allTags) {
                    var index = taskOfTheDay.task.activeTags.indexOf(tag);
                    
                    if (index >= 0) {
                        taskOfTheDay.task.activeTags.splice(
                            index,
                            1
                        );
                    }
    
                    if (taskOfTheDay.dismissTags.indexOf(tag) === -1) {
                        taskOfTheDay.dismissTags.push(tag);
                    }
   
                }
                else {
                    taskOfTheDay.sprintMode = true;
                }
            }
        }
        
        if (taskOfTheDay.task.activeTags.indexOf(taskOfTheDay.task.activeTag) === -1) {
            taskOfTheDay.task.activeTag = taskOfTheDay.task.activeTags[0];
        }

        
        taskOfTheDay.task.content = this.state.tasks[taskOfTheDay.tagTask[taskOfTheDay.task.activeTag]];

        
        if (!keep) {
            // rewrite id,
            for (var tag in taskOfTheDay.tagTask) {
                if (taskOfTheDay.tagTask[tag] === lastId) {
                    taskOfTheDay.tagTask[tag] = localId;
                }
            }
        }
    }

    if (!keep) {
        // delete task,

        // rewrite task on sprints,
        // remove task from sprints,
        task = this.state.tasks[lastId];
        for (var i=0; i<task.tags.length; i++) {
            tag = task.tags[i];

            this.state.sprints[tag].tasks.splice(
                this.state.sprints[tag].tasks.indexOf(lastId),
                1
            );
            
            this.state.sprints[tag].tasks.push(localId);
        }

        task = this.state.tasks[localId];
        for (var i=0; i<task.tags.length; i++) {
            tag = task.tags[i];

            this.state.sprints[tag].tasks.splice(
                this.state.sprints[tag].tasks.indexOf(localId),
                1
            );
            
            if (this.state.sprints[tag].tasks.length === 0) {
                delete this.state.sprints[tag];
            }
        }

        // switch tags id,
        this.state.tasks[localId] = this.state.tasks[lastId];
        this.state.tasks[localId].localId = localId;
        this.state.tasks.pop();

        // calculare stats:
        this.state.stats.tasksClosed++;
        this.updateTreshold();
    }
    

    this.save();
    this.getState(true);
};

App.prototype.taskManagerDone = function () {
    var days = day*4 + day*(Math.floor(Math.random()*3));
    var date = new Date(this.state.taskManagerScheduled + days);
    date.setHours(0, 0, 0, 0);

    this.state.taskManagerScheduled = date.getTime();
    this.save();
    this.getState(true);
};


/*
==============================
    Tasks Read
==============================
*/
App.prototype.taskSelector = function (tag) {
    if (this.state.tasks === 0) {
        // no tasks to select.
        return;
    }
    
    var tasks = this.state.tasks;
    var total = 0;
    var task, r;
    var now = new Date().getTime();
    var date, days, sprintIds, stat;
    var today = new Date().getTime();

    // reset all stats,
    for (var i=0; i<tasks.length; i++) {
        tasks[i].stat = 0;
    }

    // calculate stats,
    for (var sprintTag in this.state.sprints) {
        date = this.state.sprints[sprintTag].date;
        
        if (date) {
            days = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
            days = days < 0?1:days;

            sprintIds = this.state.sprints[sprintTag].tasks;
            stat = sprintIds.length / days;

            for (var i=0; i<sprintIds.length; i++) {
                task = this.state.tasks[sprintIds[i]];
                
                if (task.stat < stat) {
                    task.stat = stat;
                }
            }
        }
    }

    tasks = tasks.filter(function (task) {
        return task.tags && task.tags.indexOf(tag) !== -1;
    });

    tasks.sort(function (a, b) {
        return b.stat - a.stat;
    });

    stat = tasks[0].stat;
    task = undefined;
    
    if (tag === App.constants.allTags) {
        for (var t in this.state.taskOfTheDay.tagTask) {
            if (this.state.taskOfTheDay.tagTask[t].stat === stat) {
                // a task was found,
                task = this.state.taskOfTheDay[tag];
                break;
            }
        }
        
        if (!task && this.state.taskOfTheDay.task.activeTags.length > 1) {
            var activeTags = this.state.taskOfTheDay.task.activeTags;
            
            var activeTasks = tasks.filter(function (task) {
                for (var activeTag in task.tags) {
                    if (activeTag !== App.constants.allTags
                        && activeTags.indexOf(activeTag) !== -1
                    ) {
                        return true;
                    }
                }

                return false;
            });
            
            if (activeTasks.length > 0) {
                tasks = activeTasks;
            }
        }
    }
    
    if (!task) {
        // select a random task,
        tasks = tasks.filter(function (task) {
           return task.stat === stat;
        });
        
        tasks.forEach(function (t, index) {
            t.updateDate = t.updateDate || t.createDate;
            t.timeSpan = now - t.updateDate;
            total += t.timeSpan;
        });
        
        tasks.sort(function (a, b) {
            return b.timeSpan - a.timeSpan;
        });
        
        r = Math.random()*total;
        var accum = 0;
        
        for (var i=0; i<tasks.length; i++) {
            task = tasks[i];
            accum += task.timeSpan;
            if (r < accum) {
                break;
            }
        }
    }
    
    task.updateDate = new Date().getTime();

    return task;
};

App.prototype.getTasks = function () {
    return this.state.tasks;
};

App.prototype.getTasksTags = function () {
    var tags = [];

    for (var tag in this.state.sprints) {
        tags.push(tag);
    }
    
    tags.sort();
    
    return tags;
};

App.prototype.getTaskOfTheDay = function (tag) {
    var task;
    var change = false;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    today = today.getTime();

    if (this.state.taskOfTheDay && this.state.taskOfTheDay.update !== today) {
        change = true;

        this.state.taskOfTheDay = undefined;
    }
    
    if (this.state.taskOfTheDay === undefined) {
        change = true;

        this.state.taskOfTheDay = this.state.taskOfTheDay || {
            update: today,
            tagTask: {},
            task: {}
        };
    
        this.state.taskOfTheDay.task.activeTags =
            this.state.taskOfTheDay.task.activeTags || this.getTasksTags();
            
        this.state.taskOfTheDay.dismissTags =
            this.state.taskOfTheDay.dismissTags || [];
    }

    tag = tag || this.state.taskOfTheDay.task.activeTags[0] || App.constants.allTags;

    if (
        this.state.taskOfTheDay.task.activeTags.length > 1
        || this.state.taskOfTheDay.sprintMode === undefined
    ) {
        change = true;

        task = this.state.taskOfTheDay.tagTask[tag];

        if (task === undefined) {
            task = this.taskSelector(tag);

            for (var i=0; i<task.tags.length; i++) {
                var taskTag = task.tags[i];
                if (this.state.taskOfTheDay.tagTask[taskTag] === undefined) {
                    this.state.taskOfTheDay.tagTask[taskTag] = task.localId;
                }
            }
            
            this.state.taskOfTheDay.task.content = task;
        }
        else {
            task = this.state.tasks[task];
        }

        this.state.taskOfTheDay.task.content = task;
    }
    else if (
        this.state.taskOfTheDay.task.content === undefined
    ) {
        task = this.taskSelector(tag);

        if (
            task.stat > 0 && 
            task.stat >= this.state.stats.parcialThreshold
        ) {
            change = true;

            this.state.taskOfTheDay.task.content = task;
        }
    }

    this.state.taskOfTheDay.task.activeTag = tag;
    
    if (change) {
        this.save();
    }
    
    return this.state.taskOfTheDay.task;
};

App.prototype.getState = function (update) {
    // 
    var state = this.state.currentState;
    if (this.state.tasks.length === 0) {
        this.state.taskManagerScheduled = undefined;
        state = App.STATE.EMPTY_TASKS;
    }
    else {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        today = today.getTime();
        
        this.state.taskManagerScheduled = this.state.taskManagerScheduled || today;

        if (today >= this.state.taskManagerScheduled) {
            state = App.STATE.TASK_MANAGER;
        }
        else {
            this.getTaskOfTheDay();
            if (
                this.state.taskOfTheDay.task && this.state.taskOfTheDay.task.content
            ) {
                state = App.STATE.TASK_OF_THE_DAY;
            }
            else {
                state = App.STATE.NO_TASKS_FOR_TODAY;
            }
        }
    }
    
    if (update || this.state.currentState !== state) {
        this.state.currentState = state;
        this.trigger("update", this.state);
    }

    return state;
};

module.exports = App;
