// sanity/lib/client.ts
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // التعديل الجوهري هنا:
  // إذا كنا في وضع "التطوير" على جهازك، اجعل البيانات حية ومباشرة
  // إذا رفعنا الموقع للناس (Production)، استخدم الكاش (CDN) لتوفير الفلوس وتسريع الموقع
  useCdn: process.env.NODE_ENV === 'production', 
})