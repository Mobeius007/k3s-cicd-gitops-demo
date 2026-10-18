#!/usr/bin/env bash
# Installs a single-node K3s cluster and prints the kubeconfig you need for CI.
set -euo pipefail

curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644
sudo k3s kubectl wait --for=condition=Ready node --all --timeout=120s

echo
echo "K3s is ready. Kubeconfig: /etc/rancher/k3s/k3s.yaml"
echo "For GitHub Actions: copy it, replace 127.0.0.1 with your server's reachable address,"
echo "then store it as the KUBE_CONFIG repository secret (base64-encoded):"
echo "  base64 -w0 /etc/rancher/k3s/k3s.yaml"
