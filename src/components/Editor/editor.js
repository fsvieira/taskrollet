import { AppToaster } from '../Notification';
import { addTask } from '../../db/tasks/db';
import { Intent } from "@blueprintjs/core";

export async function addTaskText(task, text, onSave) {
    const tags = (text.match(/#([^\s]+)/g) || []).concat(["all"]).map(t => t.replace("#", ""));
    const newTask = {
        description: text,
        tags: tags.reduce((acc, tag) => {
            acc[tag] = true;
            return acc;
        }, {}),
        _id: task ? task._id : undefined,
        _rev: task ? task._rev : undefined
    };

    const msg = newTask.description.length > 10 ? newTask.description.substring(0, 10) + "..." : newTask.description;

    try {
        await addTask(newTask);

        // setValue("");

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

