import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'question',
  title: '❓ الأسئلة', // تعريب العنوان في القائمة الجانبية
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'نص السؤال',
      type: 'string',
      validation: (Rule) => Rule.required().error('يجب كتابة السؤال!'),
    }),
    defineField({
      name: 'difficulty',
      title: 'مستوى الصعوبة',
      type: 'string',
      options: {
        list: [
          { title: 'مزارع (سهل جداً)', value: 'farmer' },
          { title: 'مقاتل Z (متوسط)', value: 'z-fighter' },
          { title: 'سوبر سايان (صعب)', value: 'super-saiyan' },
          { title: 'حاكم دمار (صعب جداً)', value: 'god-of-destruction' },
        ],
        layout: 'radio',
      },
      initialValue: 'z-fighter',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answers',
      title: 'الإجابات (يجب أن تكون 4)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'answer',
              title: 'نص الإجابة',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'isCorrect',
              title: 'هل هذه هي الإجابة الصحيحة؟',
              type: 'boolean',
              initialValue: false,
            },
          ],
          preview: {
            select: {
              title: 'answer',
              isCorrect: 'isCorrect',
            },
            prepare({ title, isCorrect }) {
              return {
                title: title,
                subtitle: isCorrect ? 'إجابة صحيحة ✅' : 'إجابة خاطئة ❌',
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.min(4).max(4).error('يجب توفير 4 إجابات بالضبط!'),
    }),
    defineField({
      name: 'explanation',
      title: 'شرح وتوضيح (يظهر بعد الحل)',
      type: 'text',
      rows: 3,
      description: 'معلومة إضافية تظهر للاعب سواء أجاب صح أم خطأ.',
    }),
    defineField({
      name: 'image',
      title: 'صورة مرفقة (اختياري)',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
  },
})