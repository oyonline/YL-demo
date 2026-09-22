UPDATE patient_function
SET swallowing = replace(swallowing, '洼田饮水试验 Ⅲ 级', '洼田饮水试验 Ⅴ 级'),
    risks = replace(risks, '洼田 Ⅲ 级', '洼田 Ⅴ 级'),
    care_alerts = replace(care_alerts, '洼田 Ⅲ 级', '洼田 Ⅴ 级')
WHERE patient_id = 'p-001';

UPDATE assessments
SET value = 'Ⅴ 级', tile_value = 'Ⅴ 级',
    note = '洼田饮水试验Ⅴ级，存在吞咽障碍。'
WHERE patient_id = 'p-001' AND name = '洼田饮水试验';
