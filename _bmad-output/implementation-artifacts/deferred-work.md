- source_spec: `_bmad-output/implementation-artifacts/spec-walk-and-trophies.md`
  summary: Unverified medium possibility of trophy picking taking priority over a nearer interactive object.
  evidence: pick() returns a trophy intersection before checking other interactive meshes. Both default-camera rack click/tap checks pass; no specific user-reachable occluded interactive target was reproduced. Settle with a camera/ray case showing an actual nearer interactive surface before changing the legacy picking policy.
