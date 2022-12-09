'use strict';

const DATABASE_VERSION = 1;
const DATABASE_NAME = 'notes';
const STORE_NAME = 'notes';

/** @type {IDBDatabase | null} */
let database = null;

window.addEventListener('load', function() {
  const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

  request.addEventListener('upgradeneeded', function() {
    const database = this.result;
    database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
  });

  request.addEventListener('success', function() {
    database = this.result;

    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    /** @type {Note[] | null} */
    let notes = null;

    request.addEventListener('success', function () {
      notes = this.result;
    });

    transaction.addEventListener('complete', function () {
      notes.forEach(addNote);
      console.table(notes);
    });
  });
});