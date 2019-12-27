import React from "react";

import {
  Button,
  ButtonGroup,
  Divider,
  Card,
  Elevation,
  Colors
} from "@blueprintjs/core";

import "@blueprintjs/core/lib/css/blueprint.css";

export default function Task ({
  task,
  doneTask,
  dismissTask,
  deleteTask
}) {
  const description = task?task.description:"There is no tasks, please add some!!";
  const date = (task?new Date(task.createdAt):new Date()).toLocaleDateString();

  return (<Card 
      interactive={true} 
      elevation={Elevation.TWO}
      style={{
        height: "100%"
      }}
    >
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%"
        }}
      >
        <article
            style={{
              flex: "1 1 auto",
              overflowY: "auto",
              height: "100px"
            }}
        >
        <p style={{color: Colors.BLUE3, fontSize: "1.1em"}}>Creation Date: {date}</p>
        <pre>{description}</pre>
      </article>
    <footer>
      <Divider />
          <ButtonGroup>
            {doneTask && <Button icon="tick" onClick={() => doneTask(task)} disabled={!task}>Done</Button>}
            {dismissTask && <Button icon="swap-vertical" onClick={() => dismissTask(task)} disabled={!task}>Dismiss</Button>}
            {deleteTask && <Button icon="trash" onClick={() => deleteTask(task)} disabled={!task}>Delete</Button>}
          </ButtonGroup>
      </footer>
      </section>
    </Card>
  );
}

