import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'question',
  title: 'Question',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'عنوان السؤال',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'difficulty',
      title: 'درجة الصعوبة',
      type: 'string',
      options: {
        list: [
          {title: 'مزارع', value: 'farmer'},
          {title: 'مقاتل Z', value: 'z-fighter'},
          {title: 'سوبر سايان', value: 'super-saiyan'},
          {title: 'حاكم دمار', value: 'god-of-destruction'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answers',
      title: 'الإجابات',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'answer',
              title: 'الإجابة',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'isCorrect',
              title: 'إجابة صحيحة؟',
              type: 'boolean',
              initialValue: false,
            },
          ],
          preview: {
            select: {
              title: 'answer',
              isCorrect: 'isCorrect',
            },
            prepare({title, isCorrect}) {
              return {
                title: `${title} ${isCorrect ? '✅' : ''}`,
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.min(4).max(4),
    }),
    defineField({
      name: 'explanation',
      title: 'شرح الإجابة',
      type: 'text',
      description: 'شرح يظهر بعد الحل (لكتابة معلومة إثرائية بالعربية).',
    }),
    defineField({
      name: 'image',
      title: 'صورة للسؤال',
      type: 'image',
      options: {
        hotspot: true, // <-- Defaults to false
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
