-- 2026-09-24 用户确认：互动游戏从 11 月 27 日的阶段一开始记录，
-- 删除 9 月份既有的模拟训练历史。
DELETE FROM game_stage_records
WHERE patient_id = 'p-001'
  AND date BETWEEN '2026-09-01' AND '2026-09-30';
