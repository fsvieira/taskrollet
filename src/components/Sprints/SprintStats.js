import React from "react";

import {
    Colors
} from "@blueprintjs/core";

import ProgressChart from "../charts/ProgessChart";

export function duration(d) {
    // if (d) {
    const md = moment.duration(d);
    return (d > 0 ? "+" : "-") + md.humanize();
    /*}
    else {
        return "None";
    }*/
}

import moment from "moment";

export default function SprintStats({
    sprint: {
        openTasksTotal,
        doneTasksTotal,
        total,
        taskDueAvg,
        doneAvg,
        nextTodoAvgDueTime,
        oldestOpenTask,
        estimatedDueDate,
        date,
        inSprints
    },
    date: sprintDate
}) {

    /*
    const chart = (<div style={{ width: "100%", height: "0.5em", clear: "both" }}>
        <div style={{ float: "left", backgroundColor: Colors.GREEN5, height: "100%", width: `${(doneTasksTotal / total) * 100}%` }} ></div>
        <div style={{ float: "left", backgroundColor: Colors.RED5, height: "100%", width: `${(openTasksTotal / total) * 100}%` }} ></div>
    </div>);*/
    // {chart}

    return (
        <div>
            <ProgressChart total={total} closed={doneTasksTotal} ></ProgressChart>
            {sprintDate && <p>Due Date: {moment(sprintDate).format("DD-MM-YYYY")}</p>}
            {inSprints > 0 && <p>In Sprints: {inSprints}</p>}
            <p>Open Tasks: {openTasksTotal}</p>
            <p>Estimated Due Date: {moment(estimatedDueDate).format("DD-MM-YYYY HH:mm")}</p>
            <p>Total Tasks: {total}</p>
            <p><sup>time</sup>&frasl;<sub>tasks</sub> = {duration(taskDueAvg)}</p>
            <p>Avg Close Task Time: {duration(doneAvg)}</p>
            <p>Next Todo Time: {duration(nextTodoAvgDueTime)}</p>
            <p>Oldest Open Task: {oldestOpenTask ? moment(oldestOpenTask).format("DD-MM-YYYY") : "None"}</p>
        </div>
    );

    // <p>Time Remaning: {duration(moment(date).valueOf() - moment().valueOf())}</p>
}
