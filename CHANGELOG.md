# Changelog

## [2.1.0](https://github.com/moollaza/repo-remover/compare/v2.0.0...v2.1.0) (2026-04-27)


### Features

* **analytics:** standardize Fathom events to dot notation ([#214](https://github.com/moollaza/repo-remover/issues/214)) ([6379983](https://github.com/moollaza/repo-remover/commit/6379983fe79e10b20dc802aeaab2d6453723041b))
* SEO foundations — robots.txt, sitemap, OG image, FAQ schema ([#212](https://github.com/moollaza/repo-remover/issues/212)) ([740e39d](https://github.com/moollaza/repo-remover/commit/740e39dd87b3342837b26e9ae841eab20b43c240))
* SEO optimization and /guides section ([#217](https://github.com/moollaza/repo-remover/issues/217)) ([df67d4e](https://github.com/moollaza/repo-remover/commit/df67d4e8656b8fc2927a464ba09f0080f9e9d06a))
* **seo:** add Cloudflare Worker for www/HTTP redirect + canonical Link header ([#218](https://github.com/moollaza/repo-remover/issues/218)) ([08d9c2b](https://github.com/moollaza/repo-remover/commit/08d9c2b3758469407c8f4736b0caf3802202a5ea))


### Bug Fixes

* **seo:** Cloudflare Worker for redirects and canonical header ([#221](https://github.com/moollaza/repo-remover/issues/221)) ([43f9b8d](https://github.com/moollaza/repo-remover/commit/43f9b8d8610993042613b6c455bf1e11a3e71685))
* **seo:** run worker first so HTTP→HTTPS and www redirects actually fire ([#219](https://github.com/moollaza/repo-remover/issues/219)) ([42bbb5e](https://github.com/moollaza/repo-remover/commit/42bbb5ee755306e91a31bfd89f3ee9ce9fb382a5))
* tighten analytics CSP ([#224](https://github.com/moollaza/repo-remover/issues/224)) ([8296f66](https://github.com/moollaza/repo-remover/commit/8296f6634477b086da178f714963116857ab1f70))


### Performance Improvements

* defer Octokit/auth from home route + harden CLS on marketing surfaces ([#222](https://github.com/moollaza/repo-remover/issues/222)) ([7eb04e5](https://github.com/moollaza/repo-remover/commit/7eb04e59f0a601c58e759b2f8c0974ca2287c214))
