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

import TaskEditor from "./Editor/TaskEditor";
import TaskSplit from "./Editor/TaskSplit";

export function PrettyDescription({ description }) {
  const tokens = description.match(/([^\s]+)|(\s)/g);

  if (tokens) {
    return tokens.map(
      (elem, i) => {
        if (elem.startsWith("#")) {
          return <span key={i} style={{ color: Colors.BLUE3 }}>{elem}</span>
        }
        else if (elem.startsWith("http://") || elem.startsWith("https://")) {
          return <a href={elem} target="_blank">{elem}</a>
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
  else {
    return <span></span>;
  }
}


export default function Task({
  task,
  doneTask,
  doneTaskUntil,
  dismissTodo,
  deleteTask,
  selectTodo,
  canEditTask,
  canSplitTask,
  children
}) {
  const description = task ? task.description : "There is no tasks, please add some!!";
  const date = (task ? moment(task.createdAt) : moment()).calendar();

  const now = moment();

  const dateUntil = task && task.doneUntil && moment(task.doneUntil).isAfter(now)
    ? moment(task.doneUntil).calendar() : undefined;

  const [editTaskIsOpen, setEditTaskIsOpen] = useState(false);
  const [doneTaskUntilIsOpen, setDoneTaskUntilIsOpen] = useState(false);

  const closeTaskEditor = () => setEditTaskIsOpen(false);
  const closeDoneTaskUntil = () => setDoneTaskUntilIsOpen(false);

  const [splitTaskIsOpen, setSplitTaskIsOpen] = useState(false);
  const closeTaskSplit = () => setSplitTaskIsOpen(false);

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

  return (
    <Card
      interactive={true}
      elevation={Elevation.TWO}
      style={{
        height: "100%",
        backgroundColor: dateUntil ? "#CFF3D2" : undefined
      }}
    >
      {canEditTask &&
        <Dialog
          style={{
            maxWidth: "100%",
            width: "980px",
            height: "620px",
            maxHeight: "90vh"
          }}
          icon="info-sign"
          isOpen={editTaskIsOpen}
          onClose={closeTaskEditor}
          title="Edit Task!!"
        >
          <div className={Classes.DIALOG_BODY}>
            <TaskEditor height="90%" task={task} onSave={closeTaskEditor} ></TaskEditor>
          </div>
        </Dialog>
      }

      {canSplitTask &&
        <Dialog
          style={{
            maxWidth: "100%",
            width: "980px",
            height: "620px",
            maxHeight: "90vh"
          }}
          icon="info-sign"
          isOpen={splitTaskIsOpen}
          onClose={closeTaskSplit}
          title="Split Task!!"
        >
          <div className={Classes.DIALOG_BODY}>
            <TaskSplit height="45%" task={task} onSave={closeTaskSplit} ></TaskSplit>
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
            {canSplitTask && <Button icon='fork' onClick={() => setSplitTaskIsOpen(true)} disabled={!task}>Split</Button>}
            {selectTodo && <Button icon="pin" onClick={() => selectTodo(task)} disabled={!task}>To do</Button>}
            {deleteTask && <Button icon="trash" onClick={() => deleteTask(task)} disabled={!task}>Delete</Button>}
          </ButtonGroup>

          {!dateUntil &&
            < div style={{ float: "right", color: Colors.BLUE3 }}>
              {date}
            </div>
          }
          {dateUntil &&
            <div style={{ float: "right", color: Colors.BLUE3 }}>
              Done Until: {dateUntil}
            </div>
          }

        </footer>
      </section>
    </Card >
  );
}

