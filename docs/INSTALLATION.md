# Installation and Setup Guide

This guide provides step-by-step instructions for setting up the SL8.ai development environment. The project consists of a React Native/Expo frontend and a planned PHP + MySQL backend.

## Navigation

📋 **Documentation Hub**: [Main Documentation](README.md)  
🏗️ **Architecture**: [System Architecture](ARCHITECTURE.md)  
🔌 **API Reference**: [API Documentation](API.md)  
👨‍💻 **Development**: [Development Guide](DEVELOPMENT.md)

---

## Table of Contents

- [System Prerequisites](#system-prerequisites)
- [Frontend Setup (React Native/Expo)](#frontend-setup-react-nativeexpo)
- [Backend Setup (PHP + MySQL)](#backend-setup-php--mysql)
- [Environment Configuration](#environment-configuration)
- [Installation Verification](#installation-verification)
- [Troubleshooting](#troubleshooting)

## System Prerequisites

Before starting the installation, ensure your system meets the following requirements:

### Required Software Versions

| Software | Minimum Version | Recommended Version | Notes |
|----------|----------------|-------------------|-------|
| **Node.js** | 18.0.0 | 20.x.x LTS | Required for React Native and Expo |
| **npm** | 8.0.0 | Latest | Comes with Node.js |
| **Expo CLI** | 6.0.0 | Latest | Global installation required |
| **Git** | 2.20.0 | Latest | Version control |
| **PHP** | 8.1.0 | 8.2.x | Backend development |
| **MySQL** | 8.0.0 | 8.0.x | Database server |
| **Composer** | 2.0.0 | Latest | PHP dependency manager |

### Platform-Specific Requirements

#### macOS
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install PHP and MySQL
brew install php mysql

# Install Composer
brew install composer
```

#### Windows
- Install [Node.js](https://nodejs.org/) from official website
- Install [XAMPP](https://www.apachefriends.org/) for PHP and MySQL
- Install [Composer](https://getcomposer.org/) for PHP dependency management
- Install [Git for Windows](https://gitforwindows.org/)

#### Linux (Ubuntu/Debian)
```bash
# Update package list
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PHP and MySQL
sudo apt install php php-cli php-mysql mysql-server

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### Mobile Development Requirements

#### For iOS Development (macOS only)
- **Xcode** 14.0+ (from Mac App Store)
- **iOS Simulator** (included with Xcode)
- **CocoaPods** (installed via gem)

```bash
# Install CocoaPods
sudo gem install cocoapods
```

#### For Android Development
- **Android Studio** with Android SDK
- **Android Virtual Device (AVD)** or physical Android device
- **Java Development Kit (JDK)** 11 or higher

[↑ Back to top](#table-of-contents)

## Frontend Setup (React Native/Expo)

### Step 1: Install Global Dependencies

```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Verify installation
expo --version
```

### Step 2: Clone the Repository

```bash
# Clone the project repository
git clone [REPOSITORY_URL]
cd [PROJECT_NAME]

# Navigate to the Expo project directory
cd SL8Whiteboard/SL8WhiteboardExpo
```

### Step 3: Install Project Dependencies

```bash
# Install all npm dependencies
npm install

# For iOS (macOS only) - install CocoaPods dependencies
cd ios && pod install && cd ..
```

### Step 4: Start the Development Server

```bash
# Start Expo development server
npm start

# Alternative: Start with specific platform
npm run android  # For Android
npm run ios      # For iOS (macOS only)
npm run web      # For web browser
```

### Step 5: Install Expo Go App (Optional)

For testing on physical devices:

1. **iOS**: Download [Expo Go](https://apps.apple.com/app/expo-go/id982107779) from App Store
2. **Android**: Download [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) from Google Play Store

## Backend Setup (PHP + MySQL)

> **Note**: The backend is currently in development. These instructions prepare the environment for future backend implementation.

### Step 1: Configure MySQL Database

#### Start MySQL Service

**macOS (Homebrew)**:
```bash
# Start MySQL service
brew services start mysql

# Secure MySQL installation
mysql_secure_installation
```

**Windows (XAMPP)**:
1. Open XAMPP Control Panel
2. Start Apache and MySQL services

**Linux**:
```bash
# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation
sudo mysql_secure_installation
```

#### Create Database and User

```bash
# Connect to MySQL as root
mysql -u root -p

# Create database for SL8.ai
CREATE DATABASE sl8_whiteboard;

# Create dedicated user
CREATE USER 'sl8_user'@'localhost' IDENTIFIED BY 'secure_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON sl8_whiteboard.* TO 'sl8_user'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

### Step 2: PHP Configuration

#### Verify PHP Installation

```bash
# Check PHP version
php --version

# Check required extensions
php -m | grep -E "(mysql|pdo|json|curl)"
```

#### Install Required PHP Extensions

**macOS (Homebrew)**:
```bash
# Most extensions come pre-installed with Homebrew PHP
brew install php-mysql
```

**Ubuntu/Debian**:
```bash
sudo apt install php-mysql php-pdo php-json php-curl php-mbstring
```

**Windows (XAMPP)**:
- Extensions are typically pre-installed with XAMPP

### Step 3: Prepare Backend Directory Structure

```bash
# Create backend directory (from project root)
mkdir -p backend/api
mkdir -p backend/config
mkdir -p backend/models
mkdir -p backend/controllers

# Create basic configuration files
touch backend/config/database.php
touch backend/config/config.php
```

## Environment Configuration

### Frontend Environment Variables

Create environment configuration for the Expo app:

```bash
# Navigate to Expo project directory
cd SL8Whiteboard/SL8WhiteboardExpo

# Create environment configuration file
touch .env
```

Add the following content to `.env`:

```env
# API Configuration
API_BASE_URL=http://localhost:8000/api
API_TIMEOUT=10000

# Development Settings
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_DEBUG=true

# AI Integration (when implemented)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### Backend Environment Variables

Create PHP configuration files:

**backend/config/database.php**:
```php
<?php
return [
    'host' => 'localhost',
    'database' => 'sl8_whiteboard',
    'username' => 'sl8_user',
    'password' => 'secure_password_here',
    'charset' => 'utf8mb4',
    'port' => 3306
];
?>
```

**backend/config/config.php**:
```php
<?php
return [
    'app_name' => 'SL8.ai API',
    'app_version' => '1.0.0',
    'debug' => true,
    'timezone' => 'UTC',
    'jwt_secret' => 'your_jwt_secret_key_here',
    'gemini_api_key' => 'your_gemini_api_key_here'
];
?>
```

## Installation Verification

### Verify Frontend Setup

1. **Check Expo Development Server**:
```bash
cd SL8Whiteboard/SL8WhiteboardExpo
npm start
```
Expected output: Expo development server starts and displays QR code

2. **Test App Launch**:
   - Scan QR code with Expo Go app, or
   - Press 'w' to open in web browser, or
   - Press 'a' for Android emulator, or
   - Press 'i' for iOS simulator

3. **Verify Core Functionality**:
   - App loads without errors
   - Drawing tools are accessible
   - Canvas responds to touch/mouse input
   - Undo/redo functionality works

### Verify Backend Setup

1. **Test Database Connection**:
```bash
# Test MySQL connection
mysql -u sl8_user -p sl8_whiteboard -e "SELECT 1;"
```

2. **Test PHP Configuration**:
```bash
# Check PHP configuration
php -i | grep -E "(mysql|pdo)"

# Test basic PHP script
echo "<?php phpinfo(); ?>" | php
```

3. **Verify Directory Structure**:
```bash
# Check backend directory structure
ls -la backend/
```

Expected structure:
```
backend/
├── api/
├── config/
│   ├── database.php
│   └── config.php
├── controllers/
└── models/
```

## Troubleshooting

### Common Frontend Issues

#### Issue: "Expo CLI not found"
**Solution**:
```bash
# Reinstall Expo CLI globally
npm uninstall -g @expo/cli
npm install -g @expo/cli

# Clear npm cache if needed
npm cache clean --force
```

#### Issue: "Metro bundler failed to start"
**Solution**:
```bash
# Clear Expo cache
expo start --clear

# Reset Metro cache
npx react-native start --reset-cache
```

#### Issue: "Unable to resolve module"
**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Clear watchman cache (macOS/Linux)
watchman watch-del-all
```

#### Issue: iOS build fails
**Solution**:
```bash
# Update CocoaPods
cd ios
pod repo update
pod install
cd ..
```

### Common Backend Issues

#### Issue: "MySQL connection refused"
**Solutions**:
1. **Check MySQL service status**:
```bash
# macOS
brew services list | grep mysql

# Linux
sudo systemctl status mysql

# Windows - Check XAMPP Control Panel
```

2. **Verify MySQL is running on correct port**:
```bash
netstat -an | grep 3306
```

3. **Check MySQL credentials**:
```bash
mysql -u sl8_user -p
```

#### Issue: "PHP extensions missing"
**Solution**:
```bash
# Check installed extensions
php -m

# Install missing extensions (Ubuntu/Debian)
sudo apt install php-[extension-name]

# Restart web server after installing extensions
```

#### Issue: "Permission denied" errors
**Solution**:
```bash
# Fix directory permissions
chmod -R 755 backend/
chown -R www-data:www-data backend/ # Linux
```

### Development Environment Issues

#### Issue: Port conflicts
**Solution**:
```bash
# Find process using port
lsof -i :3000  # For Expo default port
lsof -i :8000  # For backend default port

# Kill process if needed
kill -9 [PID]

# Start with different port
expo start --port 3001
```

#### Issue: Environment variables not loading
**Solution**:
1. Verify `.env` file location and syntax
2. Restart development server after changes
3. Check environment variable naming (EXPO_PUBLIC_ prefix for Expo)

### Getting Help

If you encounter issues not covered in this troubleshooting section:

1. **Check Project Issues**: Review existing GitHub issues for similar problems
2. **Expo Documentation**: Visit [Expo documentation](https://docs.expo.dev/) for platform-specific guidance
3. **React Native Community**: Check [React Native community resources](https://reactnative.dev/help)
4. **Create New Issue**: If the problem persists, create a detailed issue report including:
   - Operating system and version
   - Node.js and npm versions
   - Complete error messages
   - Steps to reproduce the issue

### Useful Commands Reference

```bash
# Frontend Development
npm start                    # Start Expo development server
npm run android             # Run on Android
npm run ios                 # Run on iOS
expo doctor                 # Check Expo environment
expo install [package]      # Install Expo-compatible packages

# Backend Development
php -S localhost:8000       # Start PHP development server
mysql -u root -p            # Connect to MySQL
composer install            # Install PHP dependencies
php artisan migrate         # Run database migrations (when implemented)

# General Development
git status                  # Check Git status
git pull origin main        # Update local repository
npm outdated               # Check for outdated packages
```

---

**Next Steps**: After completing the installation, proceed to the [Development Guide](DEVELOPMENT.md) to learn about coding conventions and contribution workflow.

[↑ Back to top](#table-of-contents)

---

## Related Documentation

📋 **Documentation Hub**: [Main Documentation](README.md)  
🏗️ **Architecture**: [System Architecture](ARCHITECTURE.md)  
🔌 **API Reference**: [API Documentation](API.md)  
👨‍💻 **Development**: [Development Guide](DEVELOPMENT.md)  
🗺️ **Roadmap**: [Feature Roadmap](ROADMAP.md)  
📖 **Use Cases**: [Use Cases & Workflows](USE_CASES.md)  
🤔 **Technical Decisions**: [Technical Decisions](TECHNICAL_DECISIONS.md)

[↑ Back to top](#table-of-contents)