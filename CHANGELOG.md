# BrandShuo Attribution Intelligence — Changelog

## v4.7.0 (2026-06-09) — Current
### Added
- Redirect chain tracer: HTTP 301/302/303/307/308 + meta refresh following
- POST /api/trace endpoint for full redirect hop analysis
- 35+ short link domain detection (bit.ly, amzn.to, t.co, etc.)
- Webhook notifications: Slack, Discord, generic JSON webhooks
- WordPress Plugin: Shortcode, Gutenberg block, admin settings
- Node.js SDK: npm-ready with 10 methods + TypeScript types
- Structured JSON logging with request IDs and timing
- Publisher relationships API: /api/publisher/:id/related
- GET /api/dashboard visual HTML analytics dashboard
- GET /api/health system monitoring endpoint
- Response caching: 5-min TTL LRU cache with auto-eviction
- Rate limiting: 3-tier (free/pro/enterprise) sliding window
- GitHub Actions CI/CD pipeline (test → deploy)
- 18-unit test suite + 17 integration API tests
- Supervisor database adapter (JSON + Supabase ready)

### Changed
- Publisher database: 93 → 287 publishers (208% growth)
- Coverage: US only → 18 countries/regions
- 25+ affiliate networks identified
- API now returns publisher_id, publisher_url, is_shortened_url
- Enhanced error responses with request_id and structured codes

### Fixed
- ShareASale no longer misidentified as Sovrn Commerce
- PartnerBoost no longer misidentified as Amazon Attribution
- Levanta no longer misidentified as Refersion
- Publisher ID extraction for Awin, CJ, Impact, PartnerBoost, Levanta
- Domain-based network scoring priority over generic params

## v4.1.3 (2026-05) — Previous Stable
- Amazon Associates detection
- Basic CJ, Awin, Impact, Rakuten, Partnerize detection
- 93 publishers in database
- Single URL analysis only
- Publisher intelligence engine v4.1.3
