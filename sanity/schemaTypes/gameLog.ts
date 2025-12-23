import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'gameLog',
  title: 'سجل المعارك',
  type: 'document',
  fields: [
    defineField({ name: 'playerName', title: 'اسم اللاعب', type: 'string' }),
    defineField({ name: 'score', title: 'النتيجة النهائية', type: 'number' }),
    defineField({ name: 'wrongAnswers', title: 'أسئلة أخطأ فيها', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'timestamp', title: 'وقت اللعب', type: 'datetime' }),
  ]
})