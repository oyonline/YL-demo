-- 0011_seed_blood_pressure_history —— 为既有演示库补充最近七天血压历史。
-- 全部数值位于甲方给定安全范围，异常值保留给现场录入演示。

INSERT OR IGNORE INTO vitals
  (id,patient_id,date,time,systolic,diastolic,by,at)
SELECT 'vital-demo-d6-am','p-001',date('now','localtime','-6 day'),'07:00',128,78,'家属',date('now','localtime','-6 day') || 'T07:00:00+08:00'
WHERE EXISTS (SELECT 1 FROM patients WHERE id='p-001');
INSERT OR IGNORE INTO vitals SELECT 'vital-demo-d6-pm','p-001',date('now','localtime','-6 day'),'20:30',132,80,'家属',date('now','localtime','-6 day') || 'T20:30:00+08:00',NULL WHERE EXISTS (SELECT 1 FROM patients WHERE id='p-001');
INSERT OR IGNORE INTO vitals SELECT 'vital-demo-d5-am','p-001',date('now','localtime','-5 day'),'07:00',125,76,'家属',date('now','localtime','-5 day') || 'T07:00:00+08:00',NULL WHERE EXISTS (SELECT 1 FROM patients WHERE id='p-001');
INSERT OR IGNORE INTO vitals SELECT 'vital-demo-d5-pm','p-001',date('now','localtime','-5 day'),'20:30',130,79,'家属',date('now','localtime','-5 day') || 'T20:30:00+08:00',NULL WHERE EXISTS (SELECT 1 FROM patients WHERE id='p-001');
INSERT OR IGNORE INTO vitals SELECT 'vital-demo-d4-am','p-001',date('now','localtime','-4 day'),'07:00',127,77,'家属',date('now','localtime','-4 day') || 'T07:00:00+08:00',NULL WHERE EXISTS (SELECT 1 FROM patients WHERE id='p-001');
INSERT OR IGNORE INTO vitals SELECT 'vital-demo-d4-pm','p-001',date('now','localtime','-4 day'),'20:30',134,82,'家属',date('now','localtime','-4 day') || 'T20:30:00+08:00',NULL WHERE EXISTS (SELECT 1 FROM patients WHERE id='p-001');
INSERT OR IGNORE INTO vitals SELECT 'vital-demo-d3-am','p-001',date('now','localtime','-3 day'),'07:00',123,75,'康复护士',date('now','localtime','-3 day') || 'T07:00:00+08:00',NULL WHERE EXISTS (SELECT 1 FROM patients WHERE id='p-001');
INSERT OR IGNORE INTO vitals SELECT 'vital-demo-d3-pm','p-001',date('now','localtime','-3 day'),'20:30',129,78,'家属',date('now','localtime','-3 day') || 'T20:30:00+08:00',NULL WHERE EXISTS (SELECT 1 FROM patients WHERE id='p-001');
INSERT OR IGNORE INTO vitals SELECT 'vital-demo-d2-am','p-001',date('now','localtime','-2 day'),'07:00',126,77,'家属',date('now','localtime','-2 day') || 'T07:00:00+08:00',NULL WHERE EXISTS (SELECT 1 FROM patients WHERE id='p-001');
INSERT OR IGNORE INTO vitals SELECT 'vital-demo-d2-pm','p-001',date('now','localtime','-2 day'),'20:30',131,80,'家属',date('now','localtime','-2 day') || 'T20:30:00+08:00',NULL WHERE EXISTS (SELECT 1 FROM patients WHERE id='p-001');
INSERT OR IGNORE INTO vitals SELECT 'vital-demo-d1-am','p-001',date('now','localtime','-1 day'),'07:00',124,76,'家属',date('now','localtime','-1 day') || 'T07:00:00+08:00',NULL WHERE EXISTS (SELECT 1 FROM patients WHERE id='p-001');
INSERT OR IGNORE INTO vitals SELECT 'vital-demo-d1-pm','p-001',date('now','localtime','-1 day'),'20:30',128,79,'家属',date('now','localtime','-1 day') || 'T20:30:00+08:00',NULL WHERE EXISTS (SELECT 1 FROM patients WHERE id='p-001');
INSERT OR IGNORE INTO vitals SELECT 'vital-demo-d0-am','p-001',date('now','localtime'),'07:00',122,74,'家属',date('now','localtime') || 'T07:00:00+08:00',NULL WHERE EXISTS (SELECT 1 FROM patients WHERE id='p-001');
