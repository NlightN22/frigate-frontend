import { h, Fragment } from 'preact';
import LinkedLogo from './components/LinkedLogo';
import { Match } from 'preact-router/match';
import { memo } from 'preact/compat';
import { ENV } from './env';
import { useMemo } from 'preact/hooks'
import useSWR from 'swr';
import NavigationDrawer, { Destination, Separator } from './components/NavigationDrawer';
import axios from 'axios';
import { baseUrl } from "./api/baseUrl";
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const [admin, setAdmin] = useState(false)
  const client = axios.create({ baseURL: `${baseUrl}`, timeout: 20000, withCredentials: true })
  const fetcher = (path, params) => {
    return client.get(path, { params }).then((res) => res.data)
  }
  const { data: roles } = useSWR('auth/roles', fetcher)
  useEffect( () => {
    if ( roles && roles.includes('admin')) setAdmin(true)
    else setAdmin(false)
    console.log('role admin:', admin )
  }, [roles])

  
  const { data: config } = useSWR('config');

  const sortedCameras = useMemo(() => {
    if (!config) {
      return [];
    }

    return Object.entries(config.cameras)
      .filter(([_, conf]) => conf.ui.dashboard)
      .sort(([_, aConf], [__, bConf]) => aConf.ui.order - bConf.ui.order);
  }, [config]);

  if (!config) {
    return null;
  }
  const { birdseye } = config;

  return (
    <NavigationDrawer header={<Header />}>
      <Destination href="/" text="Cameras" />
      <Match path="/cameras/:camera/:other?">
        {({ matches }) =>
          matches ? (
            <CameraSection sortedCameras={sortedCameras} />
          ) : null
        }
      </Match>
      <Match path="/recording/:camera/:date?/:hour?/:seconds?">
        {({ matches }) =>
          matches ? (
            <RecordingSection sortedCameras={sortedCameras} />
          ) : null
        }
      </Match>
      {birdseye?.enabled ? <Destination href="/birdseye" text="Birdseye" /> : null}
      <Destination href="/events" text="Events" />
      <Destination href="/exports" text="Exports" />
      {admin ? <Destination href="/acl" text="Access" /> : null }
      {admin ? <div>
      <Separator />
      <Destination href="/storage" text="Storage" />
      <Destination href="/system" text="System" />
      <Destination href="/config" text="Config" />
      <Destination href="/logs" text="Logs" />
      <Separator />
      </div>
      : null }
      <div className="flex flex-grow" />
      {ENV !== 'production' ? (
        <Fragment>
          <Destination href="/styleguide" text="Style Guide" />
          <Separator />
        </Fragment>
      ) : null}
      <Destination className="self-end" href="https://docs.frigate.video" text="Documentation" />
      <Destination className="self-end" href="https://github.com/blakeblackshear/frigate" text="GitHub" />
    </NavigationDrawer>
  );
}

function CameraSection({ sortedCameras }) {

  return (
    <Fragment>
      <Separator />
      {sortedCameras.map(([camera]) => (
        <Destination key={camera} href={`/cameras/${camera}`} text={camera.replaceAll('_', ' ')} />
      ))}
      <Separator />
    </Fragment>
  );
}

function RecordingSection({ sortedCameras }) {

  return (
    <Fragment>
      <Separator />
      {sortedCameras.map(([camera, _]) => {
        return (
          <Destination
            key={camera}
            path={`/recording/${camera}/:date?/:hour?/:seconds?`}
            href={`/recording/${camera}`}
            text={camera.replaceAll('_', ' ')}
          />
        );
      })}
      <Separator />
    </Fragment>
  );
}

const Header = memo(() => {
  return (
    <div className="text-gray-500">
      <LinkedLogo />
    </div>
  );
});