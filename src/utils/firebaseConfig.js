const { initializeApp } = require('@firebase/app');
const { getStorage } = require('@firebase/storage');

const firebaseConfig = {
  apiKey: 'AIzaSyDlVbPX772Vj-WqeO1EIvxCvWwjGiGod-I',
  authDomain: 'mychat-storage.firebaseapp.com',
  projectId: 'mychat-storage',
  storageBucket: 'mychat-storage.appspot.com',
  messagingSenderId: '1019883614431',
  appId: '1:1019883614431:web:ae3659d370b533bd06396a',
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

module.exports = storage;
