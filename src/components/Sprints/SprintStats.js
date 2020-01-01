import React from "react";

import {
  Classes,
  Drawer,
  Position,
  Callout,
  Intent,
  Divider,
  Button,
  Popover,
  H5,
  Colors
} from "@blueprintjs/core";


function toHours (d) {
    return (d / (1000 * 60 * 60)).toFixed(2) + " hours";
}

export default function SprintStats ({
    sprint: {
        openTasksTotal,
        deletedTasksTotal,
        doneTasksTotal,
        total,
        avgTaskTime,
        avgTaskDoneTime,
        nextTODOTime,
        oldestOpenTask,
        expectedDueDate,
        date
    }
}) {
    const chart = <div style={{width: "100%",  height: "0.5em"}}>
        <div style={{ float: "left", backgroundColor: Colors.GRAY5, height: "100%", width: `${(deletedTasksTotal / total) * 100}%` }} ></div>
        <div style={{ float: "left", backgroundColor: Colors.GREEN5, height: "100%", width: `${(doneTasksTotal / total) * 100}%` }} ></div>
        <div style={{ float: "left", backgroundColor: Colors.RED5, height: "100%", width: `${(openTasksTotal / total) * 100}%` }} ></div>
    </div>;

    return (
        <div>
            {chart}
            <p>Open Tasks: {openTasksTotal}</p>
            <p>Expected Due Date: {new Date(expectedDueDate).toISOString().substring(0, 10)}</p>
            <p>Total Tasks: {total}</p>
            <p>Ideal Close Task Time: {toHours(avgTaskTime)}</p>
            <p>Avg Close Task Time: {toHours(avgTaskDoneTime)}</p>
            <p>Next TODO Time: {toHours(nextTODOTime)}</p>
            <p>Oldest Open Task: {new Date(oldestOpenTask).toISOString().substring(0, 10)}</p>
            <p>Time Remaning: {toHours(new Date(date).getTime() - new Date().getTime())}</p>
        </div>
    );
}
