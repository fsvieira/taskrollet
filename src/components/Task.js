import React, { useState } from "react";

import {
  Button,
  ButtonGroup,
  Divider,
  Card,
  Elevation,
  Colors,
  Dialog,
  Classes,
  RadioGroup,
  Radio
} from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";

import moment from "moment";
import TaskEditor from "./TaskEditor";

export function PrettyDescription({ description }) {
  const tokens = description.match(/([^\s]+)|(\s)/g);

  return tokens.map(
    (elem, i) => {
      if (elem.startsWith("#")) {
        return <span key={i} style={{ color: Colors.BLUE3 }}>{elem}</span>
      }
      else if (elem === '\n') {
        return <br key={i} />
      }
      else if (elem === '\t') {
        return <span key={i} style={{ width: "3em" }}></span>
      }

      return <span key={i}>{elem}</span>;
    }
  );
}


export default function Task({
  task,
  doneTask,
  doneTaskUntil,
  dismissTodo,
  deleteTask,
  selectTodo,
  canEditTask,
  children
}) {
  const description = task ? task.description : "There is no tasks, please add some!!";
  const date = (task ? moment(task.createdAt) : moment()).calendar();
  const [editTaskIsOpen, setEditTaskIsOpen] = useState(false);
  const [doneTaskUntilIsOpen, setDoneTaskUntilIsOpen] = useState(false);

  const closeTaskEditor = () => setEditTaskIsOpen(false);
  const closeDoneTaskUntil = () => setDoneTaskUntilIsOpen(false);

  /*const doneUntilTask = (task, time) => {
    alert(task.attributes.description + " :: " + time);
  }*/

  const doneTaskUntilSelectTime = async e => {
    const value = e.target.value;
    console.log("TODO: Value ==> ", value);

    let time;

    switch (value) {
      case "4hours":
        time = moment().add(4, "hours").toDate();
        break;

      case "tomorrow":
        time = moment().endOf("days").toDate();
        break;

      case "next week":
        time = moment().add(1, "weeks").startOf("week").toDate();
        break;

      case 'next weekday':
        time = moment().add(7, "days").startOf("day").toDate();
        break;

      case "Next month":
        time = moment().add(1, "months").startOf("month").toDate();
        break;
    }

    await doneTaskUntil(task, time);

    closeDoneTaskUntil();
  }

  const now = moment.utc();

  return (
    <Card
      interactive={true}
      elevation={Elevation.TWO}
      style={{
        height: "100%"
      }}
    >
      {canEditTask &&
        <Dialog
          icon="info-sign"
          isOpen={editTaskIsOpen}
          onClose={closeTaskEditor}
          title="Edit Task!!"
        >
          <div className={Classes.DIALOG_BODY}>
            <TaskEditor task={task} onSave={closeTaskEditor} ></TaskEditor>
          </div>
        </Dialog>
      }

      {doneTaskUntil &&
        <Dialog
          icon="info-sign"
          isOpen={doneTaskUntilIsOpen}
          onClose={closeDoneTaskUntil}
          title="Done Until!!"
        >
          <div className={Classes.DIALOG_BODY}>
            <RadioGroup
              label="Done Until"
              onChange={doneTaskUntilSelectTime}
            >
              <Radio label="4 hours" value="4hours" />
              <Radio label="Tomorrow" value="tomorrow" />
              <Radio label="Next week" value="next week" />
              <Radio label={`Next ${now.format('dddd')}`} value='next weekday' />
              <Radio label="Next month" value="Next month" />
            </RadioGroup>
          </div>
        </Dialog>
      }

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%"
        }}
      >
        {children &&
          <header>
            {children}
            <div style={{ clear: "both" }}></div>
            <Divider />
          </header>
        }
        <article
          style={{
            flex: "1 1 auto",
            overflowY: "auto",
            height: "100px"
          }}
        >
          <PrettyDescription description={description}></PrettyDescription>
        </article>
        <footer>
          <Divider />
          <ButtonGroup>
            {doneTask && <Button icon="tick" onClick={() => doneTask(task)} disabled={!task}>Done</Button>}
            {doneTaskUntil && <Button icon="tick" onClick={() => setDoneTaskUntilIsOpen(true)} disabled={!task}>Done Until</Button>}
            {dismissTodo && <Button icon="swap-vertical" onClick={() => dismissTodo(task)} disabled={!task}>Dismiss</Button>}
            {canEditTask && <Button icon='edit' onClick={() => setEditTaskIsOpen(true)} disabled={!task}>Edit</Button>}
            {selectTodo && <Button icon="pin" onClick={() => selectTodo(task)} disabled={!task}>To do</Button>}
            {deleteTask && <Button icon="trash" onClick={() => deleteTask(task)} disabled={!task}>Delete</Button>}
          </ButtonGroup>

          <div style={{ float: "right", color: Colors.BLUE3 }}>{date}</div>
        </footer>
      </section>
    </Card>
  );
}

