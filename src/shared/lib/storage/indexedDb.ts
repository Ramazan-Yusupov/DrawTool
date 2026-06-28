const DATABASE_NAME = "drawtool-workspace";
const DATABASE_VERSION = 2;
const PROJECTS_STORE = "projects";
const WORKSPACE_META_STORE = "workspaceMeta";

type StoreName = typeof PROJECTS_STORE | typeof WORKSPACE_META_STORE;

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
        const store = database.createObjectStore(PROJECTS_STORE, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt");
      }

      if (!database.objectStoreNames.contains(WORKSPACE_META_STORE)) {
        database.createObjectStore(WORKSPACE_META_STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open IndexedDB"));
  });
}

async function getRecord<T>(storeName: StoreName, key: IDBValidKey) {
  const database = await openDrawToolDatabase();
  const transaction = database.transaction(storeName, "readonly");
  const request = transaction.objectStore(storeName).get(key);

  try {
    return (await requestToPromise(request)) as T | undefined;
  } finally {
    database.close();
  }
}

async function getAllRecords<T>(storeName: StoreName) {
  const database = await openDrawToolDatabase();
  const transaction = database.transaction(storeName, "readonly");
  const request = transaction.objectStore(storeName).getAll();

  try {
    return (await requestToPromise(request)) as T[];
  } finally {
    database.close();
  }
}

async function putRecord<T>(storeName: StoreName, record: T) {
  const database = await openDrawToolDatabase();
  const transaction = database.transaction(storeName, "readwrite");
  transaction.objectStore(storeName).put(record);

  try {
    await transactionToPromise(transaction);
  } finally {
    database.close();
  }
}

async function deleteRecord(storeName: StoreName, key: IDBValidKey) {
  const database = await openDrawToolDatabase();
  const transaction = database.transaction(storeName, "readwrite");
  transaction.objectStore(storeName).delete(key);

  try {
    await transactionToPromise(transaction);
  } finally {
    database.close();
  }
}

export async function replaceIndexedRecords<T>(storeName: StoreName, records: T[]) {
  const database = await openDrawToolDatabase();
  const transaction = database.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);
  store.clear();
  records.forEach((record) => store.put(record));

  try {
    await transactionToPromise(transaction);
  } finally {
    database.close();
  }
}

export function getIndexedRecord<T>(key: IDBValidKey) {
  return getRecord<T>(PROJECTS_STORE, key);
}

export function getAllIndexedRecords<T>() {
  return getAllRecords<T>(PROJECTS_STORE);
}

export function putIndexedRecord<T>(record: T) {
  return putRecord(PROJECTS_STORE, record);
}

export function deleteIndexedRecord(key: IDBValidKey) {
  return deleteRecord(PROJECTS_STORE, key);
}

export function replaceIndexedProjectRecords<T>(records: T[]) {
  return replaceIndexedRecords(PROJECTS_STORE, records);
}

export function getWorkspaceMetaRecord<T>(key: IDBValidKey) {
  return getRecord<T>(WORKSPACE_META_STORE, key);
}

export function putWorkspaceMetaRecord<T>(record: T) {
  return putRecord(WORKSPACE_META_STORE, record);
}

export function deleteWorkspaceMetaRecord(key: IDBValidKey) {
  return deleteRecord(WORKSPACE_META_STORE, key);
}
