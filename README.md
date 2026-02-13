# **Urumi Cloud Orchestrator**

A production-grade, multi-tenant Kubernetes provisioning system designed to automate the deployment and management of e-commerce instances.

---

## **1. Local Setup Instructions**

### **Prerequisites**
* **Kubernetes Cluster**: Ensure a local cluster like `k3d`, `minikube`, or `Docker Desktop K8s` is running.
* **Helm**: Ensure Helm is installed and the Bitnami repository is added:
    `helm repo add bitnami https://charts.bitnami.com/bitnami`

### **Installation**
1.  **Clone the Repository**:
    ```bash
    git clone [https://github.com/progammeur007/urumi-store-orchestrator.git](https://github.com/progammeur007/urumi-store-orchestrator.git)
    cd urumi-store-orchestrator
    ```
2.  **Run Backend**:
    ```bash
    cd backend
    npm install
    node server.js
    ```
3.  **Run Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
4.  **Access**: Open your browser to `http://localhost:5173`.

---

## **2. VPS / Production Setup (k3s)**

To transition this orchestrator to a production VPS environment:
1.  **Environment Parity**: Set `export NODE_ENV=production`. The orchestrator will automatically switch to `values-prod.yaml`, which allocates higher CPU/RAM and utilizes `LoadBalancer` services.
2.  **DNS & Ingress**: Replace the local `ClusterIP` logic with an Ingress Controller (e.g., Nginx) and `cert-manager` for automated SSL/TLS termination.
3.  **Security**: Move bootstrap credentials (currently `admin123`) into **Kubernetes Secrets** or a dedicated Vault provider.

---

## **3. How to Create a Store & Place an Order**

Follow these steps to verify end-to-end functionality:
1.  **Provision**: On the dashboard, click **"+ Deploy New Instance"**. Monitor the **System Activity Log** for real-time Helm lifecycle events.
2.  **Access Store**: Once the status is **ACTIVE**, click **"Visit Store"** (linked to `localhost:8080/shop`).
3.  **Place Order**:
    * Add a product to your cart.
    * Proceed to checkout and select **Cash on Delivery**.
    * Complete the order.
4.  **Verify Admin**: Log in at `/wp-admin` with username `admin` and password `admin123`. Confirm the order is visible under **WooCommerce > Orders**.

---

## **4. System Design & Tradeoffs**



### **Architecture Choice**
* **Stateless Orchestration**: The backend is stateless and treats the Kubernetes API as the primary "Source of Truth". This allows the platform to be horizontally scaled across multiple replicas.
* **Namespace-per-Tenant**: Provides strong multi-tenant isolation, ensuring that resource limits and security policies are applied per-store.

### **Idempotency & Failure Handling**
* **Atomic Reconciliation**: Provisioning uses `helm upgrade --install` with the `--rollback-on-failure` flag. This ensures that if a deployment fails, the cluster state is automatically cleaned up and safe to retry.
* **Concurrency Guardrails**: A backend semaphore limits simultaneous provisioning to prevent "thundering herd" issues on limited hardware (8GB RAM).

### **Tradeoffs & Production Roadmap**
* **Storage**: Currently using local storage provisioners; production requires a cloud-native **StorageClass** (EBS/GCE PD) for persistent data across node failures.
* **Database**: For local simplicity, MariaDB runs inside the cluster. In production, we would trade this for a managed RDS instance for better durability.

---

### **Repository Contents**
* **`/backend`**: Orchestration server (`server.js`) and environment-specific values (`values-local.yaml`, `values-prod.yaml`).
* **`/frontend`**: React dashboard with real-time audit logging and store management.
