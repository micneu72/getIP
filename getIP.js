// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: magic;

//--------------------------------------------------
// 1) Verbesserte IP-Validierung
//--------------------------------------------------
function isIPv4(ip) {
  // Verbesserte IPv4-Prüfung mit Bereichsvalidierung
  let ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;
  
  // Zusätzliche Prüfung der Zahlenbereiche (0-255)
  return ip.split('.').every(num => {
    let n = parseInt(num);
    return n >= 0 && n <= 255;
  });
}

function isIPv6(ip) {
  // Präzisere IPv6-Validierung
  const ipv6Regex = /^(?:(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,7}:|(?:[0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,5}(?::[0-9A-Fa-f]{1,4}){1,2}|(?:[0-9A-Fa-f]{1,4}:){1,4}(?::[0-9A-Fa-f]{1,4}){1,3}|(?:[0-9A-Fa-f]{1,4}:){1,3}(?::[0-9A-Fa-f]{1,4}){1,4}|(?:[0-9A-Fa-f]{1,4}:){1,2}(?::[0-9A-Fa-f]{1,4}){1,5}|[0-9A-Fa-f]{1,4}:(?:(?::[0-9A-Fa-f]{1,4}){1,6})|:(?:(?::[0-9A-Fa-f]{1,4}){1,7}|:))$/;
  return ipv6Regex.test(ip);
}

//--------------------------------------------------
// 2) Verbesserte IP-Abfrage
//--------------------------------------------------
async function getPublicIPs() {
  const services = [
    "https://ip.micneu.de?format=json",
    "https://api.ipify.org?format=json",
    "https://api64.ipify.org?format=json"
  ];
  
  let ips = { ipv4: null, ipv6: null };
  
  for (let service of services) {
    try {
      let req = new Request(service);
      let result = await req.loadJSON();
      let ip = result.ip;
      
      if (isIPv4(ip)) ips.ipv4 = ip;
      if (isIPv6(ip)) ips.ipv6 = ip;
      
      if (ips.ipv4 && ips.ipv6) break;
    } catch (e) {
      console.log(`Fehler bei ${service}: ${e}`);
    }
  }
  
  return ips;
}

//--------------------------------------------------
// 3) DNS-Abfragen
//--------------------------------------------------
async function getARecord_desec(domain, subname, token) {
  let url = `https://desec.io/api/v1/domains/${domain}/rrsets/${subname}/A/`;
  let req = new Request(url);
  req.headers = { "Authorization": "Token " + token };
  let json = await req.loadJSON();
  if (json && json.records && json.records.length > 0) {
    return json.records[0];
  }
  return null;
}

async function getAAAARecord_desec(domain, subname, token) {
  let url = `https://desec.io/api/v1/domains/${domain}/rrsets/${subname}/AAAA/`;
  let req = new Request(url);
  req.headers = { "Authorization": "Token " + token };
  let json = await req.loadJSON();
  if (json && json.records && json.records.length > 0) {
    return json.records[0];
  }
  return null;
}


//--------------------------------------------------
// 4) dedyn.io-Update-Funktion
//--------------------------------------------------
async function updateDedyn(hostname, ipv4, ipv6, token) {
  let baseUrl = "https://update.dedyn.io/?hostname=" + hostname;
  let updateType = "";
  
  if (ipv4 && ipv6) {
    baseUrl += `&myipv4=${ipv4}&myipv6=${ipv6}`;
    updateType = "IPv4 + IPv6";
  } else if (ipv4) {
    baseUrl += `&myipv4=${ipv4}&myipv6=no`;
    updateType = "nur IPv4";
  } else if (ipv6) {
    baseUrl += `&myipv4=no&myipv6=${ipv6}`;
    updateType = "nur IPv6";
  } else {
    throw new Error("Weder IPv4 noch IPv6 - kein Update möglich.");
  }

  let req = new Request(baseUrl);
  req.headers = {
    "Authorization": "Token " + token
  };
  let response = await req.loadString();
  return { response, updateType };
}

//--------------------------------------------------
// 5) Haupt-Skript
//--------------------------------------------------
(async () => {
  // 5.1) Konfiguration
  let domain = "your_domain.de";          // <-- adjust!
  let subname = "your_host";               // <-- adjust!
  let dedynToken = "my_super_TOKEN";    // <-- your Token!
  // don't touch this:
  let kodihost = `${subname}.${domain}`;  // your_host.your_domain.de

  try {
    // 5.2) IPs abrufen
    let myIPs = await getPublicIPs();
    
    if (!myIPs.ipv4 && !myIPs.ipv6) {
      throw new Error("Keine gültige IP gefunden!");
    }

    // 5.3) DNS-Einträge abfragen
    let currentARecord = await getARecord_desec(domain, subname, dedynToken);
    let currentAAAARecord = await getAAAARecord_desec(domain, subname, dedynToken);

    // 5.4) Vergleichen und ggf. Update durchführen
    let updateNeeded = false;
    let updateType = "";
    let updateResponse = "";

    if (
      (myIPs.ipv4 && myIPs.ipv4 !== currentARecord) ||
      (myIPs.ipv6 && myIPs.ipv6 !== currentAAAARecord)
    ) {
      updateNeeded = true;
      // Update durchführen
      let updateResult = await updateDedyn(
        kodihost,
        myIPs.ipv4,
        myIPs.ipv6,
        dedynToken
      );
      updateType = updateResult.updateType;
      updateResponse = updateResult.response;
    } else {
      updateType = "Kein Update nötig";
      updateResponse = "Die öffentlichen IP-Adressen stimmen bereits mit den DNS-Einträgen überein. Es wurde kein Update durchgeführt.";
    }

    // 5.5) HTML für WebView
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>dedyn.io Update</title>
      <style>
        body { font-family: -apple-system, sans-serif; margin: 20px; background-color: #f5f5f7;}
        h2 { margin-bottom: 0.5em; color: #1d1d1f;}
        table { border-collapse: collapse; width: 100%; max-width: 600px; margin-bottom: 1em; background-color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;}
        th, td { border: 1px solid #e5e5e5; padding: 12px; text-align: left; font-size: 14px;}
        th { background: #f8f8f8; font-weight: 600;}
        .resp { white-space: pre-wrap; background: white; border-radius: 8px; padding: 15px; font-family: monospace; font-size: 13px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-top: 15px;}
        .update-type { color: #2c5282; font-weight: bold;}
        .status-header { font-weight: 600; margin-top: 20px; color: #1d1d1f;}
      </style>
    </head>
    <body>
      <h2>dedyn.io Update Ergebnis</h2>
      <table>
        <tr><th>Feld</th><th>Wert</th></tr>
        <tr><td>Hostname</td><td>${kodihost}</td></tr>
        <tr><td>IPv4</td><td>${myIPs.ipv4 || "nicht verfügbar"}</td></tr>
        <tr><td>IPv6</td><td>${myIPs.ipv6 || "nicht verfügbar"}</td></tr>
        <tr><td>A-Record (DNS)</td><td>${currentARecord || "n/a"}</td></tr>
        <tr><td>AAAA-Record (DNS)</td><td>${currentAAAARecord || "n/a"}</td></tr>
        <tr><td>Update-Typ</td><td class="update-type">${updateType}</td></tr>
      </table>
      <div class="status-header">dedyn.io-Antwort:</div>
      <div class="resp">${updateResponse}</div>
    </body>
    </html>
    `;

  // 5.6) WebView anzeigen
  let wv = new WebView();
  await wv.loadHTML(html);
  await wv.present();


  } catch (error) {
    console.error(error);
    let alert = new Alert();
    alert.title = "Fehler";
    alert.message = error.message;
    await alert.present();
  }
})();
