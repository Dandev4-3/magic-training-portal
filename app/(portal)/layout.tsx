export const instant = false;
import { unstable_noStore as noStore } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  noStore();
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
