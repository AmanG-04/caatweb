# Solar Site Designer

## Workflow and scope

The implemented workflow follows the revised request: an **automated Google Solar layout generator**, not a manual satellite drawing tool.

1. Open **Admin → Solar Site Designer** and create a project.
2. Enter the full house/site address and click **Find address on map**. Review the returned address match, then click the exact rooftop centre. Alternatively enter authored coordinates or choose a map pin directly.
3. Record who requested the address-specific energy-system design and confirm their request.
4. **Generate review layout** resolves an unambiguous rooftop address if no pin is supplied, requests Building Insights and the georeferenced raster roof mask, and displays Google's ranked panel suggestions. Approximate or ambiguous addresses require a rooftop pin. No permanent PDF is created at this stage.
5. Review the dashed cyan detected-building bounding box and numbered roof sections. Hide panels to inspect the imagery; exclude sections you do not want to use. Confirm that the detected building is the intended house/site, then **Save PDF version**. Name each alternative and compare its count/capacity and downloaded drawing.

Google selects the nearest known building centre within approximately 50 metres; it can return a neighbour or merge roofs across adjoining properties. A pin is a search point, not an exact property-boundary selection. The bounding box is provider metadata, not a traced roof polygon. Do not confirm a result that covers the wrong house. Existing PDFs remain immutable; an existing generation needs building confirmation before another export.

Roof mask failures now identify the failed stage. **Retry roof mask only** requests fresh Data Layers without regenerating panel positions or extending the original live-data expiry. Compressed raster decoding explicitly runs without decoder workers for Cloudflare compatibility. Error diagnostics contain stage/category only, not signed URLs or keys. Live verification of the originally reported production mask is still required.

Projects and settings use D1; PDF versions use the existing private R2 bucket. There is no browser-only persistence. All pages and endpoints require the existing admin token and `admin` role. No separate login is added. Existing login sessions now resume on the dashboard; logout clears the actual session cookie.

Building Insights supplies segment centres, bounding boxes, pitch, azimuth, height, roof-area statistics and panel positions. **It does not supply exact roof-section boundary polygons.** The roof mask remains raster data and can include neighbouring buildings. 3D wireframes are labelled as segment plane bounding boxes, not reconstructed roof outlines. Panels use Google's supplied reference dimensions/rating; manufacturer/model and thickness are not supplied. The tool does not substitute a catalogue module without recalculating its layout.

Ground sites, manual drawing, obstacle/setback editing, custom-module placement and custom clearance validation are not implemented in this revised automated workflow. No energy estimates, quotes, EPC operations, structural analysis or shadow simulation are included.

## Configuration

Use the already-approved Google billing account. Configure these runtime values in local environment variables or the existing Cloudflare environment/secrets mechanism:

| Variable | Purpose |
| --- | --- |
| `SOLAR_GOOGLE_ENABLED=true` | Enables the approved integration; defaults to disabled. |
| `GOOGLE_MAPS_BROWSER_KEY` | HTTP-referrer-restricted browser key, Maps JavaScript API only. This key is intentionally browser-visible after admin authentication. |
| `GOOGLE_SOLAR_API_KEY` | Server-only key for Solar API and Geocoding API. Never use the browser key here. |
| `SOLAR_DAILY_REQUEST_LIMIT=20` | Global application cap per backend service/day; constrained to 1–1000. Database accounting fails closed. |

Required bindings: existing `DB` and `BILLS_BUCKET`. Migration `db/migrations/0010_solar_designer.sql` was applied locally with `npm run db:migrate` and to the production `solar-db` database with explicit approval on 24 October 2026. All four designer tables were verified remotely and no migrations remain pending. Application deployment has not been run.

Enable Maps JavaScript API, Solar API and Geocoding API on the chosen Google project. Set **Google Cloud API quotas separately**, especially browser map usage. Application counters cannot cap usage by other applications sharing the billing account. Keys and API enablement are not configured by this implementation.

The generation job is leased for ten minutes to prevent concurrent requests for the same project. Settings saves use revision-based compare-and-swap. Autosave requests are serialized; edits made during a save remain pending for the next request. A revision conflict keeps local edits and requires an explicit reload. PDF errors are reported separately from successful live-data generation.

## Licensing, attribution and retention

Reviewed on 24 October 2026:

