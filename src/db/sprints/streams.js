import { fromBinder, interval } from "baconjs";
import { db, changes, onReady } from "./db";
import { $tasks } from "../tasks/streams";

import moment from "moment";

/*
.map(tasks => {
			console.log(tasks.filter(task => !task.doneUntil || moment().isAfter(moment(task.doneUntil))));
			return tasks.filter(task => {
				console.log(
					task.doneUntil,
					!task.doneUntil, moment().isAfter(moment(task.doneUntil)),
				);
				return !task.doneUntil || moment().isAfter(moment(task.doneUntil))
			})
		});

*/

export const $activeSprints = tags =>
	fromBinder(sink => {
		const find = () => onReady().then(() => db.query(q => q.findRecords("sprint"))).then(sink);
		// const find = () => sink([]);

		const cancel = changes(find);

		find();

		return cancel;
	});

const $interval = delay =>
	fromBinder(sink => {
		sink(moment().valueOf());

		const id = setInterval(() => sink(moment().valueOf()), delay);

		return () => clearInterval(id);
	});


export const $activeSprintsTasks = (tags, filter = [{ attribute: "deleted", value: false }]

/*{ deleted: false }*/) =>
	$activeSprints(tags)
		.combine(
			$tasks(tags, filter).combine($interval(1000 * 60), tasks => tasks),
			(sprints, tasks) => {
				console.log("SPRINTS", sprints);

				const now = moment().valueOf();

				sprints = sprints.concat([{
					attributes: {
						empty: true
					},
					relationships: {
						tags: {
							data: [ /* { type: "tag", id: "all" } */]
						}
					}
				}]);

				tasks.forEach(t => t.computed = { sprints: [] });

				for (let i = 0; i < sprints.length; i++) {
					const sprint = sprints[i];

					sprint.relationships.tasks = tasks.filter(task => {
						for (let tag in sprint.tags) {
							debugger;
							if (!task.tags[tag]) {
								return false;
							}
						}

						return true;
					});

					sprint.relationships.openTasks = sprint.relationships.tasks.filter(
						task => !(task.attributes.deleted || task.attributes.done || (task.attributes.doneUntil && moment(task.attributes.doneUntil).isAfter(moment())))
					).sort((a, b) => moment(a.attributes.createdAt).valueOf() - moment(b.attributes.createdAt).valueOf());


					sprint.attributes.doneTasksTotal = 0;
					sprint.relationships.doneTasks = sprint.relationships.tasks.filter(
						task => {
							const doneUntil = task.attributes.doneUntil && moment(task.attributes.doneUntil).isAfter(moment());
							const r = !task.attributes.deleted && (task.attributes.done || doneUntil);

							sprint.attributes.doneTasksTotal += r ? 1 : 0;

							return r;
						}
					)
						.filter(task => moment(task.attributes.updatedAt).valueOf() > moment().valueOf() - (1000 * 60 * 60 * 24 * 30 * 4))
						.sort((a, b) => moment(a.attributes.updatedAt).valueOf() - moment(b.attributes.updatedAt).valueOf());

					let openAvg = 0;

					sprint.attributes.taskDueAvg;

					if (sprint.relationships.openTasks.length) {
						const lastestClosedTask = moment(
							sprint.relationships.doneTasks && sprint.relationships.doneTasks.length ?
								sprint.relationships.doneTasks[sprint.relationships.doneTasks.length - 1].updatedAt :
								sprint.relationships.openTasks[sprint.relationships.openTasks.length - 1].createdAt
						).valueOf();

						openAvg = sprint.relationships.openTasks.reduce((avg, task) => {
							const createdAt = moment(task.attributes.createdAt).valueOf();

							let delta;
							if (lastestClosedTask > createdAt) {
								delta = now - lastestClosedTask;
							}
							else {
								delta = now - createdAt;
							}

							// const delta = now - moment(task.createdAt).valueOf();
							return avg === null ? delta : (avg + delta) / 2;
						}, null);

						const dueTime = moment(sprint.attributes.dueDate).valueOf() - now;
						sprint.attributes.taskDueAvg = dueTime / sprint.relationships.openTasks.length;

						sprint.relationships.openTasks.forEach(task => {
							task.computed.sprints.push(sprint);
						});

						sprint.attributes.oldestOpenTask = sprint.relationships.openTasks[0].createdAt;
					}

					if (sprint.relationships.doneTasks.length) {
						const latestDoneTime = moment(sprint.relationships.doneTasks[0].updatedAt).valueOf();
						const time = now - latestDoneTime;
						const t = (time + openAvg) / sprint.relationships.doneTasks.length;
						sprint.attributes.doneAvg = t;
					}
					else {
						sprint.attributes.doneAvg = openAvg;
					}

					sprint.attributes.nextTodoAvgDueTime = (sprint.attributes.doneAvg + sprint.attributes.taskDueAvg) / 2;
					sprint.attributes.estimatedDueDate = now + sprint.attributes.doneAvg * sprint.relationships.openTasks.length;

					sprint.attributes.openTasksTotal = sprint.relationships.openTasks.length;
					// sprint.doneTasksTotal = sprint.doneTasks.length;
					sprint.attributes.total = sprint.attributes.openTasksTotal + sprint.attributes.doneTasksTotal;

					sprint.attributes.dueDate = sprint.attributes.dueDate || moment(sprint.attributes.estimatedDueDate).endOf("month").toISOString();
				}

				return {
					sprints,
					tasks: tasks.filter(task => !(task.attributes.deleted || task.attributes.done || (task.attributes.doneUntil && moment(task.attributes.doneUntil).isAfter(moment()))))
				};
			}
		);
