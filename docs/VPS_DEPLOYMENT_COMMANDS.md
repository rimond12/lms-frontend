# 🚀 Ultimate Hostinger VPS Deployment Guide (A to Z)

# LMS_CORE

<!-- use admin
db.createUser({ user: "admin", pwd: "caddcore1991", roles: ["root"] })

db.createUser({ user: "caddcorelmsDB", pwd: "caddcore1991", roles: ["readWrite"] }) -->

**Status**: ✅ LIVE (IP Based Access)
**Server IP**: `72.61.254.219`
**Architecture**: Monorepo (Next.js + Express + MongoDB)

---

## ✅ Phase 0: Preparation (Do not skip)

1.  **GitHub**: Ensure your Backend and Frontend codes are pushed to GitHub.
2.  **Domain**: Decide on your domains (e.g., `caddcore.com` for frontend, `api.caddcore.com` for backend).
3.  **SSH**: Have your VPS IP and logic credentials ready.

---

## 🔹 Step 1: Login & Secure Server

_Goal: Update the server and set up a firewall for security._

1.  **Login to VPS** (Run on your local computer):
    ```bash
    ssh root@<YOUR_VPS_IP>
    ```
2.  **Update System**:
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```
3.  **Install Essentials**:
    ```bash
    sudo apt install -y curl git ufw vim unzip build-essential
    ```
4.  **Setup Firewall (Security)**:
    ```bash
    sudo ufw allow OpenSSH
    sudo ufw allow 80
    sudo ufw allow 443
    sudo ufw allow 27017  # MongoDB Remote
    sudo ufw --force enable
    ```

---

## 🔹 Step 2: Install Node.js & PM2

_Goal: Install the runtime environment for your apps._

1.  **Install Node.js v20 (LTS)**:
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    ```
2.  **Verify**:
    ```bash
    node -v  # Should show v20.x.x
    npm -v
    ```
3.  **Install PM2 (Process Manager)**:
    ```bash
    sudo npm install -g pm2
    ```

---

## 🔹 Step 3: Install & Secure MongoDB (Local Database)

_Goal: Run the database on the same server safely._

1.  **Import Key & Repository**:

    ```bash
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    ```

2.  **Install MongoDB**:
    ```bash
    sudo apt update
    sudo apt install -y mongodb-org
    ```
3.  **Start & Enable Database**:
    ```bash
    sudo systemctl start mongod
    sudo systemctl enable mongod
    ```
4.  **Create Admin & App Users** (CRITICAL STEP):
    Enter the Mongo console:

    ```bash
    mongosh
    ```

    _Copy-paste these lines one by one inside mongosh:_

    ```javascript
    use admin
    db.createUser({ user: "admin", pwd: "STRONG_ADMIN_PASSWORD", roles: ["root"] })

    use lms_db
    db.createUser({ user: "lms_user", pwd: "STRONG_APP_PASSWORD", roles: ["readWrite"] })
    exit
    ```

5.  **Configure & Secure MongoDB (One-Step Command)**:
    _Copy and paste this entire block to completely replace the config file:_
    ```bash
    sudo bash -c 'cat > /etc/mongod.conf <<EOF
    # mongod.conf
    systemLog:
      destination: file
      logAppend: true
      path: /var/log/mongodb/mongod.log
    storage:
      dbPath: /var/lib/mongodb
      journal:
        enabled: true
    processManagement:
      timeZoneInfo: /usr/share/zoneinfo
    net:
      port: 27017
      bindIp: 0.0.0.0  # Allows remote connections
    security:
      authorization: enabled
    EOF' && echo "✅ Config updated successfully!"
    ```
6.  **Allow Port in Firewall**:
    ```bash
    sudo ufw allow 27017
    ```
7.  **Restart Mongo**:
    ```bash
    sudo systemctl restart mongod
    ```

---

## 🔹 Step 4: Clone Repository (Monorepo Setup)

_Goal: Get your code onto the server._

1.  **Create Directory**:
    ```bash
    mkdir -p /var/www && cd /var/www
    ```
2.  **Clone Your Repo**:
    ```bash
    git clone <YOUR_GITHUB_REPO_URL> LMS_CADDCORE
    cd LMS_CADDCORE
    ```

---

## 🔹 Step 5: Backend Setup

_Goal: Setup the Express API._

1.  **Go to Backend Folder**:
    ```bash
    cd LMS-SERVER-CODE
    ```
2.  **Install & Build**:
    ```bash
    npm install
    npm run build
    ```
