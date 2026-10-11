import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  fetchPrayerTimes, 
  getTodayPrayer, 
  reverseGeocodeGPS 
} from '../../lib/prayer/prayer-api';
import { 
  checkAndTriggerNotifications, 
  getCurrentTimeInLocation 
} from '../../lib/prayer/prayer-notification';
import { getActivePrayerLocation } from '../../lib/prayer/prayer-location-manager';
import { PrayerSchedule } from '../../types';

export const GlobalPrayerWatcher: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [schedule, setSchedule] = useState<PrayerSchedule | null>(null);
  const isDetectingRef = useRef(false);

  // Auto-detect GPS location if enabled in settings
  useEffect(() => {
    if (settings.prayer_auto_location && 'geolocation' in navigator && !isDetectingRef.current) {
      isDetectingRef.current = true;
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const loc = await reverseGeocodeGPS(latitude, longitude);

            if (
              loc.provinsi !== settings.prayer_provinsi ||
              loc.kabkota !== settings.prayer_kabkota ||
              !settings.prayer_lat
            ) {
              await updateSettings({
                ...settings,
                prayer_provinsi: loc.provinsi,
                prayer_kabkota: loc.kabkota,
                prayer_lat: latitude,
                prayer_lon: longitude,
                prayer_location_name: loc.locationName,
                prayer_timezone_label: loc.timezoneLabel,
                prayer_auto_location: true,
              });
            }
          } catch (e) {
            console.warn('Auto GPS prayer detection error:', e);
          } finally {
            isDetectingRef.current = false;
          }
        },
        (err) => {
          console.warn('Geolocation permission not granted or timeout:', err.message);
          isDetectingRef.current = false;
        },
        { timeout: 8000, enableHighAccuracy: false }
      );
    }
  }, [settings.prayer_auto_location]);

  // Load prayer schedule with exact GPS coordinates & timezone awareness
  const loadSchedule = async () => {
    try {
      const activeLoc = getActivePrayerLocation(settings);
      const tzLabel = activeLoc.timezoneLabel || 'WIB';
      const today = getCurrentTimeInLocation(tzLabel);
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      const schedules = await fetchPrayerTimes(
        activeLoc.provinsi,
        activeLoc.kabkota,
        month,
        year,
        activeLoc.lat,
        activeLoc.lon
      );

      const todaySchedule = getTodayPrayer(schedules, today);
      if (todaySchedule) {
        setSchedule(todaySchedule);
      }
    } catch (err) {
      console.warn('Failed to load global prayer schedule:', err);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [
    settings.prayer_provinsi,
    settings.prayer_kabkota,
    settings.prayer_lat,
    settings.prayer_lon,
    settings.prayer_timezone_label,
  ]);

  // Listen to manual location updates
  useEffect(() => {
    const handleLocationUpdate = () => {
      loadSchedule();
    };
    window.addEventListener('koperasi_prayer_location_updated', handleLocationUpdate);
    return () => {
      window.removeEventListener('koperasi_prayer_location_updated', handleLocationUpdate);
    };
  }, [settings]);

  // Every second check prayer notifications & handle date rollover
  useEffect(() => {
    const interval = setInterval(() => {
      const tzLabel = schedule?.timezone_label || settings.prayer_timezone_label || 'WIB';
      const currentTime = getCurrentTimeInLocation(tzLabel);

      if (schedule && schedule.tanggal_lengkap) {
        const year = currentTime.getFullYear();
        const month = String(currentTime.getMonth() + 1).padStart(2, '0');
        const day = String(currentTime.getDate()).padStart(2, '0');
        const targetDate = `${year}-${month}-${day}`;

        if (targetDate !== schedule.tanggal_lengkap) {
          loadSchedule();
        } else {
          checkAndTriggerNotifications(schedule, settings);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [schedule, settings]);

  return null;
};
