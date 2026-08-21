import FiltersPanel from './FiltersPanel';
import SummaryTiles from './SummaryTiles';

export default function App() {
    return (
        <div className="mx-auto max-w-5xl p-8">
            <h1 className="text-2xl font-semibold text-gray-900">Transactions Dashboard</h1>
            <div className="mt-6 flex flex-col gap-6">
                <SummaryTiles className="max-w-2xl" />
                <FiltersPanel className="max-w-sm" />
            </div>
        </div>
    );
}
