import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'gameConfig',
  title: '⚙️ إعدادات اللعبة',
  type: 'document',
  fields: [
    defineField({
      name: 'timerDuration',
      title: '⏳ مدة المؤقت (ثواني)',
      description: 'الوقت المتاح للإجابة على كل سؤال',
      type: 'number',
      initialValue: 15,
      validation: (Rule) => Rule.min(5).max(60)
    }),
    defineField({
      name: 'senzuCount',
      title: '💊 عدد حبوب السينزو',
      description: 'كم حبة علاج يحصل عليها اللاعب في البداية',
      type: 'number',
      initialValue: 1,
    }),
    defineField({
      name: 'hintCount',
      title: '📡 عدد التلميحات',
      description: 'كم مرة يمكن للاعب طلب مساعدة رادار التنين',
      type: 'number',
      initialValue: 1,
    }),
    defineField({
      name: 'winningScore',
      title: '🏆 نقاط الفوز',
      description: 'النقاط المطلوبة للوصول للغريزة الفائقة',
      type: 'number',
      initialValue: 8000,
    }),
    defineField({
      name: 'isMaintenanceMode',
      title: '🛑 وضع الصيانة',
      description: 'إذا تم تفعيله، لن يتمكن أحد من اللعب (ستظهر رسالة "جاري التدريب")',
      type: 'boolean',
      initialValue: false,
    })
  ]
})