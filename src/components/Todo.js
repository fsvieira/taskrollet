import React from "react";

import Task from "./Task";
import SelectTags from "./SelectTags";
import { useTodo } from "../db/todo/hooks";

import {
  Colors,
  Button,
  Icon
} from "@blueprintjs/core";


import "@blueprintjs/core/lib/css/blueprint.css";
import moment from "moment";
import { addSprint } from "../db/sprints/db";

export default function Todo() {
  const { todo, tags, setTags, doneTask, doneTaskUntil, dismissTodo, deleteTask } = useTodo();

  let taskHeader;
  if (todo && todo.task) {

    const empty = todo.task.computed.sprints.find(s => s.empty);
    const sprints = todo.task.computed.sprints.filter(s => !s.empty);

    const taskDueAvg = sprints.reduce((avg, s) => (avg + s.taskDueAvg) / 2, empty.taskDueAvg);
    const doneAvg = sprints.reduce((avg, s) => (avg + s.doneAvg) / 2, empty.doneAvg);
    const nextTodoAvgDueTime = (taskDueAvg + doneAvg) / 2;
    const inSprints = todo.task.computed.sprints.length - 1;
    const { doneTasksTotal, openTasksTotal, total } = empty;

    const estimatedDueDate = openTasksTotal * nextTodoAvgDueTime;
    let sprintUI;
    if (inSprints === 0 && openTasksTotal > 1 && estimatedDueDate > moment.duration(7, "days").valueOf()) {
      const date = moment((moment().valueOf() + estimatedDueDate)).endOf("day");
      const newSprint = { tags: tags, date: date.toDate() };
      sprintUI = <Button
        onClick={() => addSprint(newSprint)}
      >
        Create Sprint {date.format("DD-MM-YYYY")}
      </Button>;
    }
    else {
      sprintUI = <p style={{ marginLeft: "0.5em", marginRight: "0.5em" }}>In Sprints: {inSprints}</p>
    }

    // TODO: make chart a component!!
    const chart = (
      <div style={{ width: "100%", height: "0.5em", clear: "both" }}>
        <div style={{ float: "left", backgroundColor: Colors.GREEN5, height: "100%", width: `${(doneTasksTotal / total) * 100}%` }} ></div>
        <div style={{ float: "left", backgroundColor: Colors.RED5, height: "100%", width: `${(openTasksTotal / total) * 100}%` }} ></div>
      </div>
    );

    const diffTime = taskDueAvg - nextTodoAvgDueTime;

    taskHeader = (
      <div>
        <span style={{ float: "right" }}>
          <SelectTags
            onChange={tags => setTags(tags)}
            filterTags={tags}
            filterDoneUntil={true}
          />
        </span>
        <p style={{ marginLeft: "0.5em", marginRight: "0.5em" }}>Tasks: {openTasksTotal} Active, {doneTasksTotal} Done!</p>
        {sprintUI}
        <p
          style={{
            marginLeft: "0.5em",
            marginRight: "0.5em"
          }}
        >
          Suggested Time: {moment.duration(nextTodoAvgDueTime).humanize()} &nbsp;
          <span style={{
            fontWeight: "bold",
            color: diffTime >= 0 ? Colors.GREEN1 : Colors.RED1
          }}>(
            {diffTime >= 0 ? <Icon icon="trending-down" /> : <Icon icon="trending-up" />} &nbsp;
            {moment.duration(diffTime).humanize()}
            )</span>
        </p>
        <p style={{ marginLeft: "0.5em", marginRight: "0.5em" }}><sup>time</sup>&frasl;<sub>tasks</sub> = {moment.duration(taskDueAvg).humanize()}</p>
        {chart}
      </div>);
  }
  else {
    taskHeader = <div></div>;
  }

  return (
    <Task
      task={todo.task}
      doneTask={doneTask}
      doneTaskUntil={doneTaskUntil}
      dismissTodo={todo.total > 1 ? dismissTodo : undefined}
      canEditTask={true}
      canSplitTask={true}
      deleteTask={deleteTask}
    >
      {taskHeader}
    </Task>
  );
}

