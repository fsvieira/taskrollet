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

			var taskTimeout = 0;
			var timeoutIsRunning = false;

			this.STATE_INITIAL = 0;
			this.STATE_TASKROULLET = 1;
			this.STATE_TASKROULLET_EMPTY = 2;
			this.STATE_TASKROULLET_DAY_EMPTY = 3;
			this.STATE_TASKMANAGER = 4;
			
			this.state = this.STATE_INITIAL;

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
						console.log(this.tasks.length);
						
						var index = Math.floor(Math.random()*this.tasks.length);
						var td = {
							index: index,
							date: now,
							task: this.tasks[index]
						};
							
						localStorage.setItem("taskOfTheDay", JSON.stringify(td));
						this.taskOfTheDay = td;
					}
					else {
						this.taskOfTheDay = td;
					}
				}
				else {
					this.state = this.STATE_TASKROULLET_EMPTY;
				}
			}
			
			this.saveTasks = function () {
				console.log(JSON.stringify(_self.tasks));
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
				
				this.selectTaskOfTheDay();
			}

			this.loadTasks();

			this.addTask = function (taskDescription) {
				this.tasks.push({
					content: taskDescription,
					date: new Date()
				});

				// save tasks,
				this.saveTasks();
				
				if (this.state === this.STATE_TASKROULLET_EMPTY) {
					this.state = this.STATE_TASKMANAGER;
				}
			};

			this.done = function () {
				console.log("Done");
			}
			
			this.deleteTask = function (index) {
				var index = index===undefined?this.taskOfTheDay.index:index;
				this.tasks.splice(index, 1);
				
				localStorage.setItem("tasks", JSON.stringify(this.tasks));
				
				this.taskOfTheDay = {
					date: this.taskOfTheDay.date
				};
				
				localStorage.setItem("taskOfTheDay", JSON.stringify(this.taskOfTheDay));
			};
						
			this.showDate = function (date) {
				return date.toISOString().split("T")[0];
			};
		}
    });
})(window.app || (window.app = {}));
