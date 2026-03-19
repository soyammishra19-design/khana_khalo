const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xxozmtppeishwmtsuzvu.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_CmqG-IpMSK8pox_Z0sDXyg_Z1SlR8i7';

const supabaseFetch = async (path, options = {}) => {
    // If query params are already in path, we just append or use them directly
    const url = `${SUPABASE_URL}/rest/v1/${path}`;
    
    // We add Prefer: return=representation so POST/PATCH return the row data
    const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...(options.headers || {})
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase Error: ${errorText}`);
    }
    
    return response.json();
};

module.exports = { supabaseFetch };
