'use strict';

const div = document.querySelector('div.row.row-cols-1.row-cols-md-2.g-4')
const template = document.querySelector('template');
const form = document.querySelector('form');

form.addEventListener('submit', createNote);

/**
 * @typedef {object} Note - メモ
 * @property {number} [id] - ID
 * @property {string} title - タイトル
 * @property {string} body - 本文
 * @property {number} createdAt - 作成日
 */

/**
 * メモをデータベースに保存する
 * @param {SubmitEvent} event - submit イベント
 */
function createNote(event) {

  // フォームの送信を阻止する
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  /** @type {Note} */
  const note = {
    title: formData.get('title'),
    body: formData.get('body'),
    createdAt: Date.now()
  };

  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const request = store.add(note);

  request.addEventListener('success', function () {
    const key = this.result;
    note.id = key;
  });

  transaction.addEventListener('complete', function () {
    // メモをリストに追加する
    addNote(note);
  });

  transaction.addEventListener('abort', function () {
    if (this.error.name === 'QuotaExceededError') {
      alert('データベースの空き容量がありません。');
    }
  });

  // フォームをリセットする
  form.reset();
}

/**
 * メモをデータベースとリストから削除する
 * @param {MouseEvent} event - click イベント
 */
function deleteNote(event) {
  const button = event.currentTarget;
  const column = button.closest('.col');

  const id = column.dataset.id;

  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  store.delete(parseInt(id));

  transaction.addEventListener('complete', function () {
    column.remove();
  });
}

/**
 * メモをリストに追加する
 * @param {Note} note - メモ
 */
function addNote(note) {
  const clone = template.content.cloneNode(true);
  clone.querySelector('.col').dataset.id = note.id;
  clone.querySelector('.card-title').textContent = note.title || '無題';
  clone.querySelector('.card-text').textContent = note.body || '…';
  clone.querySelector('.btn').addEventListener('click', deleteNote);
  clone.querySelector('.text-muted').textContent = new Date(note.createdAt).toLocaleString({ timeZone: 'Asia/Tokyo' });
  div.appendChild(clone);
}