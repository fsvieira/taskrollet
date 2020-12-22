import { db, changes, refreshTime, constants } from "./db";
import { fromBinder } from "baconjs";
import moment from "moment";

export const $allTasks = (tags = { all: true }) =>
	fromBinder(sink => {
		const find = cache => db(cache).then(
			db => db.query(
				q => q.findRecords("task")
			)
		).then(
			tasks => sink(tasks.filter(
				({ relationships: { tags: { data } } }) => {
					const s = new Set(data.map(({ id }) => id));

					for (let tag in tags) {
						if (!s.has(tag)) {
							return false;
						}
					}

					return true;
				}
			)),
			err => {
				console.log(err);
				return err;
			}
		);

		const cancel = changes(() => find(true));

		find();

		const cancelInterval = setInterval(() => find(), refreshTime);

		return () => {
			clearInterval(cancelInterval);
			return cancel();
		}
	});


export const $tasks = (tags = { all: true }, selector, filterDoneUntil = false) =>
	fromBinder(sink => {

		/*
		TODO: when we get orbit relationships filter subset working:
		// TODO : we can try the some operator, https://github.com/orbitjs/orbit/issues/741
		const filterTags = [];
		for (let tag in tags) {
			if (tags[tag]) {
				filterTags.push({ type: "tag", id: tag });
			}
		}*/

		const find = cache => db(cache).then(
			db => db.query(
				q => q.findRecords("task").filter(
					...selector
					// { attribute: "deleted", value: false },
					// { attribute: "done", value: false }
					// { relation: "tags", records: filterTags }
				)
			)
		).then(
			tasks => {
				sink(tasks.filter(
					({
						attributes: { doneUntil },
						relationships: { tags: { data } }
					}) => {
						const dateUntil = filterDoneUntil && doneUntil && moment.utc(doneUntil).isAfter(moment.utc());

						if (dateUntil) {
							return false;
						}

						const s = new Set(data.map(({ id }) => id));

						for (let tag in tags) {
							if (!s.has(tag)) {
								return false;
							}
						}

						return true;
					}
				));
			},
			err => {
				console.log(err);
				return err;
			}
		);

		const cancel = changes(() => find(true));

		find();

		const cancelInterval = setInterval(() => find(), refreshTime);

		return () => {
			clearInterval(cancelInterval);
			return cancel();
		}
	});

export const $activeTasks = (tags, filterDoneUntil) => $tasks(
	tags,
	// { done: false, deleted: false }
	[
		{ attribute: "deleted", value: false },
		{ attribute: "done", value: false }
	],
	filterDoneUntil
);


export const $activeTags = (tags, filterDoneUntil) => $activeTasks(tags, filterDoneUntil).map(tasks => {
	const tags = {};

	for (let i = 0; i < tasks.length; i++) {
		const task = tasks[i];
		task.relationships.tags.data.forEach(({ id: tag }) => tags[tag] = true);
	}

	return tags;
});

export const $taskStats = tags => $tasks(tags, [{ attribute: "deleted", value: false }], false).map(tasks => {
	const now = new Date().getTime();
	const monthsDays = 30 * 3;
	const dayMillis = 1000 * 60 * 60 * 24;
	const months = now - (dayMillis * monthsDays);
	const workWeek = now - (dayMillis * 5);

	console.log(tasks);

	const tasksDone = tasks.filter(task => task.attributes.done && task.attributes.updatedAt > months);
	const tasksDoneUntil = tasks.filter(task => {
		console.log("--->", task.attributes.doneUntil, task.attributes.doneUntil, now);

		return task.attributes.doneUntil && task.attributes.doneUntil > now;
	});

	const tasksDoneUntilWeek = tasksDoneUntil.filter(task => task.attributes.doneUntil < workWeek);
	const tasksOpen = tasks.filter(task => !task.attributes.done);

	const closedTasksTotal = tasksDone.length + tasksDoneUntil.length + 1;
	const days = monthsDays / closedTasksTotal;
	const daysPrediction = Math.ceil(days * (tasksOpen.length + tasksDoneUntilWeek.length));

	const r = {
		daysPerTask: days,
		daysPrediction,
		datePrediction: now + (daysPrediction * dayMillis),
		tags,
		taskPerDay: closedTasksTotal / monthsDays,
		tasksDoneTotal: tasksDone.length,
		tasksDoneUntilTotal: tasksDoneUntil.length,
		tasksOpenTotal: tasksOpen.length
	};

	return r;
});
