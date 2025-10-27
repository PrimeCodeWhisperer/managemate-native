import { DeviceType, getDeviceTypeAsync } from "expo-device";
import { useEffect, useState } from 'react';
import { Platform } from "react-native";

export function useDeviceType() {
  const [isTablet, setIsTablet] = useState(false);
  const deviceTypeMap = {
    [DeviceType.UNKNOWN]: "unknown",
    [DeviceType.PHONE]: "phone",
    [DeviceType.TABLET]: "tablet",
    [DeviceType.DESKTOP]: "desktop",
    [DeviceType.TV]: "tv",
  };

  useEffect(() => {
    getDeviceTypeAsync().then((deviceType) => {
      if(deviceTypeMap[deviceType]==="tablet"&&Platform.OS==='ios'){ 
        setIsTablet(true)
    }else{setIsTablet(false)
    };
    });
  }, []);

  return { isTablet, isPhone: !isTablet };
}