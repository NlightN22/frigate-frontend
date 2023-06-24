export const ENV = import.meta.env.MODE;
let url = import.meta.env.VITE_ACL_URL;
if (!url.endsWith('/')) {
    url = url.replace(/\/?$/, '/');
  }
export const API_HOST = url
