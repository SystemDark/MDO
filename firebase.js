import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  set,
  update,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCUNjxXY7-qq961qv0MudKgCcrMchVVzQQ",
  authDomain: "mdo-acro.firebaseapp.com",
  databaseURL: "https://mdo-acro-default-rtdb.firebaseio.com",
  projectId: "mdo-acro",
  storageBucket: "mdo-acro.firebasestorage.app",
  messagingSenderId: "957477543792",
  appId: "1:957477543792:web:8009e8d70c2cc4e295f9b5",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, push, set, update, onValue, remove };
