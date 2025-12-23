import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'leaderboard',
  title: 'لوحة المتصدرين',
  type: 'document',
  fields: [
    defineField({
      name: 'playerName',
      title: 'اسم المحارب',
      type: 'string',
    }),
    defineField({
      name: 'score',
      title: 'مستوى الطاقة (النقاط)',
      type: 'number',
    }),
    defineField({
      name: 'date',
      title: 'تاريخ المعركة',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'playerName',
      subtitle: 'score',
    },
  },
})