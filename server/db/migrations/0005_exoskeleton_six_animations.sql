-- 将既有数据库里的外骨骼任务升级为六阶段动态图流程。

UPDATE task_defs
SET instruction = '完成设备与环境检查后，在照护人陪同下跟随动态图依次完成踏步热身、左右侧步、步态衔接、上肢开合、双臂交叉和伸臂抬腿六个阶段。',
    reps = '下肢步态训练 + 上肢协同训练（共 6 个阶段）'
WHERE id = 'task-cognition';

UPDATE reminders
SET text = '🦿 16:00 外骨骼助力行走时间到了，请先完成设备与环境检查，再跟随动态图完成下肢步态与上肢协同六个训练阶段，全程在旁保护。'
WHERE id = 'rm-cognition';
