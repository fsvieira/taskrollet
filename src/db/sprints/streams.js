import { fromBinder } from "baconjs";
import { dbSprints } from "./db";
import { $tasks } from "../tasks/streams";

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

          sprint.openTasks = sprint.tasks.filter(task => !(task.deleted || task.done))
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          ;

          sprint.doneTasksTotal = 0;
          sprint.doneTasks = sprint.tasks.filter(
              task => {
                  const r = !task.deleted && task.done;

                  sprint.doneTasksTotal += r?1:0;

                  return r;
                }
              )
            .filter(task => new Date(task.closedAt).getTime() > new Date().getTime() - (1000 * 60 * 60 * 24 * 30 * 4))
            .sort((a, b) => new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime());

          let openAvg = 0;

          sprint.taskDueAvg;

          if (sprint.openTasks.length) {
            openAvg = sprint.openTasks.reduce((avg, task) => {
              const delta = now - new Date(task.createdAt).getTime();
              return avg===null?delta:(avg + delta) / 2;
            }, null);

            const dueTime = new Date(sprint.date).getTime() - now;
            sprint.taskDueAvg = dueTime / sprint.openTasks.length;

            sprint.openTasks.forEach(task => {
              tasksSprintsCounter[task._id] = (tasksSprintsCounter[task._id] || 0) + 1;
            });

            sprint.oldestOpenTask = sprint.openTasks[0].createdAt;
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

          sprint.nextTodoAvgDueTime = (sprint.doneAvg + sprint.taskDueAvg) / 2;
          sprint.estimatedDueDate = now + sprint.doneAvg * sprint.openTasks.length;

          sprint.openTasksTotal = sprint.openTasks.length;
          // sprint.doneTasksTotal = sprint.doneTasks.length;
          sprint.total = sprint.openTasksTotal + sprint.doneTasksTotal;
  
        }

        console.log({sprints, tasksSprintsCounter});
        return {sprints, tasksSprintsCounter};
      }
    );
  }
  
  
  