-- 2026-09-22 用户提供：9 月 1 日至 28 日每天执行七项鼻饲饮食与用药安排。
-- 9 月 29 日起继续使用原有训练计划；既有打卡记录不删除、不改写。
UPDATE task_defs
SET active_from = '2026-09-29', active_to = NULL
WHERE patient_id = 'p-001'
  AND id IN (
    'task-vitals-morning', 'task-med-morning', 'task-lower-limb', 'task-swallow',
    'task-cognition', 'task-skin', 'task-vitals-night'
  );

WITH new_tasks(id, kind, title, scheduled_time, instruction) AS (
  VALUES
    ('task-feed-meal-1', 'record', '正餐1', '07:00', '山药瘦肉粥'),
    ('task-feed-medication', 'medication', '鼻饲后给予降压药', '07:30', '做好冲管'),
    ('task-feed-meal-2', 'record', '正餐2', '11:00', '菠菜鱼片粥'),
    ('task-feed-snack-1', 'record', '辅食加餐1', '13:00', '过滤果蔬汁'),
    ('task-feed-meal-3', 'record', '正餐3', '15:00', '胡萝卜鸡肉粥'),
    ('task-feed-snack-2', 'record', '辅食加餐2', '17:00', '过滤果蔬汁'),
    ('task-feed-meal-4', 'record', '正餐4', '19:00', '去油南瓜排骨粥')
)
INSERT INTO task_defs
  (id, patient_id, kind, title, scheduled_time, instruction, cautions,
   requires_video_upload, origin, confirmed_on, active_from, active_to)
SELECT id, 'p-001', kind, title, scheduled_time, instruction, '[]',
       0, 'user_provided', '2026-09-22', '2026-09-01', '2026-09-28'
FROM new_tasks
WHERE EXISTS (SELECT 1 FROM patients WHERE id = 'p-001');
