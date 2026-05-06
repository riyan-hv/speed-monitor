// VpnImpactRow — one row per device, comparing avg speeds VPN on vs off
export interface VpnImpactRow {
  device_id: string
  hostname: string | null
  // null when the device only has data for one VPN state
  on_download: number | null   // avg download Mbps when VPN connected
  on_upload: number | null
  on_latency: number | null
  off_download: number | null  // avg download Mbps when VPN disconnected
  off_upload: number | null
  off_latency: number | null
  // delta = off_download - on_download (positive = VPN reduces speed)
  // null when either on_download or off_download is null
  delta_download: number | null
}

// SsidRow — one row per unique SSID
export interface SsidRow {
  ssid: string
  device_count: number         // number of unique devices seen on this SSID
  avg_download: number | null  // avg download Mbps across all tests on this SSID
  avg_upload: number | null
  avg_latency: number | null
}

// DowRow — one row per day Mon-Sun (7 entries always returned)
export interface DowRow {
  day: string          // 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  avg_download: number | null  // null if no data for this day in window
}
