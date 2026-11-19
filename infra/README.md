# Bürgerportal OpenShift Infrastructure

OpenShift 4.x declarative deployment manifests for Bürgerportal Musterstadt. Complies with **restricted-v2 SCC** and **PSA restricted**.

## Structure

```
infra/
├── Containerfile                  # Multi-stage UBI 9 Node.js image (arbitrary UID / root GID 0)
├── .dockerignore
├── secret-template.yaml.example   # Template for database credentials
├── base/
│   ├── kustomization.yaml
│   ├── imagestream.yaml           # ImageStream for container builds
│   ├── buildconfig.yaml           # In-cluster BuildConfig (Docker strategy)
│   ├── serviceaccount.yaml        # buergerportal SA
│   ├── configmap.yaml             # App runtime configuration (PORT, HOST, BODY_SIZE_LIMIT)
│   ├── postgres.yaml              # PostgreSQL 16 StatefulSet + headless Service + PVC
│   ├── deployment.yaml            # Deployment with OpenShift image trigger
│   ├── service.yaml               # ClusterIP Service (port 8080)
│   ├── route.yaml                 # Edge TLS Route with HTTP -> HTTPS redirect
│   ├── networkpolicy.yaml         # Ingress NetworkPolicy (Router & namespace isolation)
│   ├── hpa.yaml                   # HorizontalPodAutoscaler
│   └── pdb.yaml                   # PodDisruptionBudget
└── overlays/
    ├── dev/                       # Development overlay (namespace: buergerportal-dev)
    └── prod/                      # Production overlay (namespace: buergerportal-prod)
```

## Quick Start

### 1. Create Secrets (out-of-band)

```sh
NS="buergerportal-dev"

# Database credentials
oc create secret generic buergerportal-db-secret \
  --from-literal=database-user=buergerportal \
  --from-literal=database-password=$(openssl rand -base64 18) \
  -n "$NS" --dry-run=client -o yaml | oc apply -f -

# App connection secret
DB_PASS=$(oc get secret buergerportal-db-secret -n "$NS" -o jsonpath='{.data.database-password}' | base64 -d)
oc create secret generic buergerportal-secret \
  --from-literal=DATABASE_URL="postgres://buergerportal:${DB_PASS}@buergerportal-db:5432/buergerportal" \
  -n "$NS" --dry-run=client -o yaml | oc apply -f -
```

### 2. Apply Manifests

```sh
# Apply overlay
oc apply -k infra/overlays/dev
```

### 3. Build & Deploy

```sh
# Start build from local directory (binary build)
oc start-build buergerportal --from-dir=. -n "$NS" --follow

# Or for Git-based build:
# oc start-build buergerportal -n "$NS" --follow

# The deployment triggers automatically once the image is pushed to ImageStream:
oc rollout status deploy/buergerportal -n "$NS" --timeout=5m
```

### 4. Database Setup & Seed (first run)

```sh
# Run database schema push & seed inside the cluster pod
APP_POD=$(oc get pod -n "$NS" -l app.kubernetes.io/name=buergerportal -o jsonpath='{.items[0].metadata.name}')
oc exec -n "$NS" "$APP_POD" -- npm run db:push
oc exec -n "$NS" "$APP_POD" -- npm run db:seed
```

### 5. Verify Route

```sh
oc get route buergerportal -n "$NS" -o jsonpath='{.spec.host}{"\n"}'
```
