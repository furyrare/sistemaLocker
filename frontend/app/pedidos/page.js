import PedidosClient from './PedidosClient';

export default function PedidosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gerenciar Pedidos</h1>
        <p className="mt-1 text-sm text-slate-600">Visualize e remova pedidos criados.</p>
      </div>

      <PedidosClient />
    </div>
  );
}
