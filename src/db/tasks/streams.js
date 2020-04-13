import { db, changes } from "./db";
import { fromBinder } from "baconjs";

export const $tasks = (tags = { all: true }, selector) =>
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



		const find = () => db.query(
			q => q.findRecords("task").filter(
				...selector,
				/*
				{ attribute: "deleted", value: false },
				{ attribute: "done", value: false }*/
				// { relation: "tags", records: filterTags }
			)
		).then(
			tasks => {
				sink(tasks.filter(
					({ relationships: { tags: { data } } }) => {
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
			err => console.log("TASKS ERROR _> " + err)
			/*tasks => sink(tasks.filter(
				task => {
					for (let tag in tags) {
						if (!task.tags[tag]) {
							return false;
						}
					}

					return true;
				}
			))*/
		);

		const cancel = changes(find);

		find();

		return cancel;
	});


export const $activeTasks = tags => $tasks(
	tags,
	// { done: false, deleted: false }
	[
		{ attribute: "deleted", value: false },
		{ attribute: "done", value: false }
	]
);

export const $activeTags = tags => $activeTasks(tags).map(tasks => {
	const tags = {};

	for (let i = 0; i < tasks.length; i++) {
		const task = tasks[i];
		task.relationships.tags.data.forEach(({ id: tag }) => tags[tag] = true);
	}

	return tags;
});

