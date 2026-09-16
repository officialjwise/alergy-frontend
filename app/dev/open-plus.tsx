import { Redirect } from 'expo-router';
import { useEffect } from 'react';

import { usePlusMenuStore } from '@/store/plusMenuStore';

/** Developer helper: `allergyapp://dev/open-plus` lands on Home with the plus menu open. */
export default function OpenPlusMenu() {
  const setOpen = usePlusMenuStore((state) => state.setOpen);
  useEffect(() => {
    const timeout = setTimeout(() => setOpen(true), 400);
    return () => clearTimeout(timeout);
  }, [setOpen]);
  return <Redirect href="/(tabs)/home" />;
}
