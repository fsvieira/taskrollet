import { useState, useEffect } from "react";
import { $activeTags, $activeTasks, $allTasks, $taskStats } from "./streams";
import { doneTask, doneTaskUntil, deleteTask, resetTask } from "./db";
import { selectTodo } from "../todo/db";

export const useActiveTags = (filterDoneUntil, filterTags) => {
	const [tags, setTags] = useState({ all: true });
	const [selectedTags, setSelectedTags] = useState(filterTags); // {});

	useEffect(
		() => {
			const cancel = $activeTags(selectedTags, filterDoneUntil).onValue(
				value => {
					if (Object.keys(value).length === 0) {
						setSelectedTags({ all: true });
					}
					else {
						setTags(value);
					}
				}
			);

			return () => cancel();
		},
		[JSON.stringify(selectedTags)]
	);

	return { tags, selectedTags, setSelectedTags };
};

export const useAllTasks = () => {
	const [tasks, setTasks] = useState([]);
	const [tags, setTags] = useState(null);

	$taskStats().onValue(v => console.log(v));

	useEffect(
		() => {
			const cancel = $allTasks(tags).onValue(value => {
				const tagsArray = Object.keys(tags || []);

				if (value.length === 0 && tagsArray.length > 1) {
					setTags(null)
				}
				else {
					setTasks(value);
				}
			});

			return () => cancel();
		},
		[JSON.stringify(tags)]
	);

	return {
		tasks,
		doneTask,
		doneTaskUntil,
		deleteTask,
		selectTodo,
		setTags,
		resetTask
	};

}

export const useActiveTasks = () => {
	const [tasks, setTasks] = useState([]);
	const [tags, setTags] = useState(null);

	useEffect(
		() => {
			const cancel = $activeTasks(tags).onValue(setTasks);

			return () => cancel();
		},
		[JSON.stringify(tags)]
	);

	return {
		tasks,
		doneTask,
		doneTaskUntil,
		deleteTask,
		selectTodo,
		setTags
	};
};
