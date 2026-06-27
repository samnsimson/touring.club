#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "${REPO_ROOT}"

if [[ ! -f infra/jenkins/.env ]]; then
  cp infra/jenkins/.env.example infra/jenkins/.env
  echo "Created infra/jenkins/.env from .env.example"
fi

docker compose up -d --build jenkins

echo
echo "Jenkins is starting at http://localhost:8080"
echo "Login: admin / $(grep -E '^JENKINS_ADMIN_PASSWORD=' infra/jenkins/.env | cut -d= -f2- || echo admin)"
echo
echo "After Jenkins is healthy, create a Multibranch Pipeline job:"
echo "  New Item → Multibranch Pipeline → Git → Script Path: Jenkinsfile"
