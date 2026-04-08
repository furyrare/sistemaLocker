import KioskClient from './KioskClient';

export default function KioskPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <KioskClient />
      </div>
    </div>
  );
}
