import FiltersPanel from './FiltersPanel';

export default function App() {
    return (
        <div className="mx-auto max-w-5xl p-8">
            <h1 className="text-2xl font-semibold text-gray-900">Transactions Dashboard</h1>
            <div className="mt-6">
                <FiltersPanel className="max-w-sm" />
            </div>
        </div>
    );
}
