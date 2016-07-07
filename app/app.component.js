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
				
				if (!this.taskOfTheDay && !timeoutIsRunning) {
					timeoutIsRunning = true;
					setTimeout(function check () {
						taskTimeout++;
						console.log(taskTimeout);
						if (!_self.taskOfTheDay) {
							if (taskTimeout > 30) {
								timeoutIsRunning = false;
								_self.selectTaskOfTheDay();
							}
							else {
								setTimeout(check, 1000);
							}
						}
					}, 1000);
				}
				
				// save tasks,
				this.saveTasks();
			};
			
			this.deleteTask = function () {
				var index = this.taskOfTheDay.index;
				this.tasks.splice(index, 1);
				
				localStorage.setItem("tasks", JSON.stringify(this.tasks));
				
				this.taskOfTheDay = {
					date: this.taskOfTheDay.date
				};
				
				localStorage.setItem("taskOfTheDay", JSON.stringify(this.taskOfTheDay));
			};
			
			this.addTaskKeepAlive = function () {
				console.log("Task Keep Alive");
				taskTimeout = 0;
			};
			
			this.showDate = function (date) {
				return date.toISOString().split("T")[0];
			};
		}
    });
})(window.app || (window.app = {}));
