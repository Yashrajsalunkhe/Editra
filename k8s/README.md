# Editra Kubernetes Quickstart

This folder teaches the minimum Kubernetes flow using your current project.

## Prerequisites (Fedora)

Install `kubectl` (required):

```bash
sudo dnf install -y kubernetes1.34-client
kubectl version --client
```

If `kubectl` is still not found after install, restart your terminal and run:

```bash
command -v kubectl
```

Local cluster options:

- Minikube (already installed on your machine)
- kind (optional alternative)

## What these manifests create

- `editra` namespace
- `backend` Deployment + ClusterIP Service
- `frontend` Deployment + NodePort Service (port `30080`)
- PVC for backend uploads (`/app/uploads`)
- Nginx ConfigMap so frontend `/api/*` proxies to backend service inside cluster

## 1. Build images from this repo

Run from project root:

```bash
docker build -t editra-backend:local ./backend
docker build -t editra-frontend:local ./frontend
```

## 2. Make images visible to your cluster

### Option A: Minikube

```bash
minikube start
minikube image load editra-backend:local
minikube image load editra-frontend:local
```

### Option B: kind

```bash
kind create cluster --name editra
kind load docker-image editra-backend:local --name editra
kind load docker-image editra-frontend:local --name editra
```

## 3. Apply manifests

```bash
kubectl apply -f k8s/namespace.yaml
kubectl wait --for=jsonpath='{.status.phase}'=Active namespace/editra --timeout=60s
kubectl apply -f k8s/backend-pvc.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-nginx-configmap.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl get pods,svc -n editra
```

Wait until both pods are `Running` and `READY 1/1`.

If you previously saw `namespaces "editra" not found`, just rerun step 3 exactly as above.

## 4. Open the app

### With Minikube

```bash
minikube service frontend-service -n editra --url
```

### With kind (or any local cluster)

Open:

```text
http://localhost:30080
```

## 5. Useful debug commands

```bash
kubectl get all -n editra
kubectl logs deploy/backend -n editra
kubectl logs deploy/frontend -n editra
kubectl describe pod -n editra <pod-name>
```

## 6. Clean up

```bash
kubectl delete -f k8s/
```
