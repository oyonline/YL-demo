UPDATE videos
SET title = '血压测量'
WHERE id = 'v-bp';

UPDATE videos
SET title = '水果餐制作', category = '生活照护类'
WHERE id = 'v-fruit-meal';

UPDATE videos
SET title = '鼻饲进食', category = '生活照护类'
WHERE id = 'v-tube-feeding';

UPDATE videos
SET title = '吞咽训练操', category = '吞咽康复类'
WHERE id = 'v-swallow-training';

UPDATE videos
SET category = '肢体康复类'
WHERE category = '肢体训练类';
