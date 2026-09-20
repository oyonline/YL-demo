-- 用户于 2026-09-20 确认：智能咨询只保留所提供的三条鼻饲内置问答，
-- 其他预设问答全部清除；问题与答案原样录入并直接启用。
-- 历史聊天记录位于其他表，本迁移不删除聊天历史。

DELETE FROM preset_qa;

INSERT INTO preset_qa
  (id,question,basis,external,answer,escalate,escalate_hint,origin,review_status,reviewed_by,reviewed_at,sort_order)
VALUES
  ('tube-bloating','鼻饲老人出现腹胀可能是什么原因？',
   '["用户确认的内置问答原文"]','[]',
   '["原因可能如下：1. 一次喂食过多，喂食速度过快，加重胃部消化负担；2. 鼻饲操作时管路带入空气，造成胃肠道积气；3. 鼻饲液温度偏低，刺激胃肠道；4. 老人胃动力不足，胃内食物未及时排空，出现胃潴留；5. 匀浆餐含有较多易产气食材；6. 长期卧床，肠道蠕动减慢，引发腹胀。发生腹胀后，应暂停鼻饲，保持半卧位，轻柔按摩腹部，评估胃潴留情况，必要时联系医护，后续改为少量多餐。"]',
   0,NULL,'user_confirmed','approved',NULL,'2026-09-20T08:45:00.000Z',0),
  ('tube-aspiration','鼻饲老人发生误吸的表现和急救措施有哪些？',
   '["用户确认的内置问答原文"]','[]',
   '["表现：鼻饲时突发剧烈呛咳、呼吸困难、口唇发绀，口鼻流出营养液，严重时烦躁、缺氧；急救措施：立刻停止鼻饲，采取头低右侧卧位，清理口鼻分泌物，保持气道通畅，吸氧并紧急呼叫医护人员。"]',
   0,NULL,'user_confirmed','approved',NULL,'2026-09-20T08:45:00.000Z',1),
  ('millet-pumpkin-porridge','小米南瓜粥的做法是什么？',
   '["用户确认的内置问答原文"]','[]',
   '["小米南瓜粥易消化，可补充能量、维生素，性质温和，对肠胃刺激小，适合作为鼻饲老人的基础主食，其做法如下：1. 食材准备：小米、去皮去籽南瓜。2. 小米淘洗干净，南瓜切小块，一同放入锅中，加足量清水熬煮至完全软烂。3. 将煮好的食材放入破壁机充分搅打，再用细滤网过滤残渣，得到细腻米浆。4. 放至38~40℃即可用于鼻饲，单次不超过200ml，现做现用"]',
   0,NULL,'user_confirmed','approved',NULL,'2026-09-20T08:45:00.000Z',2);

INSERT OR REPLACE INTO audit_log
  (id,user_id,action,entity,entity_id,detail,ip,at)
SELECT
  'direct-enable-preset-qa-' || id,
  NULL,
  'review_approved',
  'preset_qa',
  id,
  '{"source":"user-confirmed direct enable","decision_date":"2026-09-20","verbatim":true}',
  NULL,
  '2026-09-20T08:45:00.000Z'
FROM preset_qa;
