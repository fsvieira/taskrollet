var parser = require('./taskparser.js');

var LOCAL_STORAGE_PREFIX = "taskroulette@";
var LOCAL_STORAGE_STATE = LOCAL_STORAGE_PREFIX + "state";
var day = 1000*60*60*24;

// If state is undefined keep same state.

function App () {
    riot.observable(this);
    var self = this;
    
    this.state = this.load();
    this.title = "Task Roulette";
    
    // setup Listenner,
    this.on("addTask", function (task) {
        task.localId = self.state.tasks.length;
        task.createDate = task.createDate || new Date().getTime();
        task.parsedDescription = parser.parse(task.description);
        var tags = App.getTags(task.parsedDescription);

        task.tags = tags;
        self.state.tasks.push(task);

        self.save();
        self.getState();
        self.trigger("notification", {message: "Task '" + task.description.substring(0, 10) + "...' added"});
        self.trigger("tasksChanged", self.state.tasks);
    });
    
    this.on("deleteTask", function (localId) {

        self.state.tasks[localId] = self.state.tasks[self.state.tasks.length-1];
        self.state.tasks[localId].localId = localId;
        self.state.tasks.pop();

        if (
            self.state.taskOfTheDay && 
            self.state.taskOfTheDay.task && 
            self.state.taskOfTheDay.task.localId === localId
        ) {
           self.state.taskOfTheDay.task = undefined; 
        }

        self.save();
        self.getState();
    });

    this.on("taskManagerDone", function () {
        var days = day*4 + day*(Math.floor(Math.random()*3));
        var date = new Date(self.state.taskManagerScheduled + days);
        date.setHours(0, 0, 0, 0);

        self.state.taskManagerScheduled = date.getTime();
        self.save();
        self.getState();
    });
}


/* Static App Functions and Constants */
App.enums = function (context, values) {
    App[context] = {};
    for (var i=0; i<values.length; i++) {
        App[context][values[i]] = i;
    }
};

// States,
App.enums("STATE", [
    "EMPTY_TASKS",
    "TASK_MANAGER",
    "TASK_OF_THE_DAY",
    "NO_TASKS_FOR_TODAY"
]);

// Maybe put this on utils ? 
App.date2string = function (date) {
    var d = new Date(date);
    return d.toISOString().replace("T", " ").split(".")[0];
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


/* 
    Persistent data handle, (Local Storage)
*/
App.prototype.save = function () {
    localStorage.setItem(LOCAL_STORAGE_STATE, JSON.stringify(this.state));
};

App.prototype.load = function () {
    var state = localStorage.getItem(LOCAL_STORAGE_STATE);
    state = state?JSON.parse(state):{
        tasks: [],
        currentState: App.STATE.EMPTY_TASKS
    };
    
    return state;
};



App.prototype.taskSelector = function (filter) {
    var tasks = filter?filter(this.state.tasks):this.state.tasks;
    var total = 0;
    var task, r;
    var now = new Date().getTime();
    
    tasks.forEach(function (t, index) {
        t.updateDate = t.updateDate || t.createDate;
        t.timeSpan = now - t.updateDate;
        total += t.timeSpan;
    });
    
    tasks.sort(function (a, b) {
        return a.timeSpan < b.timeSpan;
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

    task.updateDate = new Date().getTime();
    
    this.save();

    return task;
};

App.prototype.getTasks = function () {
    return this.state.tasks;
};

App.prototype.getTasksTags = function () {
    var tags = [];
    
    this.state.tasks.forEach(function (t) {
        var tag;
        for (var i=0; i<t.tags.length; i++) {
            tag = t.tags[i];
            if (tags.indexOf(tag) === -1) {
               tags.push(tag);
            }
       }
    });

    tags.sort();

    return tags;
};

App.prototype.getTask = function () {
    if (this.getState() === App.STATE.TASK_OF_THE_DAY) {
        if (this.state.taskOfTheDay) {
            return this.state.taskOfTheDay.task;
        }
        
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        today = today.getTime();
        
        this.state.taskOfTheDay = {
            update: today,
            task: this.taskSelector()
        };
    
        this.save();
    
        return this.state.taskOfTheDay.task;
    }
};

App.prototype.getState = function () {
    // 
    var state = this.state.currentState;
    if (this.state.tasks.length === 0) {
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
        else if (this.state.taskOfTheDay && this.state.taskOfTheDay.update === today) {
            if (this.state.taskOfTheDay.task) {
                state = App.STATE.TASK_OF_THE_DAY;
            }
            else {
                state = App.STATE.NO_TASKS_FOR_TODAY;
            }
        }
        else {
            this.state.taskOfTheDay = undefined;
            state = App.STATE.TASK_OF_THE_DAY;
        }
    }
    
    if (this.state.currentState !== state) {
        this.state.currentState = state;
        this.trigger('stateChange', state);
    }

    return state;
};

module.exports = App;
