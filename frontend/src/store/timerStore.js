import { create } from 'zustand';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const useTimerStore = create((set, get) => ({
  isTracking: false,
  activeTask: '',
  startTime: null,
  elapsed: 0,
  intervalId: null,
  screenshotIntervalId: null,
  liveIntervalId: null,

  setActiveTask: (taskId) => set({ activeTask: taskId }),
  
  startTracking: async () => {
    const { activeTask } = get();
    if (!activeTask) {
      toast.error('Please select a task to start tracking');
      return;
    }

    try {
      let stream = null;
      let video = null;
      let imageCapture = null;
      let hasScreenshot = false;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
         toast.error('Screenshots disabled (HTTPS required). Tracking time only.');
      } else {
        try {
          // Request screenshot permission
          stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          // We will keep this stream active to capture frames without prompting again
          
          video = document.createElement('video');
          video.srcObject = stream;
          video.muted = true;
          video.playsInline = true;
          video.autoplay = true;
          
          // Do not append video to DOM to prevent any overlay/click issues
          
          await new Promise((resolve) => {
            video.onloadedmetadata = () => {
              video.play().then(resolve).catch(resolve);
            };
          });
          
          const track = stream.getVideoTracks()[0];
          imageCapture = window.ImageCapture ? new ImageCapture(track) : null;
          hasScreenshot = true;
        } catch (err) {
          console.error("Screenshot setup failed:", err);
          toast.error('Screenshot permission denied. Tracking time only.');
        }
      }

      const captureAndSend = async (endpoint, isLive = false) => {
        if (!hasScreenshot || !video) return;
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          let captured = false;

          if (imageCapture) {
            try {
              const bitmap = await imageCapture.grabFrame();
              canvas.width = bitmap.width;
              canvas.height = bitmap.height;
              ctx.drawImage(bitmap, 0, 0);
              captured = true;
            } catch (e) {
              console.warn('ImageCapture failed, falling back to video element', e);
            }
          }

          if (!captured && video.videoWidth > 0 && video.videoHeight > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            captured = true;
          }

          if (captured) {
            const dataUrl = canvas.toDataURL('image/jpeg', isLive ? 0.3 : 0.6);
            await axios.post(endpoint, { 
              [isLive ? 'frame' : 'imageUrl']: dataUrl,
              activeTask: get().activeTask 
            });
          } else {
            console.error("Could not capture frame.");
          }
        } catch (err) {
          console.error('Frame capture error:', err);
        }
      };

      let screenshotIntervalId = null;
      let liveIntervalId = null;

      if (hasScreenshot) {
        // Wait for the video frame to actually render
        setTimeout(() => {
          captureAndSend('/screenshots');
          captureAndSend('/live/frame', true);
        }, 1000);
        
        // Every 3 mins save screenshot
        screenshotIntervalId = setInterval(() => captureAndSend('/screenshots'), 3 * 60 * 1000);
        
        // Every 10 secs update live feed
        liveIntervalId = setInterval(() => captureAndSend('/live/frame', true), 10 * 1000);
      }
      
      const intervalId = setInterval(() => {
        set(state => ({ elapsed: state.elapsed + 1 }));
      }, 1000);

      set({
        isTracking: true,
        startTime: new Date(),
        intervalId,
        screenshotIntervalId,
        liveIntervalId,
        _stream: stream,
        _video: video 
      });
      toast.success(hasScreenshot ? 'Time tracking started' : 'Time tracking started (No screenshots)');

    } catch (err) {
      console.error(err);
      toast.error('Failed to start tracking.');
    }
  },

  stopTracking: async () => {
    const { intervalId, screenshotIntervalId, liveIntervalId, _stream, _video, activeTask, startTime, elapsed } = get();
    if (intervalId) clearInterval(intervalId);
    if (screenshotIntervalId) clearInterval(screenshotIntervalId);
    if (liveIntervalId) clearInterval(liveIntervalId);
    
    if (_stream) {
      _stream.getTracks().forEach(track => track.stop());
    }
    
    if (_video && _video.parentNode) {
      _video.parentNode.removeChild(_video);
    }

    // Save the time log
    try {
      if (activeTask && startTime) {
        await axios.post(`/work/${activeTask}/log`, {
          startTime,
          endTime: new Date(),
          duration: elapsed / 3600, // convert seconds to hours
          status: 'In Progress'
        });
      }
    } catch (err) {
      console.error('Failed to save time log:', err);
    }

    set({
      isTracking: false,
      elapsed: 0,
      activeTask: '',
      startTime: null,
      intervalId: null,
      screenshotIntervalId: null,
      liveIntervalId: null,
      _stream: null,
      _video: null
    });
    toast.success('Time tracking stopped & logged');
  }
}));

export default useTimerStore;
