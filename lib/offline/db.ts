import {
  OFFLINE_DB_NAME,
  OFFLINE_DB_VERSION,
  OFFLINE_STORE_NAME,
} from "./constants";
import type { PendingReportRecord } from "./types";

function openOfflineDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this environment."));
      return;
    }

    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(OFFLINE_STORE_NAME)) {
        database.createObjectStore(OFFLINE_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Unable to open offline database."));
  });
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openOfflineDatabase().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(OFFLINE_STORE_NAME, mode);
        const store = transaction.objectStore(OFFLINE_STORE_NAME);
        const request = callback(store);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () =>
          reject(request.error ?? new Error("Offline database operation failed."));

        transaction.oncomplete = () => database.close();
        transaction.onerror = () =>
          reject(transaction.error ?? new Error("Offline database transaction failed."));
      })
  );
}

export async function getAllPendingReports(): Promise<PendingReportRecord[]> {
  return runTransaction("readonly", (store) => store.getAll());
}

export async function getPendingReport(
  id: string
): Promise<PendingReportRecord | undefined> {
  return runTransaction("readonly", (store) => store.get(id));
}

export async function putPendingReport(
  record: PendingReportRecord
): Promise<void> {
  await runTransaction("readwrite", (store) => store.put(record));
}

export async function deletePendingReport(id: string): Promise<void> {
  await runTransaction("readwrite", (store) => store.delete(id));
}
