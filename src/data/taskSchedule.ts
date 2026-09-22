import type { ISODate, TaskDef } from './types'

/** 返回指定日期生效的计划，并按时间稳定排序。 */
export function tasksForDate(tasks: TaskDef[], date: ISODate): TaskDef[] {
  return tasks
    .filter((task) => (
      (!task.activeFrom || task.activeFrom <= date) &&
      (!task.activeTo || task.activeTo >= date)
    ))
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime) || a.id.localeCompare(b.id))
}
