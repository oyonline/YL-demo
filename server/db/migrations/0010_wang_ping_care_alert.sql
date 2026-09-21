-- 0010_wang_ping_care_alert —— 同步王萍最新洼田饮水试验分级至今日提醒。

UPDATE patient_function
SET care_alerts = replace(care_alerts, '洼田 Ⅱ 级', '洼田 Ⅲ 级')
WHERE patient_id = 'p-001';
