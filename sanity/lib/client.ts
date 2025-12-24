// sanity/lib/client.ts
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // تغيير حاسم: إيقاف الـ CDN للحصول على بيانات فورية
  useCdn: false, 
})