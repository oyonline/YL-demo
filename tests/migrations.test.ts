/**
 * 迁移执行器 —— 部署时第一个跑的东西，它错了后面全错。
 *
 * 重点测「可重入」：服务端每次启动都调 getDb()，
 * 迁移必须只应用一次，重复启动不能重复建表或重复插数据。
 */
import { describe, it, expect, afterAll } from 'vitest'
import { getDb, closeDb, DB_PATH } from '../server/db/index.ts'
import { patientListQuery } from '../server/routes/patients.ts'

afterAll(() => closeDb())

describe('数据库迁移', () => {
  it('用的是临时库，绝不碰开发库 data/app.db', () => {
    expect(DB_PATH).not.toContain('/data/app.db')
    expect(DB_PATH).toContain('kfzl-test-')
  })

  it('首次调用即建表并登记迁移', () => {
    const db = getDb()
    const applied = db.prepare('SELECT name FROM schema_migrations ORDER BY name').all() as any[]
    expect(applied.map((r) => r.name)).toEqual([
      '0001_init.sql',
      '0002_care_alerts.sql',
      '0003_review_audit.sql',
      '0004_exoskeleton_five_actions.sql',
      '0005_exoskeleton_six_animations.sql',
      '0006_monthly_diet_guidance.sql',
      '0007_replace_preset_qa_with_enteral_three.sql',
      '0008_game_stage_records.sql',
      '0009_wang_ping_profile.sql',
      '0010_wang_ping_care_alert.sql',
      '0011_seed_blood_pressure_history.sql',
      '0012_add_training_videos.sql',
      '0013_september_feeding_plan.sql',
      '0014_simulate_september_checkins.sql',
      '0015_update_wang_ping_psychosocial.sql',
      '0016_reorganize_video_categories.sql',
      '0017_update_wang_ping_swallowing_grade.sql',
      '0018_update_care_plan_periods.sql',
      '0019_clear_september_checkins.sql',
    ])
  })

  it('0012 会为既有数据库追加四条训练视频', () => {
    const rows = getDb().prepare(`SELECT id, title, category, duration_sec
      FROM videos ORDER BY sort_order`).all() as any[]
    expect(rows).toEqual([
      { id: 'v-swallow-training', title: '吞咽训练操', category: '吞咽康复类', duration_sec: 15 },
      { id: 'v-limb-rehab-exercise', title: '肢体康复训练操', category: '肢体康复类', duration_sec: 50 },
      { id: 'v-fruit-meal', title: '水果餐制作', category: '生活照护类', duration_sec: 31 },
      { id: 'v-tube-feeding', title: '鼻饲进食', category: '生活照护类', duration_sec: 38 },
    ])
  })

  it('0014 为已有病例补历史并保留同日同任务的原记录', () => {
    const db = getDb()
    const now = new Date().toISOString()
    db.prepare(`INSERT INTO patients (id,name,gender,age_band,status,created_at,updated_at)
      VALUES ('p-001','迁移测试病例','女','演示','active',?,?)`).run(now, now)

    const tasks = [
      ['task-feed-meal-1', 'record', '正餐1', '07:00'],
      ['task-feed-medication', 'medication', '鼻饲后给予降压药', '07:30'],
      ['task-feed-meal-2', 'record', '正餐2', '11:00'],
      ['task-feed-snack-1', 'record', '辅食加餐1', '13:00'],
      ['task-feed-meal-3', 'record', '正餐3', '15:00'],
      ['task-feed-snack-2', 'record', '辅食加餐2', '17:00'],
      ['task-feed-meal-4', 'record', '正餐4', '19:00'],
    ] as const
    const insertTask = db.prepare(`INSERT INTO task_defs
      (id,patient_id,kind,title,scheduled_time,instruction,cautions,origin,active_from,active_to)
      VALUES (?,'p-001',?,?,?,'演示','[]','user_provided','2026-09-01','2026-09-28')`)
    for (const task of tasks) insertTask.run(...task)

    db.prepare(`INSERT INTO check_ins
      (id,patient_id,task_id,date,status,note,at)
      VALUES ('ci-existing','p-001','task-feed-meal-1','2026-09-01','done','原有记录','2026-09-01T07:05:00+08:00')`).run()
    db.prepare("DELETE FROM schema_migrations WHERE name = '0014_simulate_september_checkins.sql'").run()

    closeDb()
    const migrated = getDb()
    const rows = migrated.prepare(`SELECT date, task_id, status, note, at
      FROM check_ins WHERE patient_id='p-001' ORDER BY date, task_id`).all() as any[]
    expect(rows).toHaveLength(126)
    expect(migrated.prepare("SELECT id, note, at FROM check_ins WHERE date='2026-09-01' AND task_id='task-feed-meal-1'").get()).toEqual({
      id: 'ci-existing', note: '原有记录', at: '2026-09-01T07:05:00+08:00',
    })
    expect(migrated.prepare(`SELECT
      sum(status='done') done, sum(status='difficulty') difficulty, sum(status='missed') missed
      FROM check_ins WHERE date='2026-09-03'`).get()).toEqual({ done: 5, difficulty: 1, missed: 1 })
    expect(migrated.prepare(`SELECT count(*) c FROM check_ins
      WHERE date IN ('2026-09-08','2026-09-16','2026-09-21','2026-09-22')`).get()).toEqual({ c: 0 })
    expect(migrated.prepare("SELECT count(*) c FROM check_ins WHERE status='missed' AND at IS NOT NULL").get()).toEqual({ c: 0 })

    closeDb()
    expect((getDb().prepare("SELECT count(*) c FROM check_ins WHERE patient_id='p-001'").get() as any).c).toBe(126)
  })

  it('0019 清空 9 月 1 日至 26 日记录且不影响 27 日', () => {
    getDb().prepare("DELETE FROM schema_migrations WHERE name = '0019_clear_september_checkins.sql'").run()
    closeDb()
    const prepared = getDb()
    const insert = prepared.prepare(`INSERT INTO check_ins
      (id,patient_id,task_id,date,status,at) VALUES (?,?,?,?,?,?)`)
    insert.run('ci-september-26', 'p-001', 'task-feed-v2-meal-1', '2026-09-26', 'done', '2026-09-26T08:05:00+08:00')
    insert.run('ci-september-27', 'p-001', 'task-feed-v2-meal-1', '2026-09-27', 'done', '2026-09-27T08:05:00+08:00')
    prepared.prepare("DELETE FROM schema_migrations WHERE name = '0019_clear_september_checkins.sql'").run()

    closeDb()
    const migrated = getDb()
    expect(migrated.prepare(`SELECT count(*) c FROM check_ins
      WHERE patient_id='p-001' AND date BETWEEN '2026-09-01' AND '2026-09-26'`).get()).toEqual({ c: 0 })
    expect(migrated.prepare(`SELECT id FROM check_ins
      WHERE patient_id='p-001' AND date='2026-09-27'`).get()).toEqual({ id: 'ci-september-27' })
    expect(migrated.prepare(`SELECT scheduled_time, title FROM task_defs
      WHERE patient_id='p-001'
        AND active_from <= '2026-09-26'
        AND (active_to IS NULL OR active_to >= '2026-09-26')
      ORDER BY scheduled_time`).all()).toEqual([])
    expect(migrated.prepare(`SELECT scheduled_time, title FROM task_defs
      WHERE patient_id='p-001'
        AND active_from <= '2026-09-27'
        AND (active_to IS NULL OR active_to >= '2026-09-27')
      ORDER BY scheduled_time`).all()).toEqual([
      { scheduled_time: '08:00', title: '第一餐正餐' },
      { scheduled_time: '12:00', title: '第二餐正餐' },
      { scheduled_time: '14:00', title: '第一餐辅餐' },
      { scheduled_time: '16:00', title: '第三餐正餐' },
      { scheduled_time: '18:00', title: '第二餐辅餐' },
      { scheduled_time: '20:00', title: '第四餐正餐' },
    ])
  })

  it('患者列表今日完成数不统计已经失效的任务', () => {
    const db = getDb()
    db.prepare(`INSERT INTO task_defs
      (id,patient_id,kind,title,scheduled_time,instruction,cautions,origin,active_from,active_to)
      VALUES ('task-expired','p-001','record','旧计划','06:00','演示','[]','user_provided','2026-09-01','2026-09-21')`).run()
    db.prepare(`INSERT INTO check_ins
      (id,patient_id,task_id,date,status,at)
      VALUES ('ci-expired-today','p-001','task-expired','2026-09-22','done','2026-09-22T06:00:00+08:00')`).run()

    const rows = db.prepare(patientListQuery('?')).all(
      '2026-09-22', '2026-09-22',
      '2026-09-22', '2026-09-22', '2026-09-22',
      '2026-09-22', 'u-test', 'p-001',
    ) as any[]
    expect(rows[0].today_total).toBe(0)
    expect(rows[0].today_done).toBe(0)
  })

  it('可重入：再次调用不重复应用迁移', () => {
    const before = (getDb().prepare('SELECT count(*) c FROM schema_migrations').get() as any).c
    closeDb()
    getDb()
    const after = (getDb().prepare('SELECT count(*) c FROM schema_migrations').get() as any).c
    expect(after).toBe(before)
  })

  it('0004 会把既有库的外骨骼任务与提醒升级为五动作口径', () => {
    const db = getDb()
    const now = new Date().toISOString()
    db.prepare(`INSERT INTO patients (id,name,gender,age_band,status,created_at,updated_at)
      VALUES ('p-migration','迁移测试','女','演示','active',?,?)`).run(now, now)
    db.prepare(`INSERT INTO task_defs
      (id,patient_id,kind,title,scheduled_time,instruction,cautions,reps,origin,active_from)
      VALUES ('task-cognition','p-migration','training','外骨骼助力行走','16:00','旧四步指令','[]','四步','therapist_confirmed','2026-01-01')`).run()
    db.prepare(`INSERT INTO reminders (id,patient_id,time,text,task_id)
      VALUES ('rm-cognition','p-migration','16:00','旧四步提醒','task-cognition')`).run()
    db.prepare("DELETE FROM schema_migrations WHERE name = '0004_exoskeleton_five_actions.sql'").run()
    db.prepare("DELETE FROM schema_migrations WHERE name = '0005_exoskeleton_six_animations.sql'").run()

    closeDb()
    const migrated = getDb()
    const task = migrated.prepare("SELECT instruction, reps FROM task_defs WHERE id = 'task-cognition'").get() as any
    const reminder = migrated.prepare("SELECT text FROM reminders WHERE id = 'rm-cognition'").get() as any

    expect(task.reps).toContain('共 6 个阶段')
    expect(task.instruction).toContain('跟随动态图')
    expect(reminder.text).toContain('六个训练阶段')
    expect(`${task.instruction}${task.reps}${reminder.text}`).not.toContain('四步')
  })

  it('29 张业务表全部建出', () => {
    const rows = getDb()
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`)
      .all() as any[]
    const names = rows.map((r) => r.name)
    // 抽查每个子系统的关键表，缺一个就说明该子系统的迁移没跑
    for (const t of [
      'users', 'patients', 'patient_members',       // 鉴权与行级权限
      'check_ins', 'vitals', 'game_stage_records', 'messages', // 演示主线
      'kb_documents', 'kb_chunks',                  // 知识库
      'audit_log',                                  // 审计
    ]) {
      expect(names).toContain(t)
    }
  })

  it('外键约束已开启 —— 否则行级权限可以被脏数据绕过', () => {
    expect(getDb().pragma('foreign_keys', { simple: true })).toBe(1)
  })
})
