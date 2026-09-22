-- 2026-09-22 用户补充四条康复训练视频。
-- 追加到数据库，页面另按 FEATURED_VIDEO_IDS 置顶；原有分类和排序不动。
WITH
  next_sort(base) AS (
    SELECT COALESCE(MAX(sort_order), -1) + 1 FROM videos
  ),
  new_videos(id, title, category, src, poster, duration_sec, seq) AS (
    VALUES
      ('v-swallow-training', '吞咽训练', '吞咽康复类', '/videos/v-swallow-training.mp4', '/posters/v-swallow-training.jpg', 15, 0),
      ('v-limb-rehab-exercise', '肢体康复训练操', '肢体训练类', '/videos/v-limb-rehab-exercise.mp4', '/posters/v-limb-rehab-exercise.jpg', 50, 1),
      ('v-fruit-meal', '水果餐制作', '基础照护类', '/videos/v-fruit-meal.mp4', '/posters/v-fruit-meal.jpg', 31, 2),
      ('v-tube-feeding', '鼻饲管进食', '基础照护类', '/videos/v-tube-feeding.mp4', '/posters/v-tube-feeding.jpg', 38, 3)
  )
INSERT INTO videos
  (id, title, category, src, poster, cautions, duration_sec, origin, sort_order)
SELECT id, title, category, src, poster, '[]', duration_sec, 'team_reviewed', base + seq
FROM new_videos CROSS JOIN next_sort;
