# ABC Retail — Azure Storage Services Demo (CLDV7112w)

Node.js/Express app used across ICE Tasks 1–4. It uses **all four** Azure
Storage services: Tables, Blob Storage, Queue Storage and Azure Files.

## 1. Prerequisites

- Node.js installed (or use GitHub Codespaces — click "Code" → "Codespaces" → "Create codespace" on your repo)
- An Azure account (free tier is fine — https://azure.microsoft.com/free)

## 2. Create the Azure Storage Account (do this once)

1. Portal → **Create a resource** → **Storage account**.
2. Resource group: create new, e.g. `rg-abcretail`.
3. Storage account name: e.g. `abcretailstorage` (must be globally unique, lowercase, no spaces).
4. Region: closest to you. Performance: Standard. Redundancy: LRS is fine for a student project.
5. Review + Create → Create. Wait for deployment to finish → Go to resource.
6. Left menu → **Access keys** → click **Show** next to key1 → copy the **Connection string**.

## 3. Configure the app

```bash
cd abc-retail-app
npm install
cp .env.example .env
# paste your connection string into .env
```

## 4. Run it

```bash
npm start
```

Visit the URL Codespaces gives you (or `http://localhost:3000`). On first run
the app automatically creates the Tables, Blob container, Queue and File
share in your storage account — you don't need to create them manually in
the Portal first.

## 5. Where to take screenshots for each ICE Task

### ICE Task 1 — Azure Tables + Blob Storage
1. In the app: add 2–3 customers and 2–3 products (with images).
2. Azure Portal → your storage account → **Storage browser** → **Tables** →
   open `Customers` → screenshot the rows.
3. Storage browser → **Tables** → open `Products` → screenshot the rows.
4. Storage browser → **Blob containers** → `product-images` → screenshot the
   uploaded image files.

### ICE Task 2 — Azure Queues + Azure Files
1. Place 2–3 orders in the app (or upload a product image — that also
   queues a message).
2. Click **Peek Queue** in the app, or Portal → Storage browser → **Queues**
   → `order-processing` → screenshot the pending messages.
3. Click **Process Queue** to simulate a worker consuming them.
4. Portal → Storage browser → **File shares** → `abcretaillogs` → `logs` →
   screenshot the `app-log-YYYY-MM-DD.txt` file (open it to show contents).

### ICE Task 3 — Integration
Repeat the steps above in one continuous walkthrough (add a customer → add a
product with image → place an order → process the queue → view the log
file) and screenshot each Azure resource showing the new data, to
demonstrate all four functions working together.

### ICE Task 4 — Event Hubs / Service Bus discussion
No new screenshots of this app are required — Task 4 asks you to *discuss*
how Event Hubs and Service Bus could extend the architecture. Optional: if
you create an Event Hub / Service Bus namespace in the Portal to illustrate
your discussion, screenshot the **Overview** blade showing it provisioned.

## 6. Push this project to GitHub

Since you're working from your phone, the easiest path is GitHub's own website or GitHub Codespaces — no PC needed.

### Option A — Upload via github.com (simplest, no terminal)
1. Go to https://github.com/new and create a repository, e.g. `abc-retail-app`.
2. On the new repo's page, tap **"uploading an existing file"**.
3. Upload every file/folder from this project **except** `node_modules` (there isn't one yet — you haven't run `npm install` here) — just drag in `server.js`, `package.json`, `.env.example`, `.gitignore`, `README.md`, and the `config/`, `services/`, `routes/`, `public/` folders.
4. Commit directly to the `main` branch.
5. Copy the repository URL (e.g. `https://github.com/<your-username>/abc-retail-app`) — this is the GitHub link your Project 1 document needs.

### Option B — GitHub Codespaces (if you want to actually run/test it first)
1. Create the empty repo as in Option A, step 1.
2. Open it → **Code** → **Codespaces** → **Create codespace on main**.
3. In the Codespace terminal, upload/paste this project's files (or `git clone` if you've already pushed via Option A), then:
   ```bash
   npm install
   cp .env.example .env
   # paste your Azure Storage connection string into .env
   npm start
   ```
4. Commit and push any changes:
   ```bash
   git add .
   git commit -m "ABC Retail Azure Storage app"
   git push
   ```

**Never commit your real `.env` file** — it contains your Azure Storage connection string (a secret). The `.gitignore` in this project already excludes it; only `.env.example` (with placeholder values) should go to GitHub.


```
abc-retail-app/
├── server.js                # Express app entry point
├── config/azureConfig.js    # Reads settings from .env
├── services/
│   ├── tableService.js      # Azure Tables (customers, products)
│   ├── blobService.js       # Azure Blob Storage (product images)
│   ├── queueService.js      # Azure Queue Storage (order/inventory events)
│   └── fileService.js       # Azure Files (application logs)
├── routes/                  # Express routes calling the services above
└── public/index.html        # Simple UI to exercise every service
```
