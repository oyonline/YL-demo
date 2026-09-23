-- 2026-09-23 用户确认三段计划：
-- 1. 9 月 27 日前保留既有七项饮食与用药历史；
-- 2. 9 月 27 日至 11 月 26 日执行六项饮食计划；
-- 3. 11 月 27 日起执行五项血压与康复计划。

UPDATE task_defs
SET active_to = '2026-09-26'
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

UPDATE task_defs
SET title = '晨起测量血压', scheduled_time = '07:00',
    active_from = '2026-11-27', active_to = NULL
WHERE patient_id = 'p-001' AND id = 'task-vitals-morning';

INSERT INTO task_defs
  (id, patient_id, kind, title, scheduled_time, instruction, cautions,
   requires_video_upload, origin, confirmed_on, active_from, active_to)
SELECT 'task-vitals-afternoon', 'p-001', 'record', '血压测量', '15:00',
       '测量血压并记录。', '[]', 0, 'therapist_confirmed', '2026-09-23',
       '2026-11-27', NULL
WHERE EXISTS (SELECT 1 FROM patients WHERE id = 'p-001')
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  scheduled_time = excluded.scheduled_time,
  instruction = excluded.instruction,
  active_from = excluded.active_from,
  active_to = excluded.active_to;

UPDATE task_defs
SET title = '智能辅具助力行走', scheduled_time = '15:30',
    active_from = '2026-11-27', active_to = NULL
WHERE patient_id = 'p-001' AND id = 'task-cognition';

UPDATE task_defs
SET title = '非遗踏鼓', scheduled_time = '16:30',
    active_from = '2026-11-27', active_to = NULL
WHERE patient_id = 'p-001' AND id = 'task-skin';

UPDATE task_defs
SET title = '睡前测量血压', scheduled_time = '20:30',
    active_from = '2026-11-27', active_to = NULL
WHERE patient_id = 'p-001' AND id = 'task-vitals-night';

-- 已被新计划移除的三项若有旧打卡则保留定义供历史关联，否则直接清理。
UPDATE task_defs
SET active_to = '2026-09-26'
WHERE patient_id = 'p-001'
  AND id IN ('task-med-morning', 'task-lower-limb', 'task-swallow');

DELETE FROM reminders
WHERE patient_id = 'p-001'
  AND id IN ('rm-med', 'rm-training', 'rm-swallow');

DELETE FROM task_defs
WHERE patient_id = 'p-001'
  AND id IN ('task-med-morning', 'task-lower-limb', 'task-swallow')
  AND NOT EXISTS (SELECT 1 FROM check_ins WHERE check_ins.task_id = task_defs.id);

INSERT INTO reminders (id, patient_id, time, text, task_id, highlight, enabled)
SELECT 'rm-bp-afternoon', 'p-001', '15:00',
       '15:00 血压测量时间到了，请测量并记录。',
       'task-vitals-afternoon', 0, 1
WHERE EXISTS (SELECT 1 FROM patients WHERE id = 'p-001')
ON CONFLICT(id) DO UPDATE SET
  time = excluded.time,
  text = excluded.text,
  task_id = excluded.task_id,
  enabled = 1;

UPDATE reminders
SET time = '15:30',
    text = '🦿 15:30 智能辅具助力行走时间到了，请先完成设备与环境检查，再跟随动态图完成下肢步态与上肢协同六个训练阶段，全程在旁保护。'
WHERE patient_id = 'p-001' AND id = 'rm-cognition';

UPDATE reminders
SET time = '16:30',
    text = '🎵 16:30 非遗踏鼓时间到了，请充分热身，建议训练 10 分钟。'
WHERE patient_id = 'p-001' AND id = 'rm-skin';
