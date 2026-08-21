import CategoryChips from './CategoryChips';

export default function App() {
    return (
        <div className="mx-auto max-w-5xl p-8">
            <h1 className="text-2xl font-semibold text-gray-900">Transactions Dashboard</h1>
            <p className="mt-2 text-gray-600">
                The boilerplate is wired: this page is rendered by React through Vite, and the
                chips below come from <code className="rounded bg-gray-200 px-1">GET /api/categories</code>.
                Replace this placeholder with your dashboard — the assignment is in README.md.
            </p>
            <div className="mt-6">
                <CategoryChips />
            </div>
        </div>
    );
}
