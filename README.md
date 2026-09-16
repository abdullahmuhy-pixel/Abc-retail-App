# ABC Retail — Azure Functions (Project 2)

Four HTTP-triggered Azure Functions (Node.js, v4 programming model) that
each call one Azure Storage service, reusing the same storage account as
the Project 1 web app.

| Function | Route | Method | Service |
|---|---|---|---|
| storeCustomer | /api/storeCustomer | POST | Azure Table Storage |
| uploadProductImage | /api/uploadProductImage | POST | Azure Blob Storage |
| queueOrder | /api/queueOrder | POST (write) / GET (read) | Azure Queue Storage |
| writeLogFile | /api/writeLogFile | POST | Azure Files |

## 1. Create the Function App resource

1. Azure Portal → **Create a resource** → **Function App**.
2. Basics:
   - Resource group: same one as your Web App (`RSG-RCGPON-ST10540222-SANORTH`)
   - Function App name: e.g. `st10540222-functions` (must be globally unique)
   - Publish: **Code**
   - Runtime stack: **Node.js**, version **22 LTS** (match whatever the dropdown offers, same as the Web App)
   - Region: **South Africa North** (same as your storage account)
3. Hosting: **Consumption (Serverless)** plan — this is the cheapest/free-tier-friendly option and doesn't need an App Service Plan like the Web App did.
4. Storage account: when it asks for the Function App's own required storage account (used internally for triggers/logging), you can reuse `st10540222abcretail` or let it create a new one — either is fine, this is separate from the `AZURE_STORAGE_CONNECTION_STRING` app setting below.
5. Review + create → Create.

If you hit the same "Application Insights" or "SKU not allowed" policy errors as with the Web App: disable Application Insights under Monitoring, same fix as before.

## 2. Add the storage connection string

1. Function App → **Environment variables** (or **Configuration** → Application settings).
2. Add: Name `AZURE_STORAGE_CONNECTION_STRING`, Value = the same connection string from `st10540222abcretail` used in Project 1.
3. Save.

## 3. Deploy via GitHub Actions (same pattern as the Web App)

1. Function App → **Deployment Center** → Source: **GitHub** → Authorize if needed.
2. Organization: your account. Repository: **Abc-retail-App**. Branch: **main**.
3. **Important — this repo has the functions in a subfolder, not the root.** After Azure generates the workflow file, you'll need to edit it on GitHub before it will build correctly (same kind of fix as the queueService bug in Project 1):
   - Open `.github/workflows/<the new function app workflow file>.yml` on GitHub.
   - Find every line referencing a working directory or `AZURE_FUNCTIONAPP_PACKAGE_PATH` (often set to `'.'`) and change it to `'./azure-functions'`.
   - Find the `npm install`, `npm run build --if-present` step — make sure it runs with `working-directory: ./azure-functions` (add this line under that step if it's missing).
   - Commit directly to `main`.
4. Watch the run in `github.com/<your-username>/Abc-retail-App/actions` — same as before.

If the build fails with "package.json not found" or similar, that confirms the path wasn't updated correctly — double check every path in the workflow points at `./azure-functions`, not the repo root.

## 4. Get function URLs + keys for testing

Each function uses `authLevel: "function"`, so calling it needs a function key in the URL:

1. Function App → **Functions** (left menu) → tap a function (e.g. `storeCustomer`) → **Function Keys** → copy the `default` key.
2. Full callable URL looks like:
   `https://<your-function-app-name>.azurewebsites.net/api/storeCustomer?code=<the-key>`

## 5. Test each function

Since you're on mobile with no Postman, the simplest way to POST JSON from your phone is a **web-based API tester** in your browser (e.g. reqbin.com, or httpie.io's web client) — enter the function URL, method (GET/POST), JSON body, and send.

Example body for storeCustomer:
```json
{ "fullName": "Test User", "email": "test@example.com", "phone": "0123456789", "address": "Test Address" }
```

Example body for queueOrder (POST):
```json
{ "customerId": "some-customer-rowkey", "productId": "some-product-rowkey", "quantity": 2 }
```

Example body for writeLogFile:
```json
{ "message": "Function test entry" }
```

For `uploadProductImage`, `imageBase64` needs to be a base64-encoded image string — easiest is to skip a real photo for this one test and just confirm the function runs (a small placeholder base64 string works fine as evidence — the code is what's marked, not the image content).

After each test, go check the relevant Azure Portal Storage Browser (Tables/Blob/Queue/Files) to confirm the new record landed — that confirms + gives you your screenshot evidence for Project 2.
