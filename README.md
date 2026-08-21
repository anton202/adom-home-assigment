# Dev Exercise — Transactions Dashboard

A small, self-contained Laravel + React exercise. All boilerplate is already in place —
your job is the logic: a backend API over a seeded transactions table, and a React
dashboard on top of it.

**Expected effort: 3–4 hours.** We respect your time — if something isn't finished,
leave a short `TODO:` comment describing what you'd do with more time. A thoughtful
TODO is worth more than a rushed feature.

---

## Implementation notes

### Added JS dependencies

Two utilities, both tiny and dependency-free — not a component framework:

- **`clsx`** — conditional class composition.
- **`tailwind-merge`** — resolves conflicting Tailwind utilities in favour of the last
  one. The primitives in `resources/js/components/ui/` accept a `className` so callers
  can adjust them at the call site; without a merge step an override like
  `rounded-none` would just sit alongside the component's own `rounded-lg` and lose to
  specificity order in the stylesheet. Hand-rolling that means reimplementing
  Tailwind's conflict groups.

They are combined in `resources/js/lib/cn.js`. Note `tailwind-merge` v3 is the line
that understands Tailwind v4, which is what this project runs.

### TODO: keep the view state in the URL

The dashboard holds filters, sort, page and page size in React state in
`resources/js/components/App.jsx`, so they live and die with the tab: a view can't be
linked to a colleague, and a reload drops it. With more time I'd mirror that state into
the query string — read the initial state from `location.search` and push each change
with `history.replaceState` — which would also make back/forward and a bookmarked view
work as expected. The API already takes exactly these parameters, so the URL and the
request would use the same names.

### TODO: put the categories endpoint behind the same layers

`CategoryController` is boilerplate I left as it was found, and it is now the one
controller that queries Eloquent directly instead of going through the repository and
service the transaction endpoints use. With more time I'd add `distinctCategories()` to
`TransactionRepositoryInterface` and reach it through `TransactionService`, keeping the
single-action controller as it is — it is its own resource, so it does not belong on
`TransactionController`. I'd also settle whether it should return the categories present
in the data or `Transaction::CATEGORIES`: the two diverge as soon as a valid category has
no rows, and the filter would then be missing an option the API still accepts.

### TODO: return DTOs from the transaction repository

`App\Repositories\EloquentTransactionRepository` still hands Eloquent models to the layers
above it in two places:

- `paginate()` returns a `LengthAwarePaginator` of `Transaction` models.
- `setFlagged()` returns the updated `Transaction`.

