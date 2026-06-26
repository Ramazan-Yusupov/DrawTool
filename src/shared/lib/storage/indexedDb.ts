const DATABASE_NAME = "drawtool-workspace";
const DATABASE_VERSION = 1;
const PROJECTS_STORE = "projects";

function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionToPromise(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
  });
}

export function openDrawToolDatabase() {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.reject(new Error("IndexedDB is unavailable"));
  }

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(PROJECTS_STORE)) {
        const store = database.createObjectStore(PROJECTS_STORE, {
          keyPath: "id",
        });
        store.createIndex("updatedAt", "updatedAt");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open IndexedDB"));
  });
}

export async function getIndexedRecord<T>(key: IDBValidKey) {
  const database = await openDrawToolDatabase();
  const transaction = database.transaction(PROJECTS_STORE, "readonly");
  const request = transaction.objectStore(PROJECTS_STORE).get(key);

  try {
    return (await requestToPromise(request)) as T | undefined;
  } finally {
    database.close();
  }
}

export async function getAllIndexedRecords<T>() {
  const database = await openDrawToolDatabase();
  const transaction = database.transaction(PROJECTS_STORE, "readonly");
  const request = transaction.objectStore(PROJECTS_STORE).getAll();

  try {
    return (await requestToPromise(request)) as T[];
  } finally {
    database.close();
  }
}

export async function putIndexedRecord<T>(record: T) {
  const database = await openDrawToolDatabase();
  const transaction = database.transaction(PROJECTS_STORE, "readwrite");
  transaction.objectStore(PROJECTS_STORE).put(record);

  try {
    await transactionToPromise(transaction);
  } finally {
    database.close();
  }
}

export async function deleteIndexedRecord(key: IDBValidKey) {
  const database = await openDrawToolDatabase();
  const transaction = database.transaction(PROJECTS_STORE, "readwrite");
  transaction.objectStore(PROJECTS_STORE).delete(key);

  try {
    await transactionToPromise(transaction);
  } finally {
    database.close();
  }
}
