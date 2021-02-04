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

/*
export function getTagsList(text) {
    const tags = (text.match(/#([^\s]+)/g) || []).concat(["all"]).map(t => t.replace("#", ""));

    return [...new Set(tags)].map(id => ({ type: "tag", id }));
}*/

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
        ...(task || {}),
        description: text,
        tags: getTags(text)
    };
}

export async function splitTask(t, task, textA, textB, onSave) {
    const aTask = getTask(textA, task);
    const bTask = getTask(textB);

    const msg = (aTask.description.length > 8 ? aTask.description.substring(0, 8) + "..." : aTask.description) + " / " +
        (bTask.description.length > 8 ? bTask.substring(0, 8) + "..." : bTask.description);

    try {
        await editTask(aTask);
        await addTask(bTask, aTask.createdAt);

        AppToaster.show({
            message: `${t("TASKS_SPLITED")}: ${msg}`,
            intent: Intent.SUCCESS
        });

        onSave && onSave();
    }
    catch (e) {
        console.log(e);
        AppToaster.show({
            message: `${t("FAIL_SPLIT_TASKS")}: ${msg}`,
            intent: Intent.DANGER
        });

        return false;
    }

    return true;
}

export async function addTaskText(t, task, text, onSave) {
    if (text.trim() === "") {
        AppToaster.show({
            message: t("TASK_DESC_CANT_BE_EMPTY"),
            intent: Intent.DANGER
        });

        return false;
    }

    const newTask = getTask(text, task);

    const msg = newTask.description.length > 10 ? newTask.description.substring(0, 10) + "..." : newTask.description;

    try {
        await (newTask.taskID ? editTask(newTask) : addTask(newTask));

        AppToaster.show({
            message: // `${t("TASK")} ${(task ? t("SAVED") : t("ADDED")).toLowerCase()}: ${msg}`,
                t(`TASK_${task ? "SAVED" : "ADDED"}`, { message: msg }),
            intent: Intent.SUCCESS
        });

        onSave && onSave();
    }
    catch (e) {
        console.log(e);
        AppToaster.show({
            message: // `${t("FAIL_TO")} ${(task ? "SAVE" : "ADD").toLowerCase()} ${t("TASK").toLowerCase()}: ${msg}`,
                t(`TASK_FAIL_TO_${task ? "SAVE" : "ADD"}`, { message: msg }),
            intent: Intent.DANGER
        });

        return false;
    }

    return true;
}


