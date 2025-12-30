import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/utils/admin'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Protect entire admin section
  await requireAdmin()

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        <aside className="hidden md:block">
          <AdminSidebar />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  )
}
