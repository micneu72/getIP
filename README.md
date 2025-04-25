# getIP
With this script, you automatically update the DNS entry for your dedyn.io host (desec.io), receive an HTML table with your IP data, DNS entries, and a log output. This gives you a nicely formatted, immediately usable overview in the iOS app Scriptable.

## Installation and Configuration of the **getIP.js** Script for Scriptable

This document describes step by step how to install and configure a JavaScript script (e.g., for DynDNS/IP queries) in Scriptable on iOS.

---

### 1. Store Script in iCloud Drive

1. **Find Folder**  
   Open your **iCloud Drive** (via the Files app on iPhone/iPad or through [icloud.com](https://icloud.com) in browser).

2. **`Scriptable` Directory**  
   Navigate to the `Scriptable` folder. This is automatically monitored by the Scriptable app.

3. **Upload File**  
   Place your script as a `.js` file in this folder. In our example, it's called **`getIP.js`**.  
   - Alternatively, you can copy the script to any folder and import it into Scriptable later.  
   - If you only have access to a PC/Mac while on the go, you can also upload the script via [icloud.com](https://icloud.com).

---

### 2. Display Script in Scriptable

1. **Open Scriptable App**  
   Launch the **Scriptable app** on your iPhone or iPad.

2. **Automatic Synchronization**  
   Wait a moment for the iCloud synchronization to complete.  
   - All scripts in the iCloud folder `Scriptable` are automatically listed in the app.

3. **Select Script**  
   Tap the name **`getIP.js`** to open the source code in Scriptable.

---

### 3. Adjust Variables

In some scripts (e.g., for DynDNS) you need to adjust **hostname** and/or **token** before running:

1. **Edit Source Code**  
   Scroll to the section where your variables are defined. Example:
   ```js
   let domain = "your_domain";          // <-- adjust!
   let subname = "your_host";               // <-- adjust!
   let dedynToken = "my_super_TOKEN";    // <-- your Token!
