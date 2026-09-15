-- 将既有开发/预览库里的外骨骼任务升级为本轮确认的五动作流程。
-- 全新数据库会由 seed 直接写入相同内容；UPDATE 保证旧库无需重灌。

UPDATE task_defs
SET instruction = '完成设备与环境检查后，在照护人陪同下依次完成蹲起、向前走、后撤一步、向左走、向右走五个动作。',
    reps = '蹲起 + 前行、后撤及左右侧行走（共 5 个动作）'
WHERE id = 'task-cognition';

UPDATE reminders
SET text = '🦿 16:00 外骨骼助力行走时间到了，请先完成设备与环境检查，再依次完成蹲起、向前走、后撤一步、向左走、向右走五个动作，全程在旁保护。'
WHERE id = 'rm-cognition';
