import bcrypt from 'bcryptjs'
import { supabaseAdmin } from './admin'

export interface ApiKeyPayload {
  deviceId: string
}

/**
 * Validates the X-Api-Key header against device_api_keys table.
 * Returns { deviceId } if valid, null if invalid/missing.
 *
 * Header format: "X-Api-Key: <device_id>:<plaintext_api_key>"
 *
 * The provision endpoint (/api/ingest/provision) returns { device_id, api_key } once.
 * The macOS client (speed_monitor.sh) stores both values and concatenates them with ':'
 * before sending: X-Api-Key: <device_id>:<api_key>
 *
 * Uses bcrypt.compare for constant-time comparison (prevents timing attacks).
 * Updates last_used_at on successful validation (fire-and-forget, does not fail ingest).
 *
 * IMPORTANT: Uses supabaseAdmin (service_role) — device_api_keys has RLS enabled with
 * no policies. Only the service_role key can read from this table by design.
 */
export async function validateApiKey(request: Request): Promise<ApiKeyPayload | null> {
  const apiKey = request.headers.get('X-Api-Key')
  if (!apiKey) return null

  // Parse the "deviceId:plaintextKey" format
  const colonIdx = apiKey.indexOf(':')
  if (colonIdx === -1) return null

  const deviceId = apiKey.substring(0, colonIdx)
  const plainKey = apiKey.substring(colonIdx + 1)

  if (!deviceId || !plainKey) return null

  // Fetch all active (non-revoked) keys for this device.
  // Lookup by device_id avoids a full table scan on every ingest request.
  // In practice there will be exactly 1 active key per device; limit(5) handles
  // edge cases during key rotation.
  const { data, error } = await supabaseAdmin
    .from('device_api_keys')
    .select('id, key_hash')
    .eq('device_id', deviceId)
    .eq('revoked', false)
    .limit(5)

  if (error || !data || data.length === 0) return null

  // Try each active key (handles edge case of multiple active keys during rotation)
  for (const row of data) {
    const valid = await bcrypt.compare(plainKey, row.key_hash)
    if (valid) {
      // Update last_used_at: best-effort, fire-and-forget.
      // Ingest MUST NOT fail if this update errors (e.g. transient DB issue).
      supabaseAdmin
        .from('device_api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', row.id)
        .then(() => {})
        .catch(() => {})

      return { deviceId }
    }
  }

  return null
}
