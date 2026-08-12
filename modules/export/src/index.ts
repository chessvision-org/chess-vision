export type ExportFormat = 'png' | 'jpeg' | 'svg';

export interface ExportOptions {
  format: ExportFormat;
  dpi: number;
  width: number;
  height: number;
  transparent: boolean;
  flipped: boolean;
}

export interface ExportPreset {
  name: string;
  dpi: number;
  width: number;
  height: number;
  label: string;
}

export const EXPORT_PRESETS: ExportPreset[] = [
  {
    name: 'screen',
    dpi: 72,
    width: 480,
    height: 480,
    label: 'Screen (72 DPI)'
  },
  { name: 'hd', dpi: 150, width: 800, height: 800, label: 'HD (150 DPI)' },
  {
    name: 'print',
    dpi: 300,
    width: 1600,
    height: 1600,
    label: 'Print (300 DPI)'
  },
  {
    name: 'high',
    dpi: 600,
    width: 3200,
    height: 3200,
    label: 'High (600 DPI)'
  },
  { name: 'max', dpi: 1200, width: 6400, height: 6400, label: 'Max (1200 DPI)' }
];

export function defaultExportOptions(): ExportOptions {
  return {
    format: 'png',
    dpi: 72,
    width: 480,
    height: 480,
    transparent: false,
    flipped: false
  };
}
