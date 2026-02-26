/**
 * Uygulamanın public URL'i (web).
 * Özel domain kullanıyorsanız .env içinde EXPO_PUBLIC_APP_URL tanımlayın
 * veya Netlify/Firebase Hosting ortam değişkeni olarak verin.
 */
export const APP_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_APP_URL) ||
  'https://bluecrew-app.netlify.app';
