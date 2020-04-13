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
  dismissTodo,
  deleteTask,
  selectTodo,
  canEditTask,
  canSplitTask,
  doneUntilTask,
  children
}) {
  const description = task ? task.description : "There is no tasks, please add some!!";
  const date = (task ? moment(task.createdAt) : moment()).calendar();

  const [editTaskIsOpen, setEditTaskIsOpen] = useState(false);
  const [splitTaskIsOpen, setSplitTaskIsOpen] = useState(false);
  const [doneUntilIsOpen, setDoneUntilIsOpen] = useState(false);

  const closeTaskEditor = () => setEditTaskIsOpen(false);
  const closeTaskSplit = () => setSplitTaskIsOpen(false);
  const closeDoneUntil = () => setDoneUntilIsOpen(false);

  canSplitTask = task => {
    alert(task.attributes.description + " :: " + time);
  }

  const doneUntilSelectTime = (e) => {
    const value = e.target.value;
    console.log("TODO: Value ==> ", value);

    closeDoneUntil();
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

      {doneUntilTask &&
        <Dialog
          icon="info-sign"
          isOpen={doneUntilIsOpen}
          onClose={closeDoneUntil}
          title="Done Until!!"
        >
          <div className={Classes.DIALOG_BODY}>
            <RadioGroup
              label="Done Until"
              onChange={doneUntilSelectTime}
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
            {doneUntilTask && <Button icon="tick" onClick={() => setDoneUntilIsOpen(true)} disabled={!task}>Done Until</Button>}
            {dismissTodo && <Button icon="swap-vertical" onClick={() => dismissTodo(task)} disabled={!task}>Dismiss</Button>}
            {canEditTask && <Button icon='edit' onClick={() => setEditTaskIsOpen(true)} disabled={!task}>Edit</Button>}
            {canSplitTask && <Button icon='fork' onClick={() => setSplitTaskIsOpen(true)} disabled={!task}>Split</Button>}
            {selectTodo && <Button icon="pin" onClick={() => selectTodo(task)} disabled={!task}>To do</Button>}
            {deleteTask && <Button icon="trash" onClick={() => deleteTask(task)} disabled={!task}>Delete</Button>}
          </ButtonGroup>

          <div style={{ float: "right", color: Colors.BLUE3 }}>{date}</div>
        </footer>
      </section>
    </Card>
  );
}

