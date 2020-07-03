import { AppToaster } from '../Notification';
import { addTask, editTask } from '../../db/tasks/db';
import { Intent } from "@blueprintjs/core";

export function getTags(text) {
    const tags = (text.match(/#([^\s]+)/g) || []).concat(["all"]).map(t => t.replace("#", ""));

    return tags.reduce((acc, tag) => {
        acc[tag] = true;
        return acc;
    }, {})
}

export function getTagsList(text) {
    const tags = (text.match(/#([^\s]+)/g) || []).concat(["all"]).map(t => t.replace("#", ""));

    return [...new Set(tags)].map(id => ({ type: "tag", id }));
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
        type: "task",
        id: task ? task.id : undefined,
        attributes: {
            description: text,
            doneUntil: task ? task.doneUntil : undefined,
            createdAt: task ? task.createdAt : undefined
        },
        relationships: {
            tags: {
                data: getTagsList(text)
            }
        }
    };
}

export async function splitTask(task, textA, textB, onSave) {
    const aTask = getTask(textA, task);
    const bTask = getTask(textB);

    const msg = (aTask.attributes.description.length > 8 ? aTask.attributes.description.substring(0, 8) + "..." : aTask.attributes.description) + " / " +
        (bTask.attributes.description.length > 8 ? bTask.attributes.description.substring(0, 8) + "..." : bTask.attributes.description);

    try {
        await editTask(aTask);
        await addTask(bTask, aTask.attributes.createdAt);

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
    if (text.trim() === "") {
        AppToaster.show({
            message: `Task description can't be empty.`,
            intent: Intent.DANGER
        });

        return false;
    }

    const newTask = getTask(text, task);

    const msg = newTask.attributes.description.length > 10 ? newTask.attributes.description.substring(0, 10) + "..." : newTask.attributes.description;

    try {
        await (newTask.id ? editTask(newTask) : addTask(newTask));

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


