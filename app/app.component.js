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

			this.stats = function (tasks, perc) {
				perc = perc || Math.random();
				var now = new Date().getTime();
				var total = 0;
				tasks.forEach(function (task) {
					// calculate time pass,
					var time = now - new Date(task.update || task.date).getTime();
					
					total += time;
					task.stats = {
						time: time
					};
				});

				tasks.sort(function (a, b) {
					return b.stats.time - a.stats.time;
				});

				var accum = 0;
				perc = perc * total;

				for (var i=0; i<tasks.length; i++) {
					accum += tasks[i].stats.time;

					if (perc <= accum) {
						return i;
					}
				}
				
				console.log("BUG");
			};

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
					now.setHours(0,0,1,0);
						
					if (!td || td.date.getTime() !== now.getTime()) {
						var taskManager = 1;
						if (this.state !== this.STATE_TASKMANAGER) {
							taskManager = Math.random();
						}
						
						if (taskManager > 0.15) {
							// var index = Math.floor(Math.random()*this.tasks.length);
							// TODO: saving index is bad ideia, tasks must have an id (sha2+timesptamp).
							var index = this.stats(this.tasks);
							var td = {
								index: index,
								date: now,
								task: this.tasks[index]
							};
							
							td.task.update = now;
							
							localStorage.setItem("taskOfTheDay", JSON.stringify(td));
							localStorage.setItem("tasks", JSON.stringify(this.tasks));
							
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
				
				console.log(JSON.stringify(this.taskOfTheDay));

			}
						
			this.saveTasks = function () {
				localStorage.setItem("tasks", JSON.stringify(_self.tasks));
			}

			this.loadTasks = function () {
				var t = localStorage.getItem("tasks");
				if (t) {
					this.tasks = JSON.parse(t).map(function (t) {
						if (!t.parsed ) {
							t.parsed = parser.parse(t.content);
						}
						
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
					parsed: parser.parse(taskDescription),
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
				
				if (this.taskOfTheDay) {
					this.taskOfTheDay = {
						date: this.taskOfTheDay.date
					};
					
					localStorage.setItem("taskOfTheDay", JSON.stringify(this.taskOfTheDay));
				}
				
				this.state = this.STATE_TASKROULLET_DAY_EMPTY;
				localStorage.setItem("state", this.state);
			};
				
			this.dismissTask = function (index) {
				var index = index===undefined?this.taskOfTheDay.index:index;
				
				if (this.taskOfTheDay) {
					this.taskOfTheDay = {
						date: this.taskOfTheDay.date
					};
					
					localStorage.setItem("taskOfTheDay", JSON.stringify(this.taskOfTheDay));
				}
				
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
			
			/*
			this.toast = function (message) {
				this.toasts.push(message);
				this.toastsClear();
			};*/
			
			// TODO: check how to do this on angular2.
			var snackbarContainer;
			this.toast = function (message) {
				if (!snackbarContainer) {
					snackbarContainer = document.querySelector('#toast');
				}
				
				snackbarContainer.MaterialSnackbar.showSnackbar({
					message: message
				});
			};
		}
    });
})(window.app || (window.app = {}));