- [Maps Platform terms, §3.2.3(c)](https://cloud.google.com/maps-platform/terms): prohibits tracing/digitizing building outlines from Maps JavaScript satellite imagery. Drawing/tracing is disabled.
- [Service-specific Solar terms, §20](https://cloud.google.com/maps-platform/terms/maps-service-terms): permits energy-system design; editable Building Insights/Data Layers may be cached for up to 30 days. The deletion exception covers Solar Data incorporated into fixed media for a qualifying user-requested downstream transaction. This is why requester confirmation is required and PDFs, rather than indefinitely retained editable provider responses, are the durable design versions.
- [Solar attribution policies](https://developers.google.com/maps/documentation/solar/policies): includes `Source: Includes solar data from Google` and Google Maps attribution. Native map attribution remains visible. Solar results are displayed on Google Maps; no non-Google satellite basemap is mixed with them.
- Provider responses are reduced to geometry/rating/date fields, stored for **29 days**, hidden and purged on reads, and deleted by the existing daily Worker cron. Provider URLs, API keys, energy estimates and financial analyses are not saved to project content. No Google Maps satellite pixels are included in PDF exports; PDFs contain Solar API raster mask and vector panel drawings.
- Authored project inputs and fixed-media export metadata remain persisted. Project duplication copies authored settings and requires fresh provider generation; it does not duplicate cached Solar Data.

The existing scheduled Worker must stay active for physical retention cleanup. If the cron is disabled, access-time cleanup still hides/deletes expired data when the designer is opened, but unattended records need the scheduled cleanup. The live-data retention rule applies to operational databases and any configured database backup policies as well.

## Free allowances and NCR coverage

This production path **requires billing**, even while usage stays in a free allowance. A Google Demo Key is no-billing but prototype-only and does not support the complete Solar workflow. MapTiler Free is development/non-commercial and its terms restrict commercial tracing, so it was not selected.

The [current India price list](https://developers.google.com/maps/billing-and-pricing/pricing-india) lists monthly free usage caps of **70,000 Dynamic Maps**, **70,000 Geocoding**, **70,000 Building Insights** and **7,000 Data Layers** billable events for eligible India pricing. Caps aggregate across projects on the billing account, are not application quotas, and eligibility/prices must be confirmed in that account. Usage beyond the caps is chargeable. The full workflow is not represented as unconditionally free.

Point-in-polygon checks against Google's published 6 May 2026 coverage GeoJSON:

| Representative location | Coordinates | HIGH | MEDIUM | BASE |
| --- | --- | --- | --- | --- |
| Delhi | 28.6139, 77.2090 | Outside | Outside | Inside |
| Noida | 28.5355, 77.3910 | Outside | Outside | Inside |
| Gurugram | 28.4595, 77.0266 | Outside | Outside | Inside |
| Ghaziabad | 28.6692, 77.4538 | Outside | Outside | Inside |

[Coverage polygons are approximate](https://developers.google.com/maps/documentation/solar/coverage); a building can still return `404`. No credentialed building request or live satellite zoom/imagery inspection has been performed. Requests use `requiredQuality=BASE`; no imagery dates or measurement-accuracy claims are invented.

## Geometry

### Hybrid surveyed flat-site workflow

Select **Surveyed flat-roof / ground layout**. Enter an independent WGS84 survey origin and East/North metre offsets for each boundary, obstacle and access path. No drawing input is taken from Google satellite imagery. Concave polygons are accepted; self-intersections are rejected. Enter boundary setbacks, obstacle clearances and local-datum heights. Flat rooftops and flat ground sections use horizontal geometry; sloped-roof remounting is not included in the custom array engine.

Configure actual module dimensions/rating, portrait/landscape, panel tilt, panel gap and **row clear horizontal gap**. **180° true south is the array default** for India, independent of Google roof-plane azimuth. It is a reasonable fixed-array starting direction, not a site-specific annual-generation guarantee; no energy or shading calculation is implemented. Zero tilt is the neutral starter geometry, not an installation recommendation.

Preview compares four grid offsets at the chosen azimuth and selects the highest panel count. It tests complete projected footprints against polygon-clipped usable areas, setbacks, exclusions and optional current Solar roof-mask coverage. It does not claim global optimality or shadow-safe row spacing. Earlier sections own overlaps to avoid duplicate panels. Preview is cancellable and yields to the browser; it does not replace the saved array until **Apply preview** is selected. Input edits mark the applied layout stale and block export until recalculated. All layout positions and settings persist through D1 in the versioned hybrid settings schema; existing project schema-v1 records load with defaults.

The survey drawing, Google-map overlay, 3D preview and independent vector PDF share the saved metric geometry. Independently surveyed layouts remain editable without Google coverage. Mask-constrained layouts require current provider data and are removed when that data expires; fixed-media PDFs remain retained. Survey verification is user-recorded, not inferred from imagery.

WGS84 locations are converted through `proj4` into a site-centred UTM frame, with grid convergence rotated into true-east/true-north axes. Coordinates are metres: X east, Y north, Z up. Azimuth is clockwise from true north (0° north, 90° east); segment azimuth points downslope. Panel surface dimensions are projected using segment pitch and orientation. Geometry is independent of screen pixels and zoom. 3D and PDF use the same provider result/panel corners. Mask decoding uses its actual GeoTIFF UTM transform and northing resolution, not an axis-aligned latitude/longitude image stretch.

## Verification

- Vitest: metric distances/areas, sloped panel projection, rotated panel footprints, overlap detection, raster exclusions and real GeoTIFF decoding, schema validation, ranked alternative selection and DC capacity.
- SQLite-backed D1 adapter: save/reload, optimistic conflicts, job leases, provider-data retention, duplication and global request budgets.
- PDF generation: raster mask, vector content, A4 landscape, notes page, request confirmation and missing-storage rejection.
- Browser checks on local Wrangler/D1: existing admin login, authenticated navigation, CRUD, save/reload, settings undo/redo, injected autosave outage and retry, desktop 1440px/mobile 390px overflow, keyboard focus/labels, honest missing-map and empty-3D states, duplication/deletion, logout and unauthorized API access.
- `npm test`, `npm run typecheck`, `npm run build`, and `npm run cloudflare:build`.

Remaining activation checks: configured live NCR satellite imagery/zoom, successful Solar generation and actual mask/panel alignment, production R2 PDF retrieval, and a real user-requested design. These need restricted Google keys and deployment of the application code with the existing bindings. The production database migration is complete. No application deployment was performed.
