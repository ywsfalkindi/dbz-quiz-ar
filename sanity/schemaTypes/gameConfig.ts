import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'gameConfig',
  title: '⚙️ إعدادات الكون (تحكم كامل)',
  type: 'document',
  fields: [
    // --- 1. أساسيات اللعبة ---
    defineField({
      name: 'timerDuration',
      title: '⏳ وقت السؤال (ثواني)',
      type: 'number',
      initialValue: 15,
    }),
    defineField({
      name: 'senzuCount',
      title: '💊 عدد حبوب السينزو (المحاولات)',
      type: 'number',
      initialValue: 1,
    }),
    defineField({
      name: 'hintCount',
      title: '📡 عدد رادارات التنين (تلميحات)',
      type: 'number',
      initialValue: 1,
    }),

    // --- 2. المظهر والألوان (Theme) ---
    defineField({
      name: 'theme',
      title: '🎨 مظهر الموقع',
      type: 'object',
      fields: [
        { name: 'primaryColor', title: 'اللون الأساسي (أزرار وعناوين)', type: 'string', initialValue: '#F85B1A' },
        { name: 'secondaryColor', title: 'اللون الثانوي (حدود وتأثيرات)', type: 'string', initialValue: '#FFD600' },
        { name: 'backgroundImage', title: 'صورة الخلفية (اختياري)', type: 'image' }
      ]
    }),

    // --- 3. الصوتيات (Sounds) ---
    defineField({
      name: 'sounds',
      title: '🔊 المؤثرات الصوتية',
      type: 'object',
      fields: [
        { name: 'backgroundMusic', title: 'رابط موسيقى الخلفية (MP3)', type: 'url' },
        { name: 'clickSound', title: 'رابط صوت النقر', type: 'url' },
        { name: 'correctSound', title: 'رابط الإجابة الصحيحة', type: 'url' },
        { name: 'wrongSound', title: 'رابط الإجابة الخاطئة', type: 'url' },
        { name: 'winSound', title: 'رابط الفوز', type: 'url' },
      ]
    }),

    // --- 4. حدود الطاقة (التحولات) ---
    defineField({
      name: 'thresholds',
      title: '⚡ حدود التحول (النقاط)',
      type: 'object',
      fields: [
        { name: 'ssj', title: 'سوبر سايان (أصفر)', type: 'number', initialValue: 2500 },
        { name: 'blue', title: 'سوبر سايان بلو (أزرق)', type: 'number', initialValue: 5000 },
        { name: 'ui', title: 'الغريزة الفائقة (أبيض)', type: 'number', initialValue: 8000 },
      ]
    }),

    // --- 5. النصوص والتعريب ---
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
      title: '🛑 وضع الصيانة (إغلاق اللعبة)',
      type: 'boolean',
      initialValue: false,
    })
  ]
})