import { notFound, redirect } from 'next/navigation'

import { getSession } from '@/server/auth/session'

export const dynamic = 'force-dynamic'

/** Server-side RBAC for the entire /admin section. Non-admins get a 404 (the
 *  admin area doesn't reveal its existence). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession()
  if (!user) redirect('/login')
  if (user.role !== 'ADMIN') notFound()
  return <>{children}</>
}
