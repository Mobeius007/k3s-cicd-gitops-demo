# K3s CI/CD Demo (GitHub Actions to K3s via GHCR)

A small Node.js service with a full delivery pipeline: **test, build container image, push to GHCR, deploy to K3s with a zero-downtime rolling update**.

```
git push -> GitHub Actions
              |- test   (node --test)
              |- build  (Docker Buildx, push ghcr.io/<you>/<repo>:<sha>)
              '- deploy (kustomize sets image tag, kubectl apply, wait for rollout)
```

## Repo layout

```
app/        Node.js service (/, /healthz, /metrics) + tests
Dockerfile  Non-root, healthchecked image
k8s/        Kustomize manifests: namespace, deployment (2 replicas, probes, limits), service, Traefik ingress
scripts/    install-k3s.sh (single-node K3s)
.github/workflows/ci-cd.yml
```

## Setup

1. **Replace the placeholder** `YOUR_GITHUB_USER` with your GitHub username (lowercase) in
   `k8s/deployment.yaml`, `k8s/kustomization.yaml` and `.github/workflows/ci-cd.yml`:
   ```bash
   grep -rl YOUR_GITHUB_USER . | xargs sed -i 's/YOUR_GITHUB_USER/yourname/g'
   ```
2. **Install K3s** on a server: `./scripts/install-k3s.sh`
3. **Allow the pipeline to reach the cluster**: add a repository secret `KUBE_CONFIG` containing the
   base64-encoded kubeconfig (server address changed from `127.0.0.1` to a reachable host or VPN IP).
   Without this secret, the deploy job is skipped and test + build still run.
4. Make the GHCR package public, or add an `imagePullSecret` to the Deployment.
5. Push to `main`. Check: `kubectl -n demo get pods` and `curl -H "Host: demo.example.com" http://<node-ip>/`

## Run locally

```bash
cd app && npm test && npm start     # http://localhost:3000
docker build -t demo-service .
```

## Design notes

- Rolling update with `maxUnavailable: 0` and readiness probes keeps the service available during deploys.
- Image tagged with the commit SHA, so every deploy is traceable and rollback is `kubectl rollout undo`.
- Pods run as non-root with resource requests/limits.
- Next steps: swap the push-based deploy for Argo CD or Flux (pull-based GitOps), add image scanning (Trivy).
