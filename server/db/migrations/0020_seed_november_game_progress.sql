-- 2026-09-24 用户确认：互动游戏数据展示 11 月 27 日完成前三阶段，
-- 三段训练总用时 5 分 20 秒，并继续按完整六阶段计划统计为 3 / 6。
INSERT OR REPLACE INTO game_stage_records
  (id, patient_id, session_id, task_id, date, action_id, action_title, action_index,
   started_at, completed_at, duration_sec, pause_count, retry_count, status)
SELECT
  id, 'p-001', 'game-demo-2026-11-27', 'task-cognition', '2026-11-27',
  action_id, action_title, action_index, started_at, completed_at, duration_sec, 0, 0, 'completed'
FROM (
  SELECT 'game-demo-2026-11-27-0' id, 'march-warmup' action_id, '踏步热身' action_title,
         0 action_index, '2026-11-27T15:30:00+08:00' started_at,
         '2026-11-27T15:31:46+08:00' completed_at, 106 duration_sec
  UNION ALL
  SELECT 'game-demo-2026-11-27-1', 'side-step', '左右侧步',
         1, '2026-11-27T15:31:46+08:00', '2026-11-27T15:33:33+08:00', 107
  UNION ALL
  SELECT 'game-demo-2026-11-27-2', 'walking-transition', '前后侧步',
         2, '2026-11-27T15:33:33+08:00', '2026-11-27T15:35:20+08:00', 107
)
WHERE EXISTS (SELECT 1 FROM patients WHERE id = 'p-001')
  AND EXISTS (SELECT 1 FROM task_defs WHERE id = 'task-cognition');
