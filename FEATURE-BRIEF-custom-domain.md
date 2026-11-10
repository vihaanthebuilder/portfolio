# FEATURE BRIEF — Custom domain: vihaanadhikari.com (Vihaan's World)

Nishant purchased **vihaanadhikari.com** at Porkbun on Nov 9, 2026. DNS at Porkbun is being set from elsewhere (GitHub Pages A records 185.199.108.153 / .109.153 / .110.153 / .111.153 + www CNAME to vihaanthebuilder.github.io) — do NOT touch DNS; this brief is the repo side only.

**Publishing this change is PRE-AUTHORIZED by Nishant** (unlike feature builds): merge and push to main are expected.

## Steps

1. Branch `feature/custom-domain` from main. Add a file named `CNAME` at the repo root (the publish root) containing exactly one line:
   `vihaanadhikari.com`
2. Merge the branch into main and push. No force-push; stop and report on any conflict.
3. Live-verify (allow time for DNS propagation):
   - `https://vihaanadhikari.com/` serves the site.
   - `https://vihaanthebuilder.github.io/portfolio/` redirects to the new domain.
   - Spot-check `https://vihaanadhikari.com/gameroom.html` loads.
4. HTTPS: GitHub provisions the certificate after DNS resolves — this can lag. If the cert is not ready yet, do NOT force anything; record the exact state (DNS resolving? cert pending?) in HANDOFF.md and stop.
5. Update HANDOFF.md: CNAME committed/merged (hashes), verification results with timestamps, cert state.
