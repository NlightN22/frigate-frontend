import { h } from 'preact';
import { useRef, useEffect } from 'preact/hooks';
import videojs from 'video.js';
import 'videojs-playlist';
import 'video.js/dist/video-js.css';

export default function VideoPlayer({ children, options, seekOptions = { forward: 30, backward: 10 }, onReady = () => { }, onDispose = () => { } }) {
  const playerRef = useRef();

  useEffect(() => {
    const defaultOptions = {
      html5: {
        hls: {
          withCredentials: true
        }
      },
      controls: true,
      controlBar: {
        skipButtons: seekOptions,
      },
      playbackRates: [0.5, 1, 2, 4, 8],
      fluid: true,
    };


    if (!videojs.browser.IS_FIREFOX) {
      defaultOptions.playbackRates.push(16);
    }

    const player = videojs(playerRef.current, { ...defaultOptions, ...options }, () => {
      onReady(player);
    });

    // Allows player to continue on error
    player.reloadSourceOnError();

    // Disable fullscreen on iOS if we have children
    if (
      children &&
      videojs.browser.IS_IOS &&
      videojs.browser.IOS_VERSION > 9 &&
      !player.el_.ownerDocument.querySelector('.bc-iframe')
    ) {
      player.tech_.el_.setAttribute('playsinline', 'playsinline');
      player.tech_.supportsFullScreen = function () {
        return false;
      };
    }

    const screen = window.screen;

    const angle = () => {
      // iOS
      if (typeof window.orientation === 'number') {
        return window.orientation;
      }
      // Android
      if (screen && screen.orientation && screen.orientation.angle) {
        return window.orientation;
      }
      videojs.log('angle unknown');
      return 0;
    };

    const rotationHandler = () => {
      const currentAngle = angle();

      if (currentAngle === 90 || currentAngle === 270 || currentAngle === -90) {
        if (player.paused() === false) {
          player.requestFullscreen();
        }
      }

      if ((currentAngle === 0 || currentAngle === 180) && player.isFullscreen()) {
        player.exitFullscreen();
      }
    };

    if (videojs.browser.IS_IOS) {
      window.addEventListener('orientationchange', rotationHandler);
    } else if (videojs.browser.IS_ANDROID && screen.orientation) {
      // addEventListener('orientationchange') is not a user interaction on Android
      screen.orientation.onchange = rotationHandler;
    }

    return () => {
      if (videojs.browser.IS_IOS) {
        window.removeEventListener('orientationchange', rotationHandler);
      }
      player.dispose();
      onDispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div data-vjs-player>
      {/* Setting an empty data-setup is required to override the default values and allow video to be fit the size of its parent */}
      <video ref={playerRef} className="small-player video-js vjs-default-skin" data-setup="{}" controls playsinline />
      {children}
    </div>
  );
}