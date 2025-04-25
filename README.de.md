# tippte

Mit diesem Skript aktualisieren Sie automatisch den DNS -Eintrag für Ihren Dedyn.io -Host (DESEC.IO) und erhalten eine HTML -Tabelle mit Ihren IP -Daten, DNS -Einträgen und einer Protokollausgabe. Dies gibt Ihnen einen schön formatierten, sofort verwendbaren Überblick im iOS -App -Skript.

## Installation und Konfiguration der**getip.js**Skript für skriptierbar

In diesem Dokument wird Schritt für Schritt beschrieben, wie Sie ein JavaScript -Skript (z. B. für DynDNS/IP -Abfragen) in scriptable auf iOS installieren und konfigurieren.

* * *

### 1. Speichern Sie das Skript im iCloud -Laufwerk

1.  **Ordner finden**  
    Öffne deine**iCloud Drive**(über die Dateien -App auf dem iPhone/iPad oder durch[icloud.com](https://icloud.com)im Browser).

2.  **`Scriptable`Verzeichnis**  
    Navigieren zum`Scriptable`Ordner. Dies wird automatisch von der skriptierbaren App überwacht.

3.  **Datei hochladen**  
    Platzieren Sie Ihr Skript als als`.js`Datei in diesem Ordner. In unserem Beispiel heißt es**`getIP.js`**.
    -   Alternativ können Sie das Skript in einen beliebigen Ordner kopieren und später in skriptierbar importieren.
    -   Wenn Sie unterwegs nur Zugriff auf einen PC/Mac haben[icloud.com](https://icloud.com).

* * *

### 2. Zeigen Sie das Skript in skriptierbar an

1.  **Öffnen Sie die skriptierbare App**  
    Starten Sie die**Skriptierbare App**Auf Ihrem iPhone oder iPad.

2.  **Automatische Synchronisation**  
    Warten Sie einen Moment, bis die iCloud -Synchronisation abgeschlossen ist.
    -   Alle Skripte im iCloud -Ordner`Scriptable`werden automatisch in der App aufgeführt.

3.  **Wählen Sie Skript**  
    Tippen Sie auf den Namen**`getIP.js`**So öffnen Sie den Quellcode in skriptierbar.

* * *

### 3. Einstellen Sie Variablen

In einigen Skripten (z. B. für DynDNs) müssen Sie sich anpassen**Hostname**und/oder**Token**Vor dem Laufen:

1.  **Quellcode bearbeiten**  
    Scrollen Sie zu dem Abschnitt, in dem Ihre Variablen definiert sind. Beispiel:
    ```js
    let domain = "your_domain";          // <-- adjust!
    let subname = "your_host";               // <-- adjust!
    let dedynToken = "my_super_TOKEN";    // <-- your Token!
    ```
