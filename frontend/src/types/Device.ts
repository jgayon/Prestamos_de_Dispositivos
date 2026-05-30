export type DeviceStatus = 'AVAILABLE' | 'LOANED' | 'MAINTENANCE';

export interface Device {
  id: string;
  name: string;
  status: DeviceStatus;
  createdAt?: string;
}

export interface CreateDeviceDTO {
  name: string;
}

export interface UpdateDeviceDTO {
  name?: string;
  status?: DeviceStatus;
}
