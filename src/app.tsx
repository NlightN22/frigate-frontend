import * as Routes from './routes';
import { h } from 'preact';
import ActivityIndicator from './components/ActivityIndicator';
import AsyncRoute from 'preact-async-route';
import Cameras from './routes/Cameras';
import LoginPage from './routes/LoginPage';
import LogoutPage from './routes/LogoutPage';
import { Router } from 'preact-router';
import Sidebar from './Sidebar';
import { DarkModeProvider, DrawerProvider } from './context';
import useSWR from 'swr';
import { useCallback, useEffect, useState } from 'preact/hooks';
import axios, { AxiosError } from 'axios';
import { baseUrl } from "./api/baseUrl";
import AppBar from './AppBar';

export default function App() {

  const client = axios.create({ baseURL: `${baseUrl}`, timeout: 20000, withCredentials: true })
  const fetcher = (path: any, params?: any) => {
    return client.get(path, { params }).then((res) => res.data)
  }

  const [access, setAccess] = useState<'load' | 'true' | 'false'>('load')
  const [logout, setLogout] = useState(false)

  const handleLogout = () => {
    setLogout(true)
  }

  useEffect(() => {
    axios.create({ baseURL: `${baseUrl}`, timeout: 20000, withCredentials: true })
      .get('auth/status')
      .then((res) => {
        console.log("res.data:", res.data)
        console.log("res.status", res.status)
        if (res.status === 200) {
          console.log(res.data)
          if (res.data) setAccess('true')
          else setAccess('false')
        }
      })
      .catch((e) => {
        if (e instanceof AxiosError) {
          console.error(e)
          if (e.code === "ERR_BAD_REQUEST" && e.response?.status === 403) { //403
            setAccess('false')
          }
        }
      })
  })

  useEffect(() => {
    console.log("access:", access)
  }, [access])
  useEffect(() => {
    console.log("logout:", logout)
  }, [logout])

  const { data: config } = useSWR('config');

  return (
    logout == true ?
      <LoginPage logout="true" />
      :
      access === 'load' ?
        <div className="flex flex-grow-1 min-h-screen justify-center items-center">
          <ActivityIndicator />
        </div>
        :
        access == 'false' ?
          <LoginPage />
          :
          <DarkModeProvider>
            <DrawerProvider>
              <div data-testid="app" className="w-full">
                <AppBar onLogout={handleLogout} />
                {!config ? (
                  <div className="flex flex-grow-1 min-h-screen justify-center items-center">
                    <ActivityIndicator />
                  </div>
                ) : (
                  <div className="flex flex-row min-h-screen w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    <Sidebar />
                    <div className="w-full flex-auto mt-16 min-w-0">
                      <Router>
                        <AsyncRoute path="/cameras/:camera/editor" getComponent={Routes.getCameraMap} />
                        <AsyncRoute path="/cameras/:camera" getComponent={Routes.getCamera} />
                        <AsyncRoute path="/birdseye" getComponent={Routes.getBirdseye} />
                        <AsyncRoute path="/events" getComponent={Routes.getEvents} />
                        <AsyncRoute path="/exports" getComponent={Routes.getExports} />
                        <AsyncRoute
                          path="/recording/:camera/:date?/:hour?/:minute?/:second?"
                          getComponent={Routes.getRecording}
                        />

                        <AsyncRoute path="/storage" getComponent={Routes.getStorage} />
                        <AsyncRoute path="/system" getComponent={Routes.getSystem} />
                        <AsyncRoute path="/config" getComponent={Routes.getConfig} />
                        <AsyncRoute path="/logs" getComponent={Routes.getLogs} />
                        <AsyncRoute path="/styleguide" getComponent={Routes.getStyleGuide} />
                        <AsyncRoute path="/acl" getComponent={Routes.getAccessList} />
                        <Cameras default path="/" />
                      </Router>
                    </div>
                  </div>
                )}
              </div>
            </DrawerProvider>
          </DarkModeProvider>
  );
};
