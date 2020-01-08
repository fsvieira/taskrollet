import { fromBinder } from "baconjs";
import { dbSprints } from "./db";
import { $tasks } from "../tasks/streams";

import moment from "moment";

export function $activeSprints (tags) {
  // TODO: filter by tags
  return fromBinder(sink => {
    const find = () => {
      dbSprints.allDocs({
        include_docs: true
      }).then(
        ({rows}) => sink(rows.map(r => r.doc))
      );
    };
  
    const sprintChanges = dbSprints.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on("change", () => find());

    find();

    return () => sprintChanges.cancel();
  });
}
  
export function $activeSprintsTasks (tags, filter={deleted: null}) {
    return $activeSprints(tags).combine(
      $tasks(tags, filter),
      (sprints, tasks) => {
        const now = moment().valueOf();
        // const tasksSprintsCounter = {};
        // const tasksSprints = {};

        // tasks.forEach(task => tasksSprintsCounter[task._id] = []);

        // add an empty sprint
        sprints.push({tags: [], empty: true});

        tasks.forEach(t => t.computed = {}); 

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

          sprint.openTasks = sprint.tasks.filter(task => !(task.deleted || task.done))
            .sort((a, b) => moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf());
          ;

          sprint.doneTasksTotal = 0;
          sprint.doneTasks = sprint.tasks.filter(
              task => {
                  const r = !task.deleted && task.done;

                  sprint.doneTasksTotal += r?1:0;

                  return r;
                }
              )
            .filter(task => moment(task.closedAt).valueOf() > moment().valueOf() - (1000 * 60 * 60 * 24 * 30 * 4))
            .sort((a, b) => moment(a.closedAt).valueOf() - moment(b.closedAt).valueOf());

          let openAvg = 0;

          sprint.taskDueAvg;

          if (sprint.openTasks.length) {
            openAvg = sprint.openTasks.reduce((avg, task) => {
              const delta = now - moment(task.createdAt).valueOf();
              return avg===null?delta:(avg + delta) / 2;
            }, null);

            const dueTime = moment(sprint.date).valueOf() - now;
            sprint.taskDueAvg = dueTime / sprint.openTasks.length;

            sprint.openTasks.forEach(task => {
              task.computed = {};
              task.computed.sprints = task.computed.sprints || [];
              task.computed.sprints.push(sprint);
            });

            sprint.oldestOpenTask = sprint.openTasks[0].createdAt;
          }

          if (sprint.doneTasks.length) {
            const latestDoneTime = moment(sprint.doneTasks[0].closedAt).valueOf();
            const time = now - latestDoneTime;
            const t = (time + openAvg) / sprint.doneTasks.length;
            sprint.doneAvg = t;
          }
          else {
            sprint.doneAvg = openAvg;
          }
          
          sprint.nextTodoAvgDueTime = (sprint.doneAvg + sprint.taskDueAvg) / 2;
          sprint.estimatedDueDate = now + sprint.doneAvg * sprint.openTasks.length;

          sprint.openTasksTotal = sprint.openTasks.length;
          // sprint.doneTasksTotal = sprint.doneTasks.length;
          sprint.total = sprint.openTasksTotal + sprint.doneTasksTotal;
  
          sprint.date = sprint.date || moment(sprint.estimatedDueDate).endOf("month").toISOString();
        }

        // console.log({sprints, tasksSprintsCounter});
        // return {sprints, tasksSprintsCounter};
        return {sprints, tasks: tasks.filter(task => !(task.deleted || task.done))};
      }
    );
  }
  
  
  