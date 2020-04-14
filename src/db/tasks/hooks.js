import { useState, useEffect } from "react";
import { $activeTags, $activeTasks } from "./streams";
import { doneTask, doneTaskUntil, deleteTask } from "./db";
import { selectTodo } from "../todo/db";

export const useActiveTags = () => {
	const [tags, setTags] = useState({ all: true });
	const [selectedTags, setSelectedTags] = useState({});

	useEffect(
		() => {
			const cancel = $activeTags(selectedTags).onValue(setTags);

			return () => cancel();
		},
		[JSON.stringify(selectedTags)]
	);

	return { tags, selectedTags, setSelectedTags };
};

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
