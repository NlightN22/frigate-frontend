import { useEffect } from 'preact/hooks';
import { baseUrl } from "../api/baseUrl";

const LoginPage = ({ logout }) => {
  useEffect(() => {
    if (logout) {
      sessionStorage.clear()
      window.location.href = `${baseUrl}auth/logout`
    } else {
      window.location.href = `${baseUrl}auth/login`
    }
  })
  return null
}

export default LoginPage