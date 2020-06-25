import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

import {
  Button,
  Divider,
  Card,
  Elevation,
  Colors,
  Dialog,
  Classes,
  RadioGroup,
  Radio,
  Checkbox,
  Tooltip,
  Position
} from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";

import moment from "moment";

import TaskEditor from "./Editor/TaskEditor";
// import TaskSplit from "./Editor/TaskSplit";

import { addTask } from '../db/tasks/db';

import ProgressChart from "./charts/ProgessChart";

export function getTokens(description) {
  return description.match(/(#|http)([^\s]+)|\[ \]|\[x\]|\[X\]|[ \n\t]|([^\s]+)/g);
}


export function PrettyDescription({ description, task }) {
  const tokens = getTokens(description);

  if (tokens) {
    const { total, checked } = tokens.reduce((acc, el) => {
      if (el === "[ ]") {
        acc.total++;
      }
      else if (el.toLowerCase() === "[x]") {
        acc.total++;
        acc.checked++;
      }

      return acc;
    }, { total: 0, checked: 0 });

    const htmlDesc = tokens.map(
      (elem, i) => {
        if (elem.startsWith("#")) {
          return <span key={i} style={{ color: Colors.BLUE3 }}>{elem}</span>
        }
        else if (elem.startsWith("http://") || elem.startsWith("https://")) {
          return <a href={elem} target="_blank">{elem}</a>
        }
        else if (elem === "[ ]") {
          const newDescription = tokens.slice();
          newDescription.splice(i, 1, "[X]");
          return <Checkbox
            checked={false}
            inline={true}
            onChange={() => {
              task.description = newDescription.join("");
              addTask(task);
            }}
            key={i}
            style={{ marginRight: "0px" }}
          >
          </Checkbox>;
        }
        else if (elem === "[X]" || elem === "[x]") {
          const newDescription = tokens.slice();
          newDescription.splice(i, 1, "[ ]");
          return <Checkbox
            checked={true}
            inline={true}
            onChange={() => {
              task.description = newDescription.join("");
              addTask(task);
            }}
            key={i}
            style={{ marginRight: "0px" }}
          >
          </Checkbox>;
        }
        else if (elem === '\n') {
          return <br key={i} />
        }
        else if (elem === '\t') {
          return <span key={i} style={{ width: "3em" }}></span>
        }
        else if (elem === ' ') {
          return <>&nbsp;</>;
        }

        return <span key={i}>{elem}</span>;
      }
    );

    return <div>
      {!!total &&
        <ProgressChart
          total={total}
          closed={checked}
        />
      }
      {htmlDesc}
    </div>
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
  recoverTask,
  children
}) {
  const { t } = useTranslation();

  const description = task ? task.description : "There is no tasks, please add some!!";
  const date = (task ? moment(task.createdAt) : moment()).calendar();

  const now = moment();

  const dateUntil = task && task.doneUntil && moment(task.doneUntil).isAfter(now)
    ? moment(task.doneUntil).calendar() : undefined;

  const [editTaskIsOpen, setEditTaskIsOpen] = useState(false);
  const [doneTaskUntilIsOpen, setDoneTaskUntilIsOpen] = useState(false);

  const closeTaskEditor = () => setEditTaskIsOpen(false);
  const closeDoneTaskUntil = () => setDoneTaskUntilIsOpen(false);

  const doneTaskUntilSelectTime = async e => {
    const value = e.target.value;
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
        margin: "0.5em",
        flex: 1,
        justifyContent: "middle",
        minWidth: "20em",
        maxWidth: "100%"
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
            <TaskEditor height="90%" task={task} onSave={closeTaskEditor} canSplitTask={canSplitTask} ></TaskEditor>
          </div>
        </Dialog>
      }

      {doneTaskUntil &&
        <Dialog
          icon="info-sign"
          isOpen={doneTaskUntilIsOpen}
          onClose={closeDoneTaskUntil}
          title={`${t("DONE_UNTIL")}!!`}
        >
          <div className={Classes.DIALOG_BODY}>
            <RadioGroup
              label={t("DONE_UNTIL")}
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
          <PrettyDescription description={description} task={task} ></PrettyDescription>
        </article>
        <footer>
          <Divider />

          <div>
            {doneTask &&
              <Tooltip content={t("DONE")} position={Position.TOP}>
                <Button icon="tick" onClick={() => doneTask(task)} disabled={!task}></Button>
              </Tooltip>
            }
            {doneTaskUntil &&
              <Tooltip content={t("DONE_UNTIL")} position={Position.TOP}>
                <Button icon="automatic-updates" onClick={() => setDoneTaskUntilIsOpen(true)} disabled={!task}></Button>
              </Tooltip>
            }
            {dismissTodo &&
              <Tooltip content={t("DISMISS")} position={Position.TOP}>
                <Button icon="swap-vertical" onClick={() => dismissTodo(task)} disabled={!task}>{t("DISMISS")}</Button>
              </Tooltip>
            }
            {canEditTask &&
              <Tooltip content={t("EDIT")} position={Position.TOP}>
                <Button icon='edit' onClick={() => setEditTaskIsOpen(true)} disabled={!task}></Button>
              </Tooltip>
            }
            {/* canSplitTask && <Button icon='fork' onClick={() => setSplitTaskIsOpen(true)} disabled={!task}></Button> */}
            {selectTodo &&
              <Tooltip content={t("TODO")} position={Position.TOP}>
                <Button icon="pin" onClick={() => selectTodo(task)} disabled={!task}>{t("TODO")}</Button>
              </Tooltip>
            }
            {deleteTask &&
              <Tooltip content={t("DELETE")} position={Position.TOP}>
                <Button icon="trash" onClick={() => deleteTask(task)} disabled={!task}></Button>
              </Tooltip>
            }
            {recoverTask &&
              <Tooltip content={t("RECOVER")} position={Position.TOP}>
                <Button icon="undo" onClick={() => recoverTask(task)} disabled={!task}>{t("RECOVER")}</Button>
              </Tooltip>
            }
          </div>

          {!dateUntil &&
            < div style={{ float: "right", color: Colors.BLUE3 }}>
              {date}
            </div>
          }
          {dateUntil &&
            <div style={{ float: "right", color: Colors.BLUE3 }}>
              {t("DONE_UNTIL")}: {dateUntil}
            </div>
          }

        </footer>
      </section>
    </Card >
  );
}

