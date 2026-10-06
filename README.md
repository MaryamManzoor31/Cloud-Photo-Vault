# Cloud Photo Vault

Cloud Photo Vault is a Netlify-hosted frontend backed by Supabase cloud services.

## Cloud service types used

This project uses managed cloud services; it does not provision virtual machines or manage cloud hardware.

- **PaaS (Platform as a Service) — Netlify hosting:** Netlify builds and serves the static frontend, so the project does not manage a web server or operating system.
- **BaaS (Backend as a Service) — Supabase:** Supabase provides the app's managed backend services. In this project, those include:
  - **AuthaaS (Authentication as a Service) — Supabase Auth:** handles email/password sign-up and login, verifies users, and maintains their sessions. The app does not implement its own password or identity server.
  - **Object Storage as a Service — Supabase Storage:** stores and serves uploaded photo/video files in the `photos` bucket.
  - **DBaaS (Database as a Service) — Supabase PostgreSQL:** stores media metadata in the `photos` table. Supabase manages the database service; the app accesses it through the Supabase Data API.

These are the cloud service types actually used by the deployed app. It does not use IaaS virtual machines or a separately deployed application server.

## Cloud architecture and data flow

### Cloud services and their roles

- **Netlify (frontend hosting and deployment):** serves the static HTML, CSS, and JavaScript files at <https://cloudphotovault.netlify.app/>. The configured build checks the JavaScript syntax, and Netlify publishes the project root. Netlify hosts the user interface; it is not where media or account data are stored.
- **Supabase Auth (identity and sessions):** provides email/password sign-up and login. After successful authentication, the Supabase client maintains the user's session and supplies its access token with authenticated requests.
- **Supabase Storage (media object storage):** stores uploaded photos and videos in the `photos` bucket. Objects use a user-specific path (`user-id/generated-file-name`) so the app can associate each object with its owner. The app retrieves and deletes objects through the Storage API.
- **Supabase PostgreSQL (structured metadata):** stores one row per media item in the `photos` table. The app records fields such as `user_id`, `file_name`, `file_path`, `file_size`, and `mime_type`; the actual media bytes are stored in Storage, not in the table.
- **Supabase Data API / PostgREST (database access):** the Supabase JavaScript SDK uses the Data API for operations on `photos`, such as inserting metadata, selecting the signed-in user's rows, and deleting a row. The app does not connect directly to the database server.
- **Row Level Security (authorization at the database):** policies on the `photos` table should enforce that a user can only access rows where `user_id` matches their authenticated identity. Storage policies should similarly restrict access to that user's objects. The client-side `user_id` filter is useful for the query but is not a security boundary by itself; verify the policies in the Supabase dashboard.
- **HTTPS/TLS (transport security):** browser requests to Netlify and Supabase use HTTPS, which encrypts data in transit. This does not replace authentication or access-control policies.

The browser integrates these services with the Supabase JavaScript SDK and the project's **publishable key**. This key is intended for client-side use and is not a substitute for correct database and Storage policies. No Supabase secret/service-role key is used in the frontend.

### End-to-end data flow

1. A visitor signs up or logs in through Supabase Auth.
2. The authenticated browser selects media and uploads each file to the Supabase Storage `photos` bucket under a user-specific path.
3. After a successful upload, the browser inserts that file's metadata and Storage path into the PostgreSQL `photos` table through the Supabase Data API. If the database insert fails, the app attempts to remove the just-uploaded object to avoid leaving an orphaned file.
4. To display the gallery, the browser requests the current user's metadata rows, then retrieves the media objects from Storage and renders them in the page.
5. When a user deletes media, the app removes the object from Storage and deletes its metadata row.

The live application is a static frontend hosted by Netlify and connects directly to Supabase. It does not use a separate Node.js API server.

## Cloud-flow visualizer

Open `cloud-visualizer.html` to explore simulated authentication, upload, gallery-fetch, and delete flows. Its packet counts, latency, database writes, and storage metrics are illustrative values, not measurements from live Supabase requests.

## Build and deployment

Netlify runs `npm run build`, which checks `app.js` for JavaScript syntax errors, and publishes the project root as a static site. The frontend is deployed at <https://cloudphotovault.netlify.app/>.

Run the build check locally with:

```sh
npm run build
```
