import { type SchemaTypeDefinition } from 'sanity'
import question from './question'
import leaderboard from './leaderboard'
import gameConfig from './gameConfig'
import gameLog from './gameLog' // استيراد الجديد

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [question, leaderboard, gameConfig, gameLog],
}