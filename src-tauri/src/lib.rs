use std::collections::HashMap;
use std::net::IpAddr;
use std::sync::OnceLock;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tauri_plugin_http::reqwest;

/// Hosts allowed for the debug/test `proxy` command (aligned with DEFAULT_TAURI_BASE_URL).
const ALLOWED_API_HOSTS: &[&str] = &["template.geebosblog.com"];

const PROXY_CONNECT_TIMEOUT: Duration = Duration::from_secs(10);
const PROXY_TIMEOUT: Duration = Duration::from_secs(30);

static PROXY_CLIENT: OnceLock<reqwest::Client> = OnceLock::new();

fn proxy_client() -> Result<&'static reqwest::Client, String> {
    if let Some(client) = PROXY_CLIENT.get() {
        return Ok(client);
    }
    let client = reqwest::Client::builder()
        .connect_timeout(PROXY_CONNECT_TIMEOUT)
        .timeout(PROXY_TIMEOUT)
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|e| format!("proxy error: {e}"))?;
    Ok(PROXY_CLIENT.get_or_init(|| client))
}

fn is_blocked_host(host: &str) -> bool {
    if host.eq_ignore_ascii_case("metadata.google.internal") {
        return true;
    }
    if let Ok(ip) = host.parse::<IpAddr>() {
        match ip {
            IpAddr::V4(v4) => {
                let o = v4.octets();
                // Link-local 169.254.0.0/16
                if o[0] == 169 && o[1] == 254 {
                    return true;
                }
            }
            IpAddr::V6(v6) => {
                // Link-local fe80::/10
                let segments = v6.segments();
                if segments[0] & 0xffc0 == 0xfe80 {
                    return true;
                }
            }
        }
    }
    false
}

fn is_allowed_host(host: &str) -> bool {
    let host = host.to_ascii_lowercase();

    // Metadata / link-local literals are always rejected, even if listed.
    if is_blocked_host(&host) {
        return false;
    }

    if ALLOWED_API_HOSTS
        .iter()
        .any(|h| h.eq_ignore_ascii_case(&host))
    {
        return true;
    }

    #[cfg(debug_assertions)]
    {
        if host == "localhost" || host == "127.0.0.1" || host == "::1" {
            return true;
        }
    }

    false
}

fn validate_proxy_url(raw: &str) -> Result<(), String> {
    let parsed = reqwest::Url::parse(raw).map_err(|_| "proxy error: invalid url".to_string())?;

    match parsed.scheme() {
        "http" | "https" => {}
        _ => return Err("proxy error: scheme must be http or https".to_string()),
    }

    if !parsed.username().is_empty() || parsed.password().is_some() {
        return Err("proxy error: url must not include userinfo".to_string());
    }

    let host = parsed
        .host_str()
        .ok_or_else(|| "proxy error: missing host".to_string())?
        .to_ascii_lowercase();

    if !is_allowed_host(&host) {
        return Err(format!("proxy error: host not allowed: {host}"));
    }

    Ok(())
}

fn map_proxy_error(e: reqwest::Error) -> String {
    if e.is_timeout() {
        format!("proxy timeout: {e}")
    } else {
        format!("proxy error: {e}")
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProxyArgs {
    url: String,
    method: Option<String>,
    headers: Option<HashMap<String, String>>,
    body: Option<Vec<u8>>,
}

#[derive(Serialize)]
struct ProxyResponse {
    status: u16,
    /// Ordered header pairs; preserves multi-value headers (e.g. multiple Set-Cookie).
    headers: Vec<(String, String)>,
    body: Vec<u8>,
}

/// Transparent HTTP forwarder for the Test/debug page only.
///
/// Independent of plugin-http allowlist; enforced by this command's host allowlist.
/// The Test page is **not** a general-purpose open proxy — only configured API hosts
/// (and loopback in debug builds) are permitted. Redirects are not followed.
#[tauri::command]
async fn proxy(args: ProxyArgs) -> Result<ProxyResponse, String> {
    validate_proxy_url(&args.url)?;

    let method =
        reqwest::Method::from_bytes(args.method.unwrap_or_else(|| "GET".to_string()).as_bytes())
            .map_err(|e| format!("proxy error: {e}"))?;

    let client = proxy_client()?;
    let mut builder = client.request(method, &args.url);

    if let Some(headers) = args.headers {
        let mut map = reqwest::header::HeaderMap::new();
        for (k, v) in headers {
            let name = reqwest::header::HeaderName::from_bytes(k.as_bytes())
                .map_err(|e| format!("proxy error: {e}"))?;
            let value = reqwest::header::HeaderValue::from_str(&v)
                .map_err(|e| format!("proxy error: {e}"))?;
            map.append(name, value);
        }
        builder = builder.headers(map);
    }

    if let Some(body) = args.body {
        builder = builder.body(body);
    }

    let resp = builder.send().await.map_err(map_proxy_error)?;
    let status = resp.status().as_u16();

    let mut resp_headers: Vec<(String, String)> = Vec::new();
    for (k, v) in resp.headers() {
        if let Ok(val) = v.to_str() {
            resp_headers.push((k.as_str().to_string(), val.to_string()));
        }
    }

    let body = resp.bytes().await.map_err(map_proxy_error)?.to_vec();

    Ok(ProxyResponse {
        status,
        headers: resp_headers,
        body,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![proxy])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
