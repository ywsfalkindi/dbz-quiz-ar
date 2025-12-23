import { type SchemaTypeDefinition } from 'sanity'
import question from './question'
import leaderboard from './leaderboard' // استيراد الجديد

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [question, leaderboard], // إضافته للقائمة
}