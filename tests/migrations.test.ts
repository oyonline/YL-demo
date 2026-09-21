/**
 * 迁移执行器 —— 部署时第一个跑的东西，它错了后面全错。
 *
 * 重点测「可重入」：服务端每次启动都调 getDb()，
 * 迁移必须只应用一次，重复启动不能重复建表或重复插数据。
 */
import { describe, it, expect, afterAll } from 'vitest'
import { getDb, closeDb, DB_PATH } from '../server/db/index.ts'

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
    ])
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
