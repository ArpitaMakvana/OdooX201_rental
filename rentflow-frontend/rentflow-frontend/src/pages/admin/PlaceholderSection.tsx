import AdminLayout from '@/components/admin/AdminLayout'

export default function PlaceholderSection({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <AdminLayout pageTitle={title} pageDescription={description}>
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
        {title} module — connect to its backend resource the same way User Management and
        Configuration are wired up in <code>src/services</code>.
      </div>
    </AdminLayout>
  )
}
