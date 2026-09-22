-- 9 月历史打卡演示数据：完整覆盖全部完成、部分完成、未开始和无记录。
-- INSERT OR IGNORE 保留任何已经由用户或护理员写入的真实演示记录。
WITH
history_days(date, done_count) AS (
  VALUES
    ('2026-09-01', 7), ('2026-09-02', 7), ('2026-09-03', 5), ('2026-09-04', 0),
    ('2026-09-05', 7), ('2026-09-06', 7), ('2026-09-07', 4),
    ('2026-09-09', 7), ('2026-09-10', 7), ('2026-09-11', 3), ('2026-09-12', 0),
    ('2026-09-13', 7), ('2026-09-14', 7), ('2026-09-15', 5),
    ('2026-09-17', 7), ('2026-09-18', 7), ('2026-09-19', 4), ('2026-09-20', 0)
),
feeding_tasks(task_id, task_time, task_index) AS (
  VALUES
    ('task-feed-meal-1', '07:00', 0),
    ('task-feed-medication', '07:30', 1),
    ('task-feed-meal-2', '11:00', 2),
    ('task-feed-snack-1', '13:00', 3),
    ('task-feed-meal-3', '15:00', 4),
    ('task-feed-snack-2', '17:00', 5),
    ('task-feed-meal-4', '19:00', 6)
),
demo_rows AS (
  SELECT
    'ci-demo-' || h.date || '-' || t.task_id AS id,
    'p-001' AS patient_id,
    t.task_id,
    h.date,
    CASE
      WHEN h.done_count = 7 THEN 'done'
      WHEN h.done_count = 0 THEN 'missed'
      WHEN t.task_index < h.done_count THEN 'done'
      WHEN t.task_index = h.done_count THEN 'difficulty'
      ELSE 'missed'
    END AS status,
    CASE WHEN t.task_index = h.done_count AND h.done_count BETWEEN 1 AND 6
      THEN '演示记录：执行时遇到困难。' ELSE NULL END AS note,
    CASE WHEN h.done_count = 7
      OR (h.done_count BETWEEN 1 AND 6 AND t.task_index <= h.done_count)
      THEN h.date || 'T' || t.task_time || ':00+08:00' ELSE NULL END AS at
  FROM history_days h CROSS JOIN feeding_tasks t
)
INSERT OR IGNORE INTO check_ins (id, patient_id, task_id, date, status, note, at)
SELECT r.id, r.patient_id, r.task_id, r.date, r.status, r.note, r.at
FROM demo_rows r
WHERE EXISTS (SELECT 1 FROM patients WHERE id = r.patient_id)
  AND EXISTS (SELECT 1 FROM task_defs WHERE id = r.task_id);
