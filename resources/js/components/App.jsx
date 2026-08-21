import CategoryBreakdown from './CategoryBreakdown';
import FiltersPanel from './FiltersPanel';
import SummaryTiles from './SummaryTiles';

export default function App() {
    return (
        <div className="mx-auto max-w-5xl p-8">
            <h1 className="text-2xl font-semibold text-gray-900">Transactions Dashboard</h1>
            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <div className="flex flex-col gap-6">
                    <FiltersPanel />
                    <CategoryBreakdown />
                </div>
                <div className="flex flex-col gap-6">
                    <SummaryTiles />
                </div>
            </div>
        </div>
    );
}