3.  **Setup Environment**:
    ```bash
    nano .env
    ```
    _Paste:_
    ```env
    PORT=5000
    DATABASE_URL=mongodb://lms_user:STRONG_APP_PASSWORD@localhost:27017/lms_db?authSource=lms_db
    NODE_ENV=production
    ```
4.  **Start Backend**:
    ```bash
    pm2 start ecosystem.config.js
    ```

---

## 🔹 Step 6: Frontend Setup

_Goal: Setup the Next.js Client._

1.  **Go to Frontend Folder**:
    ```bash
    cd ../LMS-CLIENT-CODE
    ```
2.  **Install & Build**:
    ```bash
    npm install
    nano .env.local
    ```
    _Paste:_
    ```env
    NEXT_PUBLIC_API_URL=http://<YOUR_VPS_IP>/api/v1
    ```
    _Build:_
    ```bash
    npm run build
    ```
3.  **Start Frontend**:
    ```bash
    pm2 start ecosystem.config.js
    ```
4.  **Save PM2 List**:
    ```bash
    pm2 save
    pm2 startup
    ```

---

## 🔹 Step 7: Nginx Setup (The Bridge)

_Goal: Connect the outside world (IP) to your internal ports._

1.  **Install Nginx**:
    ```bash
    sudo apt install -y nginx
    ```
2.  **Create Config**:

    ```bash
    sudo nano /etc/nginx/sites-available/lms
    ```

    _Paste Configuration (Updated for IP Access):_

    ```nginx
    server {
        listen 80;
        server_name _;  # Catch-all for IP address

        # Frontend (Root)
        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Backend (API Path)
        location /api/ {
            proxy_pass https://api.caddcore.cloud;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

3.  **Enable Site**:
    ```bash
    sudo rm /etc/nginx/sites-enabled/default
    sudo ln -s /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/
    sudo systemctl restart nginx
    ```

---

## 🔜 Future Steps: How to Add Domain

**When you buy `caddcore.com`, follow these steps:**

### Step 1: Update DNS

1.  Go to your Domain Provider.
2.  Add **A Record**: Host `@`, Value `72.61.254.219`.

### Step 2: Update Nginx Config

1.  Open Config: `sudo nano /etc/nginx/sites-available/lms`
2.  Change `server_name _;` to:
    ```nginx
    server_name caddcore.com www.caddcore.com;
    ```
3.  Save & Restart Nginx.

### Step 3: Update Frontend API URL

1.  Edit Env: `nano .env.local`
2.  Change API URL: `NEXT_PUBLIC_API_URL=https://caddcore.com/api/v1`
3.  Rebuild & Restart: `npm run build && pm2 restart lms-client`

### Step 4: Add SSL (Green Lock 🔒)

```bash
sudo certbot --nginx -d caddcore.com -d www.caddcore.com
```

---

## 🆘 Helper Cheatsheet (Daily Commands)

### 📊 PM2 (Process Management)

_Use these to manage your running apps_

- **Check Status**: `pm2 status`
- **View Live Logs**: `pm2 logs`
- **View Specific Logs**: `pm2 logs LMS-SERVER-CODE` (or `lms-client`)
- **Restart All Apps**: `pm2 restart all`
- **Restart Backend**: `pm2 restart LMS-SERVER-CODE --update-env` (Use `--update-env` if you changed .env)
- **Clear Logs**: `pm2 flush`
- **Monitor Real-time CPU/RAM**: `pm2 monit`

### 🌐 Nginx (Web Server)

- **Test Config for Errors**: `sudo nginx -t` (ALWAYS run this after editing config!)
- **Restart Nginx**: `sudo systemctl restart nginx`
- **Reload Config**: `sudo systemctl reload nginx` (No downtime restart)
- **Check Access Logs**: `sudo tail -f /var/log/nginx/access.log`
- **Check Error Logs**: `sudo tail -f /var/log/nginx/error.log`

### 🗄️ MongoDB (Database)

- **Check Service Status**: `sudo systemctl status mongod`
- **Restart Database**: `sudo systemctl restart mongod`
- **Backup Database**:
  ```bash
  mongodump --uri="mongodb://lms_user:PASSWORD@localhost:27017/lms_db" --out=/var/www/backups/
  ```
- **Restore Database**:
  ```bash
  mongorestore --uri="mongodb://lms_user:PASSWORD@localhost:27017/lms_db" /var/www/backups/lms_db
  ```

### 💻 System & Security

- **Check Disk Space**: `df -h`
- **Check RAM Usage**: `free -h`
- **Check Active Ports**: `sudo ufw status`
- **Update System**: `sudo apt update && sudo apt upgrade`
- **Zip a Folder**: `zip -r backup.zip folder_name`
- **Unzip a File**: `unzip file.zip`
