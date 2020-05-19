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
