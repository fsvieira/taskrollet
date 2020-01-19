import { useState, useEffect } from "react";
import { $activeTags, $activeTasks } from "./streams";
import { doneTask, deleteTask } from "./db";
import { selectTodo } from "../todo/db";

export const useActiveTags = () => {
	const [tags, setTags] = useState({ all: true });

	useEffect(
		() => {
			const cancel = $activeTags().onValue(setTags);

			return () => cancel();
		},
		[true]
	);

	return tags;
};

export const useActiveTasks = () => {
	const [tasks, setTasks] = useState([]);
	const [tags, setTags] = useState(null);

	console.log(tags);

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
		deleteTask,
		selectTodo,
		setTags
	};
};
