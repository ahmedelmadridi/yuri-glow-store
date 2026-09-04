'use server'

import { revalidatePath } from 'next/cache'

export async function revalidateStore() {
  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath('/admin/products')
  // We also want to revalidate dynamic paths if possible, but these cover the main ones
}
