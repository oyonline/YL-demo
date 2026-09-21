CREATE TABLE game_stage_records (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  task_id TEXT NOT NULL REFERENCES task_defs(id),
  date TEXT NOT NULL,
  action_id TEXT NOT NULL,
  action_title TEXT NOT NULL,
  action_index INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  duration_sec INTEGER NOT NULL CHECK(duration_sec >= 1),
  pause_count INTEGER NOT NULL DEFAULT 0,
  retry_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK(status IN ('completed','stopped')),
  recorded_by TEXT REFERENCES users(id),
  UNIQUE(patient_id, session_id, action_id)
);

CREATE INDEX idx_game_stages_patient_date
  ON game_stage_records(patient_id, date, action_index);

-- 既有预览库补三次演示历史；真实训练完成后按 session_id / action_id 幂等覆盖当日记录。
INSERT INTO game_stage_records
  (id,patient_id,session_id,task_id,date,action_id,action_title,action_index,
   started_at,completed_at,duration_sec,pause_count,retry_count,status)
SELECT
  'game-demo-' || day_offset || '-' || action_index,
  'p-001', 'game-demo-' || day_offset, 'task-cognition', date('now','localtime',day_offset || ' day'),
  action_id, action_title, action_index,
  datetime('now','localtime',day_offset || ' day','-3 hour'),
  datetime('now','localtime',day_offset || ' day','-3 hour','+' || duration_sec || ' second'),
  duration_sec, pause_count, retry_count, 'completed'
FROM (
  SELECT '-3' day_offset, 'march-warmup' action_id, '踏步热身' action_title, 0 action_index, 128 duration_sec, 0 pause_count, 0 retry_count UNION ALL
  SELECT '-3','side-step','左右侧步',1,112,0,0 UNION ALL
  SELECT '-3','walking-transition','前后侧步',2,134,0,1 UNION ALL
  SELECT '-3','arm-step','上肢拍手',3,96,0,0 UNION ALL
  SELECT '-3','arm-cross','上肢拍肩',4,103,0,0 UNION ALL
  SELECT '-3','reach-march','上肢交替拍手肘',5,141,0,0 UNION ALL
  SELECT '-2','march-warmup','踏步热身',0,121,0,0 UNION ALL
  SELECT '-2','side-step','左右侧步',1,106,0,0 UNION ALL
  SELECT '-2','walking-transition','前后侧步',2,126,0,0 UNION ALL
  SELECT '-2','arm-step','上肢拍手',3,91,0,0 UNION ALL
  SELECT '-2','arm-cross','上肢拍肩',4,98,0,0 UNION ALL
  SELECT '-2','reach-march','上肢交替拍手肘',5,132,0,0 UNION ALL
  SELECT '-1','march-warmup','踏步热身',0,116,0,0 UNION ALL
  SELECT '-1','side-step','左右侧步',1,101,0,0 UNION ALL
  SELECT '-1','walking-transition','前后侧步',2,118,0,0 UNION ALL
  SELECT '-1','arm-step','上肢拍手',3,87,0,0 UNION ALL
  SELECT '-1','arm-cross','上肢拍肩',4,94,0,0 UNION ALL
  SELECT '-1','reach-march','上肢交替拍手肘',5,124,0,0
)
WHERE EXISTS (SELECT 1 FROM patients WHERE id='p-001')
  AND EXISTS (SELECT 1 FROM task_defs WHERE id='task-cognition');
