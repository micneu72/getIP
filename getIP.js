// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: magic;
//--------------------------------------------------
// 1) Einfachere Regex-Funktionen zum Prüfen von IPv4 / IPv6
//--------------------------------------------------
function isIPv4(ip) {
  // Prüft grob, ob die IP aus vier Zahlenblöcken (je 1–3 Ziffern) besteht
  let ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipv4Regex.test(ip);
}

function isIPv6(ip) {
  // Vereinfacht: Enthält Doppelpunkt und nur [0-9A-Fa-f:]
  return /^[0-9A-Fa-f:]+$/.test(ip) && ip.includes(":");
}

//--------------------------------------------------
// 2) DNS-Abfragen (optional, wenn du Host-Einträge sehen willst)
//--------------------------------------------------
async function getARecord(hostname) {
  let url = `https://dns.google/resolve?name=${hostname}&type=A`;
  let req = new Request(url);
  let json = await req.loadJSON();
  
  if (json.Answer && json.Answer.length > 0) {
    // Erster Eintrag
    return json.Answer[0].data;
  } else {
    return null;  // Kein A-Record gefunden
  }
}

async function getAAAARecord(hostname) {
  let url = `https://dns.google/resolve?name=${hostname}&type=AAAA`;
  let req = new Request(url);
  let json = await req.loadJSON();
  
  if (json.Answer && json.Answer.length > 0) {
    return json.Answer[0].data;
  } else {
    return null;  // Kein AAAA-Record gefunden
  }
}

//--------------------------------------------------
// 3) dedyn.io-Update-Funktion
//--------------------------------------------------
async function updateDedyn(hostname, ipv4, ipv6, token) {
  // URL je nach vorhandener IP bauen
  let baseUrl = "https://update.dedyn.io/?hostname=" + hostname;
  if (ipv4 && ipv6) {
    baseUrl += `&myipv4=${ipv4}&myipv6=${ipv6}`;
  } else if (ipv4) {
    baseUrl += `&myipv4=${ipv4}&myipv6=no`;
  } else if (ipv6) {
    baseUrl += `&myipv4=no&myipv6=${ipv6}`;
  } else {
    throw new Error("Weder IPv4 noch IPv6 - kein Update möglich.");
  }

  let req = new Request(baseUrl);
  req.headers = {
    "Authorization": "Token " + token
  };
  // dedyn.io gibt Text zurück
  let resp = await req.loadString();
  return resp;
}

//--------------------------------------------------
// 4) Haupt-Skript
//--------------------------------------------------
(async () => {
  // 4.1) Hier deine dedyn.io-Daten anpassen
  let kodihost = "meinhost.dedyn.io";  // <-- anpassen!
  let dedynToken = "MEIN_SUPER_TOKEN"; // <-- deinen Token eintragen!

  try {
    // 4.2) Eigene öffentliche IP abrufen
    let reqMyIP = new Request("https://ip.micneu.de?format=json");
    let resultMyIP = await reqMyIP.loadJSON();
    let myPublicIP = resultMyIP.ip; // z.B. "203.0.113.45" (IPv4) oder "2001:db8::1" (IPv6)

    // 4.3) Prüfen, ob du IPv4 oder IPv6 hast
    let haveIPv4 = isIPv4(myPublicIP);
    let haveIPv6 = isIPv6(myPublicIP);

    // 4.4) DNS-Einträge deines dedyn.io-Hosts abfragen (optional)
    let currentARecord = await getARecord(kodihost);
    let currentAAAARecord = await getAAAARecord(kodihost);

    // 4.5) dedyn.io-Update durchführen
    let updateResp;
    if (haveIPv4 && haveIPv6) {
      // (In der Praxis erhältst du oft nur *eine* IP von ip.micneu.de,
      //  aber hier die Logik für beide.)
      updateResp = await updateDedyn(kodihost, myPublicIP, myPublicIP, dedynToken);
    } else if (haveIPv4) {
      updateResp = await updateDedyn(kodihost, myPublicIP, null, dedynToken);
    } else if (haveIPv6) {
      updateResp = await updateDedyn(kodihost, null, myPublicIP, dedynToken);
    } else {
      throw new Error("Keine gültige IP. Weder IPv4 noch IPv6 erkannt.");
    }

    // 4.6) HTML-Tabelle für den WebView bauen
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>dedyn.io Update</title>
  <style>
    body { font-family: -apple-system, sans-serif; margin: 20px; }
    h2 { margin-bottom: 0.5em; }
    table {
      border-collapse: collapse;
      width: 100%;
      max-width: 600px;
      margin-bottom: 1em;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 8px;
      text-align: left;
      font-size: 14px;
    }
    th {
      background: #f0f0f0;
    }
    .resp {
      white-space: pre-wrap;
      background: #f9f9f9;
      border: 1px solid #ccc;
      padding: 10px;
      font-family: monospace;
      font-size: 13px;
    }
  </style>
</head>
<body>

<h2>dedyn.io Update Ergebnis</h2>
<table>
  <tr><th>Feld</th><th>Wert</th></tr>
  <tr><td>Hostname</td><td>${kodihost}</td></tr>
  <tr><td>Deine IP<:/td><td>${myPublicIP}</td></tr>
  <tr><td>A-Record</td><td>${currentARecord || "n/a"}</td></tr>
  <tr><td>AAAA-Record</td><td>${currentAAAARecord || "n/a"}</td></tr>
</table>

<div><strong>dedyn.io-Antwort:</strong></div>
<div class="resp">${updateResp}</div>

</body>
</html>
    `;

    // 4.7) WebView erstellen und HTML präsentieren
    let wv = new WebView();
    await wv.loadHTML(html);
    await wv.present(); // Vollbild-Ansicht

  } catch (error) {
    console.error(error);
    let alert = new Alert();
    alert.title = "Fehler";
    alert.message = error.message;
    await alert.present();
  }
})();