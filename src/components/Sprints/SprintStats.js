import React, { useState } from "react";

import {
    Icon
} from "@blueprintjs/core";

import ProgressChart from "../charts/ProgessChart";
import { useTranslation } from 'react-i18next';

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
        attributes: {
            total,
            taskDueAvg,
            doneAvg,
            nextTodoAvgDueTime,
            oldestOpenTask,
            estimatedDueDate,
            date,
            inSprints,
            openTasksTotal,
            doneTasksTotal
        }
    },
    date: sprintDate
}) {

    const { t } = useTranslation();

    const [showInfo, setShowInfo] = useState(true);

    /*
    const chart = (<div style={{ width: "100%", height: "0.5em", clear: "both" }}>
        <div style={{ float: "left", backgroundColor: Colors.GREEN5, height: "100%", width: `${(doneTasksTotal / total) * 100}%` }} ></div>
        <div style={{ float: "left", backgroundColor: Colors.RED5, height: "100%", width: `${(openTasksTotal / total) * 100}%` }} ></div>
    </div>);*/
    // {chart}

    return (
        <div>
            <ProgressChart total={total} closed={doneTasksTotal} ></ProgressChart>
            <div onClick={() => setShowInfo(!showInfo)}><Icon icon="small-plus" /></div>
            {showInfo &&
                <div>
                    {sprintDate && <p>{t("DUE_DATE")}: {moment(sprintDate).format("DD-MM-YYYY")}</p>}
                    {inSprints > 0 && <p>{t("IN_SPRINTS")}: {inSprints}</p>}
                    <p>{t("OPEN_TASKS")}: {openTasksTotal}</p>
                    <p>{t("ESTIMATED_DUE_DATE")}: {moment(estimatedDueDate).format("DD-MM-YYYY HH:mm")}</p>
                    <p>{t("TOTAL_TASKS")}: {total}</p>
                    <p><sup>{t("TIME")}</sup>&frasl;<sub>{t("TASKS")}</sub> = {duration(taskDueAvg)}</p>
                    <p>{t("AVG_CLOSE_TASK_TIME")}: {duration(doneAvg)}</p>
                    <p>{t("NEXT_TODO_TIME")}: {duration(nextTodoAvgDueTime)}</p>
                    <p>{t("OLDEST_OPEN_TASK")}: {oldestOpenTask ? moment(oldestOpenTask).format("DD-MM-YYYY") : t("NONE")}</p>
                </div>
            }
        </div>
    );

    // <p>Time Remaning: {duration(moment(date).valueOf() - moment().valueOf())}</p>
}
