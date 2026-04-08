import PickupClient from './PickupClient';

export default function PickupPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Retirada</h1>
        <p className="mt-1 text-sm text-slate-600">Digite o código de 6 dígitos para liberar a caixa.</p>
      </div>

      <PickupClient />
    </div>
  );
}