The aggregate methods (`totals()`, `totalsByCategory()`) already cross that boundary as
plain data, which the service maps into the `TransactionSummary` / `CategorySummary` DTOs.
With more time I'd do the same for these two: add a `TransactionData` DTO, map to it inside
the repository (via the paginator's `through()` for the listing), and point
`TransactionResource` at the DTO instead of the model. That would keep Eloquent genuinely
behind the repository contract — the service, controller and resource would depend on the
shape of the data rather than on the ORM, so a different implementation of the contract
wouldn't ripple upwards.

I left it as it is here because `TransactionResource` is shared by the listing and the flag
endpoint, so the change is only worth making in one pass across both paths.

---

## Requirements

- PHP **8.3+**, Composer
- Node **20+**, npm

No database server needed — the app uses SQLite.

## Getting started

```bash
composer run setup   # installs PHP + JS deps, creates .env, migrates and seeds the DB
composer run dev     # starts Laravel + Vite together
```

Open <http://localhost:8000>. You should see a placeholder page rendered by React,
fetching live data from `GET /api/categories`. If you see the category chips, the
whole stack works — you're ready to start.

Run the test suite with:

```bash
composer run test
```

## What's already done for you

- **Data**: a `transactions` table (migration), `Transaction` model, factory, and a
  seeder that generates ~1,000 realistic transactions over the last 90 days.
  Fields: `occurred_at`, `merchant`, `category`, `amount`, `status`
  (`completed | pending | failed`), `flagged`. Valid categories and statuses are
  constants on the model.
- **API plumbing**: `routes/api.php` with an example endpoint
  (`GET /api/categories` → `app/Http/Controllers/Api/CategoryController`).
  API errors render as JSON automatically.
- **React plumbing**: Vite + React fast refresh, entry at `resources/js/app.jsx`,
  root component at `resources/js/components/App.jsx`, an example data-fetching
  component (`CategoryChips.jsx`), and a small fetch helper (`resources/js/lib/api.js`).
  Tailwind is available for styling.
- **Tests**: PHPUnit configured with in-memory SQLite and one example feature test
  (`tests/Feature/CategoriesTest.php`).

You should only need to touch `app/`, `routes/api.php`, `resources/js/`, and `tests/`.

---

## The assignment

Build a transactions dashboard: a filterable, sortable, paginated list of
transactions with summary figures, and the ability to flag a transaction.

### Part 1 — API

**`GET /api/transactions`** — list transactions.

Query parameters, all optional and freely combinable:

| Param | Meaning |
|---|---|
| `date_from`, `date_to` | filter by `occurred_at` (inclusive, `YYYY-MM-DD`) |
| `category` | one of the valid categories |
| `status` | one of the valid statuses |
| `search` | case-insensitive partial match on `merchant` |
| `sort` | `occurred_at` (default) or `amount` |
| `direction` | `asc` or `desc` (default `desc`) |
| `page`, `per_page` | pagination; `per_page` defaults to 20, max 100 |

Returns paginated JSON. **Invalid parameters must return a 422** with validation errors —
not a 500, and not silently ignored.

**`GET /api/transactions/summary`** — summary figures respecting the **same filters**
(`date_from`, `date_to`, `category`, `status`, `search`):

- total transaction count
- total amount
- a per-category breakdown (count + total amount per category)

**`PATCH /api/transactions/{id}/flag`** — set the flag on a transaction.
Body: `{ "flagged": true }` or `{ "flagged": false }`. Returns the updated
transaction; 404 for an unknown id, 422 for an invalid body.

### Part 2 — UI

Replace the placeholder in `resources/js/components/App.jsx` with the dashboard:

- **Filter bar**: date range, category select, status select, merchant search.
  Filters combine, and everything below reflects them.
- **Summary cards**: total count, total amount, and a per-category breakdown —
  always in sync with the active filters.
- **Transactions table**: date, merchant, category, amount, status, flagged.
  Sortable by date and amount. Paginated, with page controls.
- **Flag/unflag** action on each row, with immediate visual feedback and sensible
  behavior when the request fails.
- **States**: loading, error, and empty (filters that match nothing) are all handled
  visibly — no blank screens, no spinner that never resolves.

---

## Rules

1. **The code must run.** We will clone your submission and run exactly
   `composer run setup` then `composer run dev`. If it doesn't start or the
   dashboard doesn't work, the submission is not reviewed further. Test this
   yourself from a clean clone before submitting.
2. **Filtering, sorting, pagination, and aggregation happen in the database.**
   Do not fetch all rows and filter/paginate/sum them in JavaScript (or in PHP
   collections).
3. **Use git.** This zip ships without a repository — before you start, run
   `git init` and commit the untouched boilerplate as your first commit. Then
   **commit as you go**, with meaningful messages. The git history is part of the
   review — we want to see how you break the problem down.
4. Stay within the stack: no additional Composer packages; JS libraries only if
   you can justify the choice in a sentence (a data-fetching lib is fine; a
   full component framework defeats the purpose).
5. Tests are **encouraged, not required**. A couple of meaningful API tests are a
   strong plus; the setup is ready for you.

## What we look at

- How you **decompose** the problem: component boundaries and reusable hooks on the
  frontend; where validation, query building, and response shaping live on the backend.
- **Correctness** of the interactions: filters × pagination × sorting × summary all
  staying consistent (e.g. what happens to the current page when a filter changes?).
- **Best practices** you'd use in production code — in whatever form you find
  appropriate; part of the exercise is seeing which tools of the framework you reach for.
- A **working result** over a fancy one. Styling is not evaluated beyond basic usability.

## Out of scope

Authentication, deployment, responsive design, and visual polish. Don't spend time there.

## Submitting

Push to a private repo and share access, or send us a zip **including the `.git`
directory** (exclude `vendor/` and `node_modules/`).
