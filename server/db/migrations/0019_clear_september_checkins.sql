-- 2026-09-23 用户确认：
-- 1. 9 月 1 日至 26 日的打卡记录全部留空；
-- 2. 9 月 27 日才正式开始六餐计划，此前没有生效计划。
DELETE FROM check_ins
WHERE patient_id = 'p-001'
  AND date BETWEEN '2026-09-01' AND '2026-09-26';

-- 旧七项计划不再参与任何日期的展示。
UPDATE task_defs
SET active_to = '2026-08-31'
WHERE patient_id = 'p-001'
  AND id IN (
    'task-feed-meal-1', 'task-feed-medication', 'task-feed-meal-2',
    'task-feed-snack-1', 'task-feed-meal-3', 'task-feed-snack-2', 'task-feed-meal-4'
  );

WITH feeding_tasks(id, title, scheduled_time, instruction) AS (
  VALUES
    ('task-feed-v2-meal-1', '第一餐正餐', '08:00', '山药瘦肉粥'),
    ('task-feed-v2-meal-2', '第二餐正餐', '12:00', '菠菜鱼片粥'),
    ('task-feed-v2-snack-1', '第一餐辅餐', '14:00', '过滤果蔬汁'),
    ('task-feed-v2-meal-3', '第三餐正餐', '16:00', '胡萝卜鸡肉粥'),
    ('task-feed-v2-snack-2', '第二餐辅餐', '18:00', '过滤果蔬汁'),
    ('task-feed-v2-meal-4', '第四餐正餐', '20:00', '去油南瓜排骨粥')
)
INSERT INTO task_defs
  (id, patient_id, kind, title, scheduled_time, instruction, cautions,
   requires_video_upload, origin, confirmed_on, active_from, active_to)
SELECT id, 'p-001', 'record', title, scheduled_time, instruction, '[]',
       0, 'user_provided', '2026-09-23', '2026-09-27', '2026-11-26'
FROM feeding_tasks
WHERE EXISTS (SELECT 1 FROM patients WHERE id = 'p-001')
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  scheduled_time = excluded.scheduled_time,
  instruction = excluded.instruction,
  active_from = excluded.active_from,
  active_to = excluded.active_to;
