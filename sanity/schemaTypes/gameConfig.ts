import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'gameConfig',
  title: '⚙️ قوانين الكون (الإعدادات)',
  type: 'document',
  fields: [
    defineField({
      name: 'timerDuration',
      title: '⏳ وقت السؤال (ثواني)',
      type: 'number',
      initialValue: 15,
    }),
    defineField({
      name: 'senzuCount',
      title: '💊 عدد حبوب السينزو',
      type: 'number',
      initialValue: 1,
    }),
    defineField({
      name: 'hintCount',
      title: '📡 عدد رادارات التنين (تلميحات)',
      type: 'number',
      initialValue: 1,
    }),
    // --- حقول جديدة للتحكم في التحولات ---
    defineField({
      name: 'thresholds',
      title: '⚡ حدود الطاقة (نقاط التحول)',
      type: 'object',
      fields: [
        { name: 'ssj', title: 'سوبر سايان (أصفر)', type: 'number', initialValue: 2500 },
        { name: 'blue', title: 'سوبر سايان بلو (أزرق)', type: 'number', initialValue: 5000 },
        { name: 'ui', title: 'الغريزة الفائقة (أبيض)', type: 'number', initialValue: 8000 },
      ]
    }),
    // --- حقول النصوص (لتعريب كامل) ---
    defineField({
      name: 'texts',
      title: '📜 نصوص اللعبة',
      type: 'object',
      fields: [
        { name: 'loadingText', title: 'نص التحميل', type: 'string', initialValue: 'جاري استجماع الطاقة...' },
        { name: 'winTitle', title: 'عنوان الفوز', type: 'string', initialValue: 'انتصار أسطوري!' },
        { name: 'loseTitle', title: 'عنوان الخسارة', type: 'string', initialValue: 'هزيمة ساحقة...' },
      ]
    }),
    defineField({
      name: 'isMaintenanceMode',
      title: '🛑 وضع الصيانة',
      description: 'تفعيل هذا الخيار سيغلق اللعبة أمام الجميع',
      type: 'boolean',
      initialValue: false,
    })
  ]
})