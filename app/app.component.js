(function(app) {
  app.AppComponent =
    ng.core.Component({
      selector: 'my-app',
      templateUrl: 'templates/tasks.html'
    })
    .Class({
		constructor: function() {
			var _self = this;
			this.tasks = [];
			this.taskOfTheDay = undefined;
			this.taskDescription = "";

			var taskTimeout = 0;
			var timeoutIsRunning = false;
			

			this.STATE_INITIAL = 0;
			this.STATE_TASKROULLET = 1;
			this.STATE_TASKROULLET_EMPTY = 2;
			this.STATE_TASKROULLET_DAY_EMPTY = 3;
			this.STATE_TASKMANAGER = 4;
			
			// initial state, nothing decided yet.
			this.state = this.STATE_INITIAL;

			// select task of the day,
			this.selectTaskOfTheDay = function () {
				if (this.tasks && this.tasks.length > 0) {
					var tdString = localStorage.getItem("taskOfTheDay");
					var td;
					
					if (tdString) {
						var td = JSON.parse(tdString);
						td.date = new Date(td.date);
						td.task = this.tasks[td.index];
					}

					var now = new Date();
					now.setHours(0,0,0,0);
						
					if (!td || td.date.getTime() !== now.getTime()) {
						var taskManager = 1;
						if (this.state !== this.STATE_TASKMANAGER) {
							taskManager = Math.random();
						}
						
						if (taskManager > 0.3) {
							var index = Math.floor(Math.random()*this.tasks.length);
							var td = {
								index: index,
								date: now,
								task: this.tasks[index]
							};
								
							localStorage.setItem("taskOfTheDay", JSON.stringify(td));
							this.taskOfTheDay = td;
							
							// a task was seleted.
							this.state = this.STATE_TASKROULLET;
						}
						else {
							this.state = this.STATE_TASKMANAGER;
						}
					}
					else {
						this.taskOfTheDay = td;
						// a task was seleted.
						if (td.task) {
							this.state = this.STATE_TASKROULLET;
						}
						else {
							this.state = this.STATE_TASKROULLET_DAY_EMPTY;
						}
					}
				}
				else {
					// there is no tasks,
					this.state = this.STATE_TASKROULLET_EMPTY;
				}
				
				localStorage.setItem("state", this.state);
			}
			
			this.saveTasks = function () {
				localStorage.setItem("tasks", JSON.stringify(_self.tasks));
			}

			this.loadTasks = function () {
				var t = localStorage.getItem("tasks");
				if (t) {
					this.tasks = JSON.parse(t).map(function (t) {
						t.date = new Date(t.date);
						return t;
					});
				}
				
				// read state,
				this.state = +localStorage.getItem("state");
				if (this.state !== this.STATE_TASKMANAGER) {
					this.selectTaskOfTheDay();
				}
			}

			this.loadTasks();

			this.addTask = function () {
				var taskDescription = this.taskDescription;
				this.taskDescription = "";				
				
				this.tasks.push({
					content: taskDescription,
					date: new Date()
				});

				// save tasks,
				this.saveTasks();
				
				this.toast(taskDescription.substring(0, 10) + " ...");
				
				// if this is the first task of empty list then show taskmanager.
				if (this.state === this.STATE_TASKROULLET_EMPTY) {
					this.state = this.STATE_TASKMANAGER;
				}
			};

			this.done = function () {
				this.selectTaskOfTheDay();
			};
			
			this.deleteTask = function (index) {
				var index = index===undefined?this.taskOfTheDay.index:index;
				this.tasks.splice(index, 1);
				
				localStorage.setItem("tasks", JSON.stringify(this.tasks));
				
				this.taskOfTheDay = {
					date: this.taskOfTheDay.date
				};
				
				localStorage.setItem("taskOfTheDay", JSON.stringify(this.taskOfTheDay));

				this.state = this.STATE_TASKROULLET_DAY_EMPTY;
				localStorage.setItem("state", this.state);
			};
						
			this.showDate = function (date) {
				return date.toISOString().split("T")[0];
			};
			
			this.toasts = [];
			
			var _self = this;
			this.toastsClear = function () {
				if (this.toasts.length === 1) {
					setTimeout(function clear () {
						_self.toasts.splice(0, 1);
						if (_self.toasts.length > 0) {
							setTimeout(clear, 3000);
						}
					}, 3000);
				}
			};
			
			this.toast = function (message) {
				this.toasts.push(message);
				this.toastsClear();
			};
		}
    });
})(window.app || (window.app = {}));
