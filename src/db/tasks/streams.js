import { dbTasks, changes } from "./db";
import { fromBinder } from "baconjs";

export const $tasks = (tags = { all: true }, selector) =>
	fromBinder(sink => {

		const find = () => dbTasks.where(selector).filter(task => {
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


export const $activeTasks = tags => $tasks(tags, { done: 0, deleted: 0 });

export const $activeTags = tags => $activeTasks(tags).map(tasks => {
	const tags = {};
	for (let i = 0; i < tasks.length; i++) {
		const task = tasks[i];
		for (let tag in task.tags) {
			tags[tag] = true;
		}
	}

	return tags;
});

