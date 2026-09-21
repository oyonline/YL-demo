-- 0009_wang_ping_profile —— 按甲方确认资料补齐王萍及主要照护人档案。

ALTER TABLE patients ADD COLUMN marital_status TEXT;
ALTER TABLE patients ADD COLUMN occupation TEXT;
ALTER TABLE patients ADD COLUMN monthly_pension_yuan INTEGER;
ALTER TABLE patients ADD COLUMN bmi REAL;
ALTER TABLE patients ADD COLUMN upper_arm_cm REAL;
ALTER TABLE patients ADD COLUMN calf_cm REAL;

ALTER TABLE patient_contact ADD COLUMN caregiver_gender TEXT;
ALTER TABLE patient_contact ADD COLUMN caregiver_age INTEGER;
ALTER TABLE patient_contact ADD COLUMN caregiver_skill_gaps TEXT NOT NULL DEFAULT '[]';
ALTER TABLE patient_contact ADD COLUMN caregiver_pressures TEXT NOT NULL DEFAULT '[]';

UPDATE patients SET
  name = '王萍', age_band = '78 岁', marital_status = '丧偶',
  occupation = '农村中学退休音乐老师', monthly_pension_yuan = 4000,
  height_cm = 155, weight_kg = 42, bmi = 17.5, upper_arm_cm = 22, calf_cm = 30,
  living_situation = '丧偶，由独女李英照护',
  psychosocial = '情绪波动：烦躁、恐惧、拒绝接触',
  communication = '神志清醒，能进行语言沟通。'
WHERE id = 'p-001';

UPDATE patient_contact SET
  emergency_name = '李英', emergency_relation = '独女',
  caregiver_name = '李英', caregiver_relation = '独女',
  caregiver_gender = '女', caregiver_age = 50,
  caregiver_skill_gaps = '["知识匮乏","资源不足"]',
  caregiver_pressures = '["母女关系紧张","未来焦虑"]'
WHERE patient_id = 'p-001';

UPDATE patient_members SET relation = '独女'
WHERE patient_id = 'p-001' AND user_id = 'u-family-chen';

UPDATE users SET display_name = '李英（独女）' WHERE id = 'u-family-chen';

UPDATE patient_function SET
  swallowing = '洼田饮水试验 Ⅲ 级；当前按鼻饲流质饮食照护，鼻饲时抬高床头，结束后保持体位 30～60 分钟',
  cognition = '神志清醒，能进行语言沟通',
  risks = '["跌倒风险（步态失衡）","误吸风险（洼田 Ⅲ 级）","鼻饲照护（流质饮食）"]'
WHERE patient_id = 'p-001';

UPDATE assessments SET
  value = 'Ⅲ 级', level = '吞咽障碍', tile_value = 'Ⅲ 级', tile_note = '吞咽障碍',
  note = '洼田饮水试验Ⅲ级，存在吞咽障碍。'
WHERE patient_id = 'p-001' AND name = '洼田饮水试验';

UPDATE assessments SET
  name = 'MNA-SF 营养评估', value = '7 分', level = '营养失调',
  tile_label = 'MNA-SF', tile_value = '7 分', tile_note = '营养失调',
  note = 'MNA-SF 7分，提示营养失调。'
WHERE patient_id = 'p-001' AND name = 'MMSE 简易智能量表';

UPDATE care_events SET detail = replace(replace(detail, '王萍奶奶', '王萍'), 'MMSE', 'MNA-SF')
WHERE patient_id = 'p-001';

UPDATE reminders SET text = replace(text, '王萍奶奶', '王萍') WHERE patient_id = 'p-001';
UPDATE messages SET text = replace(text, '王萍奶奶', '王萍') WHERE patient_id = 'p-001';
