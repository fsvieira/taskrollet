import { db, changes } from "../db";
import { fromBinder } from "baconjs";
import moment from "moment";

export const $allTasks = (tags = { all: true }) =>
	fromBinder(sink => {
		const find = () => db().tasks.filter(task => {
			for (let tag in tags) {
				if (!task.tags[tag]) {
					return false;
				}
			}

			return true;
		}).toArray().then(sink);

		const cancel = changes(find);

		find();

		return cancel;
	});

export const $tasks = (tags = { all: true }, selector, filterDoneUntil = false) =>
	fromBinder(sink => {
		const find = () => db().tasks.where(selector).filter(task => {
			const doneUntil = task.doneUntil;
			const dateUntil = filterDoneUntil && doneUntil && moment.utc(doneUntil).isAfter(moment.utc());

			if (dateUntil) {
				return false;
			}

			for (let tag in tags) {
				if (!task.tags[tag]) {
					return false;
				}
			}

			return true;
		}).toArray().then(sink);

		const cancel = changes(find);

		find();

		return cancel;
	});

export const $activeTasks = (tags, filterDoneUntil) => $tasks(tags, { done: 0, deleted: 0 }, filterDoneUntil);

export const $activeTags = (tags, filterDoneUntil) => $activeTasks(tags, filterDoneUntil).map(tasks => {
	const tags = {};
	for (let i = 0; i < tasks.length; i++) {
		const task = tasks[i];
		for (let tag in task.tags) {
			tags[tag] = true;
		}
	}

	return tags;
});

export const $taskStats = tags => $tasks(tags, { deleted: 0 }, false).map(tasks => {
	const now = new Date().getTime();
	const monthsDays = 30 * 3;
	const dayMillis = 1000 * 60 * 60 * 24;
	const months = now - (dayMillis * monthsDays);
	const workWeek = now - (dayMillis * 5);

	const tasksDone = tasks.filter(task => task.done && task.updatedAt > months);
	const tasksDoneUntil = tasks.filter(task => task.doneUntil && task.doneUntil > now);

	const tasksDoneUntilWeek = tasksDoneUntil.filter(task => task.doneUntil < workWeek);
	const tasksOpen = tasks.filter(task => !task.done);

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


/*
export const $tasksCounts = async () => {
	const find = async () => {
		const aboveDate = moment().subtract(3, 'month').toDate();
		const totalDoneTasks = await db().tasks
			.where(['done', 'updatedAt'])
			.above([1, aboveDate]).count();

		if (totalDoneTasks > 0) {
			const firstDate = (await db().tasks
				.where(['done', 'updatedAt'])
				.above([1, aboveDate]).first()).updatedAt;

			const lastDate = (await db().tasks
				.where(['done', 'updatedAt'])
				.above([1, aboveDate]).last()).createdAt;

			const endDate = moment(lastDate < aboveDate ? aboveDate : lastDate);
			const startDate = moment(firstDate < moment().subtract(7, 'day') ? firstDate : moment().toDate());

			const duration = moment.duration(startDate.diff(endDate));
			const avgCloseTime = duration.as("day") / 8;
			const monthTotalTasks = Math.round(31 / avgCloseTime);
			const tasksPerDay = Math.round(monthTotalTasks / 31);

			console.log("TOTAL DONE TASKS => ", totalDoneTasks);
			console.log("LAST DATE => ", lastDate);
			console.log("FIRST DATE => ", firstDate);
			console.log("DURATION => ", duration.as("day"));
			console.log("Stats by day", avgCloseTime);
			console.log("Avg Close time", moment.duration(avgCloseTime, 'day').humanize());
			console.log("Number Of tasks per month", monthTotalTasks);
			console.log("Number Of tasks per day", tasksPerDay);

		}
	};

	changes(find);

	find();
}

$tasksCounts();
*/

