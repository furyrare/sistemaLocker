import CompartmentsClient from './CompartmentsClient';

export default function CompartmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Caixas Reservadas</h1>
        <p className="mt-1 text-sm text-slate-600">Visualize as caixas reservadas com informações do cliente e códigos.</p>
      </div>

      <CompartmentsClient />
    </div>
  );
}
