import type { IconName } from '@/components/ui';
import type { ScanMode } from '@/types';

export interface ScanModeConfig {
  key: ScanMode;
  labelKey: string;
  hintKey: string;
  helpKey: string;
  icon: IconName;
}

/** The four scanner modes in tile order. */
export const SCAN_MODES: readonly ScanModeConfig[] = [
  {
    key: 'food',
    labelKey: 'scan.modeFood',
    hintKey: 'scan.hintFood',
    helpKey: 'scan.helpFoodBody',
    icon: 'scan',
  },
  {
    key: 'barcode',
    labelKey: 'scan.modeBarcode',
    hintKey: 'scan.hintBarcode',
    helpKey: 'scan.helpBarcodeBody',
    icon: 'barcode',
  },
  {
    key: 'label',
    labelKey: 'scan.modeLabel',
    hintKey: 'scan.hintLabel',
    helpKey: 'scan.helpLabelBody',
    icon: 'document',
  },
  {
    key: 'menu',
    labelKey: 'scan.modeMenu',
    hintKey: 'scan.hintMenu',
    helpKey: 'scan.helpMenuBody',
    icon: 'menu',
  },
];

export function isScanMode(value: unknown): value is ScanMode {
  return SCAN_MODES.some((mode) => mode.key === value);
}

/** Zoom presets shown as pills; `lens` names the ultra wide lens when the device has one. */
export type ZoomLevel = '0.5' | '1' | '2';

export const ZOOM_LEVELS: readonly { key: ZoomLevel; label: string; zoom: number }[] = [
  { key: '0.5', label: '.5x', zoom: 0 },
  { key: '1', label: '1x', zoom: 0 },
  { key: '2', label: '2x', zoom: 0.08 },
];

export const ULTRA_WIDE_LENS_PATTERN = /ultra.?wide/i;
