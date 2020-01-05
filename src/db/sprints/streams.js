import { fromBinder } from "baconjs";
import { dbSprints } from "./db";
import { $tasks } from "../tasks/streams";

export function $activeSprints (tags) {
    // TODO: filter by tags
    return fromBinder(sink => {
      const sprintChanges = dbSprints.changes({
        since: 'now',
        live: true,
        include_docs: true
      }).on("change", ({doc}) => sink(doc));

      dbSprints.allDocs({
        include_docs: true
      }).then(
        ({rows}) => sink(rows.map(r => r.doc))
      );

      return () => sprintChanges.cancel();
    });
  }
  
export function $activeSprintsTasks (tags) {
    return $activeSprints(tags).combine(
      $tasks(tags, {deleted: null}),
      (sprints, tasks) => {
        const now = new Date().getTime();

        const tasksSprintsCounter = {};

        for (let i=0; i<sprints.length; i++) {
          const sprint = sprints[i];

          sprint.tasks = tasks.filter(task => {
            for (let tag in sprint.tags) {
              if (!task.tags[tag]) {
                return false;
              }
            }

            return true;
          });

          sprint.openTasks = sprint.tasks.filter(task => !(task.deleted || task.done));

          sprint.doneTasks = sprint.tasks.filter(
            task => !task.deleted && task.done
              && (new Date(task.closedAt).getTime() > new Date().getTime() - (1000 * 60 * 60 * 24 * 30 * 4))  
            ).sort((a, b) => new Date(a.closedAt).getTime() - new Date(b.createdAt).getTime());

          let openAvg = 0;

          sprint.taskDueAvg = Infinity;

          if (sprint.openTasks.length) {
            openAvg = sprint.openTasks.reduce((avg, task) => {
              const t = now - new Date(task.createdAt).getTime();
              return avg===null?t:(avg + t) / 2;
            }, null);

            const dueTime = now - new Date(sprint.date).getTime();
            sprint.taskDueAvg = dueTime / sprint.openTasks.length;

            sprint.openTasks.forEach(task => {
              tasksSprintsCounter[task._id] = (tasksSprintsCounter[task._id] || 0) + 1;
            });
          }

          if (sprint.doneTasks.length) {
            const latestDoneTime = new Date(sprint.doneTasks[0].closedAt).getTime();
            const time = now - latestDoneTime;
            const t = (time + openAvg) / sprint.doneTasks.length;
            sprint.doneAvg = t;
          }
          else {
            sprint.doneAvg = openAvg;
          }

          sprint.nextTaskAvgDueTime = (sprint.doneAvg + sprint.taskDueAvg) / 2;
          sprint.estimatedDueDate = now + sprint.doneAvg * sprint.openTasks.length;
        }

        console.log({sprints, tasksSprintsCounter});
        return sprints;
      }
    );
  }
  
  
  