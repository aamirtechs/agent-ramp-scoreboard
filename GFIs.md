# Good First Issues

## Add a ramp curve sparkline per cohort
Scope: render a small inline SVG from the cohort week means already computed, with a logic test for the point scaling.
Good for a first contribution: no new data leaves the cohort aggregate level.

## Add chat concurrency as an optional metric
Scope: accept an optional chat_concurrency column, aggregate it like the other metrics, and add it to the bands config and CSV.
Good for a first contribution: keep the column optional so old files still parse.

## Provide a synthetic dataset generator page section
Scope: add a button that builds a synthetic ramp CSV in the browser with realistic week shapes, using Agent 001 style references only.
Good for a first contribution: reuse the sample shape already in index.html.
