import { AppToaster } from '../Notification';
import { addTask } from '../../db/tasks/db';
import { Intent } from "@blueprintjs/core";

export function getTags(text) {
    const tags = (text.match(/#([^\s]+)/g) || []).concat(["all"]).map(t => t.replace("#", ""));

    return tags.reduce((acc, tag) => {
        acc[tag] = true;
        return acc;
    }, {})
}

// TODO: is this the same as getTags ???
export function parseValue(value, tags) {
    const pTags = Object.keys(tags).map(t => t.replace("#", ""));

    if (value) {
        const eTags = value.match(/\#([^\s]+)\s/g);

        if (eTags) {
            const newTags = [...new Set(pTags.concat(eTags.map(t => t.replace("#", "").replace(/[\s]/, ""))))];
            newTags.sort();
            return newTags;
        }
    }

    return pTags;
}

function getTask(text, task) {
    return {
        description: text,
        doneUntil: task ? task.doneUntil : undefined,
        createdAt: task ? task.createdAt : undefined,
        tags: getTags(text),
        _id: task ? task._id : undefined,
        _rev: task ? task._rev : undefined
    };
}

export async function splitTask(task, textA, textB, onSave) {
    const aTask = getTask(textA, task);
    const bTask = getTask(textB);

    const msg = (aTask.description.length > 8 ? aTask.description.substring(0, 8) + "..." : aTask.description) + " / " +
        (bTask.description.length > 8 ? bTask.description.substring(0, 8) + "..." : bTask.description);

    try {
        await addTask(aTask);
        await addTask(bTask, aTask.createdAt);

        AppToaster.show({
            message: `Tasks Splited: ${msg}`,
            intent: Intent.SUCCESS
        });

        onSave && onSave();
    }
    catch (e) {
        console.log(e);
        AppToaster.show({
            message: `Fail to split Tasks: ${msg}`,
            intent: Intent.DANGER
        });

        return false;
    }

    return true;
}

export async function addTaskText(task, text, onSave) {
    const newTask = getTask(text, task);

    const msg = newTask.description.length > 10 ? newTask.description.substring(0, 10) + "..." : newTask.description;

    try {
        await addTask(newTask);

        AppToaster.show({
            message: `Task ${task ? "Saved" : "Added"}: ${msg}`,
            intent: Intent.SUCCESS
        });

        onSave && onSave();
    }
    catch (e) {
        console.log(e);
        AppToaster.show({
            message: `Fail to ${task ? "save" : "add"} Task: ${msg}`,
            intent: Intent.DANGER
        });

        return false;
    }

    return true;
}


