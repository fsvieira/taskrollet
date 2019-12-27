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

export function PrettyDescription ({description}) {
  return description.split(/([^ \n\t]+)/).map(
    (elem, i) => {
      if (elem.startsWith("#")) {
        return <span key={i} style={{color: Colors.BLUE3}}>{elem}</span>
      }
      else if (elem === '\n') {
        return <br key={i} />
      }
      else if (elem === '\t') {
        return <span key={i} style={{width: "3em"}}></span>
      }

      return <span key={i}>{elem}</span>;
    }
  );
}

export default function Task ({
  task,
  doneTask,
  dismissTask,
  deleteTask,
  children
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
        {children &&         
        <header>
          {children}
          <div style={{clear: "both"}}></div> 
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
            {dismissTask && <Button icon="swap-vertical" onClick={() => dismissTask(task)} disabled={!task}>Dismiss</Button>}
            {deleteTask && <Button icon="trash" onClick={() => deleteTask(task)} disabled={!task}>Delete</Button>}
          </ButtonGroup>

          <div style={{float: "right", color: Colors.BLUE3}}>{date}</div>
      </footer>
      </section>
    </Card>
  );
}

