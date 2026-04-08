import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Visão geral do locker e status das caixas.</p>
      </div>

      <DashboardClient />
    </div>
  );
}
