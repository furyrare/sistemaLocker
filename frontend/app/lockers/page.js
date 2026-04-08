import LockersManageClient from './LockersManageClient';

export default function LockersManagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gerenciar Lockers</h1>
        <p className="mt-1 text-sm text-slate-600">Visualize e delete lockers do sistema.</p>
      </div>
      <LockersManageClient />
    </div>
  );
}
