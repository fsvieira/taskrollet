import { useState, useEffect } from "react";
import { $activeTags, $activeTasks, $allTasks } from "./streams";
import { doneTask, doneTaskUntil, deleteTask } from "./db";
import { selectTodo } from "../todo/db";

export const useActiveTags = (filterDoneUntil, filterTags) => {
	const [tags, setTags] = useState({ all: true });
	const [selectedTags, setSelectedTags] = useState(filterTags); // {});

	useEffect(
		() => {
			const cancel = $activeTags(selectedTags, filterDoneUntil).onValue(setTags);

			return () => cancel();
		},
		[JSON.stringify(selectedTags)]
	);

	return { tags, selectedTags, setSelectedTags };
};

export const useAllTasks = () => {
	const [tasks, setTasks] = useState([]);
	const [tags, setTags] = useState(null);

	useEffect(
		() => {
			const cancel = $allTasks(tags).onValue(setTasks);

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
