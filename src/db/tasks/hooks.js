import { useState, useEffect } from 'react';
import { $activeTags, $activeTasks } from "./streams";
import { doneTask, deleteTask } from "./db";
import { selectTodo } from "../todo/db";

export const useActiveTags = () => {
    const [tags, setTags] = useState({all: true});
    
    useEffect(
        () => {$activeTags().forEach(setTags)},
        [true]
    );
  
    return tags;
}

export const useActiveTasks = () => {
    const [tasks, setTasks] = useState([]);
    
    useEffect(
        () => {$activeTasks().forEach(setTasks)},
        [true]
    );
  
    return {tasks, doneTask, deleteTask, selectTodo};
}
