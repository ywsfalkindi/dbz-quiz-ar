import { type SchemaTypeDefinition } from 'sanity'
import question from './question'
import leaderboard from './leaderboard'
import gameConfig from './gameConfig' // استيراد الملف الجديد

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [question, leaderboard, gameConfig], // إضافته هنا
}