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

import moment from "moment";

export function PrettyDescription ({description}) {
  const tokens = description.match(/([^\s]+)|(\s)/g);

  return tokens.map(
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
  dismissTodo,
  deleteTask,
  selectTodo,
  children
}) {
  const description = task?task.description:"There is no tasks, please add some!!";
  const date = (task?moment(task.createdAt):moment()).calendar();

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
            {dismissTodo && <Button icon="swap-vertical" onClick={() => dismissTodo(task)} disabled={!task}>Dismiss</Button>}
            {selectTodo && <Button icon="pin" onClick={() => selectTodo(task)} disabled={!task}>To do</Button>}
            {deleteTask && <Button icon="trash" onClick={() => deleteTask(task)} disabled={!task}>Delete</Button>}
          </ButtonGroup>

          <div style={{float: "right", color: Colors.BLUE3}}>{date}</div>
      </footer>
      </section>
    </Card>
  );
}

