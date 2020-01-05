import React from "react";

import {
  Colors
} from "@blueprintjs/core";


function toHours (d) {
    if (d) {
        return (d / (1000 * 60 * 60)).toFixed(2) + " hours";
    }
    else {
        return "None";
    }
}

export default function SprintStats ({
    sprint: {
        openTasksTotal,
        doneTasksTotal,
        total,
        taskDueAvg,
        doneAvg,
        nextTodoAvgDueTime,
        oldestOpenTask,
        estimatedDueDate,
        date
    }
}) {
    const chart = <div style={{width: "100%",  height: "0.5em"}}>
        <div style={{ float: "left", backgroundColor: Colors.GREEN5, height: "100%", width: `${(doneTasksTotal / total) * 100}%` }} ></div>
        <div style={{ float: "left", backgroundColor: Colors.RED5, height: "100%", width: `${(openTasksTotal / total) * 100}%` }} ></div>
    </div>;

    return (
        <div>
            {chart}
            <p>Open Tasks: {openTasksTotal}</p>
            <p>Estimated Due Date: {new Date(estimatedDueDate).toISOString().substring(0, 10)}</p>
            <p>Total Tasks: {total}</p>
            <p>Ideal Close Task Time: {toHours(taskDueAvg)}</p>
            <p>Avg Close Task Time: {toHours(doneAvg)}</p>
            <p>Next Todo Time: {toHours(nextTodoAvgDueTime)}</p>
            <p>Oldest Open Task: {oldestOpenTask?new Date(oldestOpenTask).toISOString().substring(0, 10):"None"}</p>
            <p>Time Remaning: {toHours(new Date(date).getTime() - new Date().getTime())}</p>
        </div>
    );
}
