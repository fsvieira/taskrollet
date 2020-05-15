import React from "react";

import {
  Classes,
  Position,
  Callout,
  Intent,
  Divider,
  Button,
  Popover,
  H5
} from "@blueprintjs/core";

import TagsList from "../Tags/TagsList";
import SprintStats, { duration } from "./SprintStats";

import moment from "moment";

/*function duration(d) {
  console.log("Date", d)
  const md = moment.duration(d);
  return (d > 0 ? "+" : "-") + md.humanize();
}*/


export default function Sprint({ sprint, deleteSprint }) {
  const date = moment(sprint.date).format("DD-MM-YYYY");
  const days = duration(moment(sprint.date).valueOf() - moment().valueOf());

  console.log(days);

  const confirmDelete = (
    <div style={{ padding: "0.5em" }}>
      <H5>Confirm deletion</H5>
      <p>Are you sure you want to delete these items?<br />You won't be able to recover them.</p>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
        <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
          Cancel
            </Button>
        <Button
          intent={Intent.DANGER}
          className={Classes.POPOVER_DISMISS}
          onClick={() => deleteSprint(sprint)}
        >
          Delete
            </Button>
      </div>
    </div>
  );

  const title = (
    <p>
      {date} ({days})
      <span style={{ float: "right" }}>
        <Popover
          content={confirmDelete}
          position={Position.BOTTOM}
          style={{ float: "right" }}
        >
          {!sprint.empty &&
            <Button
              icon="trash"
              intent={Intent.DANGER}
              style={{ float: "right" }}
            />
          }
        </Popover>
      </span>
    </p>
  );

  const endDateTime = moment(sprint.date).valueOf();
  let intent = Intent.SUCCESS;

  if (endDateTime < sprint.estimatedDueDate) {
    intent = Intent.DANGER;
  }
  else {
    // get 15% of remaining time.
    const time = (endDateTime - moment().valueOf()) * 0.15;

    if (sprint.estimatedDueDate > endDateTime - time) {
      intent = Intent.WARNING;
    }
  }

  return (
    <Callout
      intent={intent}
      title={title}
      icon="walk"
      style={{ marginBottom: "0.5em" }}
    >
      <Divider />
      <TagsList tags={sprint.tags} />
      <SprintStats sprint={sprint} />
    </Callout>
  );

}

