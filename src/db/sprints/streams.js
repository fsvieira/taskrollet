import { fromBinder, interval } from "baconjs";
import { dbSprints } from "./db";
import { $tasks } from "../tasks/streams";

import moment from "moment";

export const $activeSprints  = tags => 
  fromBinder(sink => {
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
  
const $interval = delay => 
  fromBinder(sink => {
    sink(moment().valueOf());

    const id = setInterval(() => sink(moment().valueOf()), delay);

    return () => clearInterval(id);
  });



export const $activeSprintsTasks = (tags, filter={deleted: null}) => 
  $activeSprints(tags)
    .combine(
      $tasks(tags, filter).combine($interval(1000 * 60), tasks => tasks),
      (sprints, tasks) => {
        const now = moment().valueOf();

        console.log(now);
        sprints = sprints.concat([{tags: [], empty: true}]);

        tasks.forEach(t => t.computed = {sprints: []}); 

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
            console.log(sprint.doneTasks);

            const lastestClosedTask = moment(
              sprint.doneTasks && sprint.doneTasks.length?
              sprint.doneTasks[sprint.doneTasks.length - 1].closedAt:
              sprint.openTasks[sprint.openTasks.length - 1].createdAt
            ).valueOf();

            openAvg = sprint.openTasks.reduce((avg, task) => {
              const createdAt = moment(task.createdAt).valueOf();

              let delta;
              if (lastestClosedTask > createdAt) {
                delta = now - lastestClosedTask;
              }
              else {
                delta = now - createdAt;
              }

              // const delta = now - moment(task.createdAt).valueOf();
              return avg===null?delta:(avg + delta) / 2;
            }, null);

            const dueTime = moment(sprint.date).valueOf() - now;
            sprint.taskDueAvg = dueTime / sprint.openTasks.length;

            sprint.openTasks.forEach(task => {
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

        return {sprints, tasks: tasks.filter(task => !(task.deleted || task.done))};
      }
    );
