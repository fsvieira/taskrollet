import React, { useState } from "react";

import {
  Button,
  ButtonGroup,
  Divider,
  Card,
  Elevation,
  Colors,
  Dialog,
  Classes
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
  dismissTodo,
  deleteTask,
  selectTodo,
  canEditTask,
  children
}) {
  const description = task ? task.description : "There is no tasks, please add some!!";
  const date = (task ? moment(task.createdAt) : moment()).calendar();
  const [editTaskIsOpen, setEditTaskIsOpen] = useState(false);

  const closeTaskEditor = () => setEditTaskIsOpen(false);

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

