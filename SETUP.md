# Complete Setup Guide for DNS Firewall Server

## Prerequisites

### 1. Required Software Installation

#### Docker & Docker Compose
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker

# macOS (using Homebrew)
brew install docker docker-compose
# Or download Docker Desktop from https://www.docker.com/products/docker-desktop

# Windows
# Download Docker Desktop from https://www.docker.com/products/docker-desktop
```

#### Node.js (for development)
```bash
# Using Node Version Manager (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Or direct installation
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node@18

# Windows
# Download from https://nodejs.org/
```

#### Go (for DNS server development)
```bash
# Ubuntu/Debian
wget https://go.dev/dl/go1.19.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.19.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# macOS
brew install go

# Windows
# Download from https://golang.org/dl/
```

#### Python (for AI service)
```bash
# Ubuntu/Debian
sudo apt install python3 python3-pip python3-venv

# macOS
brew install python@3.9

# Windows
# Download from https://www.python.org/downloads/
```

### 2. API Keys Setup

You'll need to register for these free API services:

#### VirusTotal API
1. Go to https://www.virustotal.com/gui/join-us
2. Create account and verify email
3. Go to https://www.virustotal.com/gui/my-apikey
4. Copy your API key

#### AbuseIPDB API
1. Go to https://www.abuseipdb.com/register
2. Create account and verify email
3. Go to https://www.abuseipdb.com/api
4. Generate API key

## Quick Start

### 1. Clone and Setup Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd dns-firewall-system

# Create environment file
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` file:
```env
# API Keys (replace with your actual keys)
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
ABUSEIPDB_API_KEY=your_abuseipdb_api_key_here

# Database Configuration
MONGO_PASSWORD=SecurePassword123!
MONGO_USERNAME=admin
MONGO_DATABASE=dns_firewall

# Security
JWT_SECRET=your_super_secure_jwt_secret_here_min_32_chars

# Monitoring
GRAFANA_PASSWORD=admin123

# Redis Configuration
REDIS_PASSWORD=RedisSecure123!
```

### 3. Start the System

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Access the Services

- **DNS Firewall Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **AI Service**: http://localhost:8000/docs
- **Grafana Monitoring**: http://localhost:3002 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **MongoDB**: localhost:27017

## Development Setup

### 1. Frontend Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### 2. Backend Development

```bash
cd services/dashboard-backend
npm install
npm run dev
```

### 3. AI Service Development

```bash
cd services/ai-classifier
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml if needed
2. **Permission denied**: Run `sudo usermod -aG docker $USER` and logout/login
3. **MongoDB connection**: Ensure MongoDB is running and accessible
4. **API rate limits**: VirusTotal free tier has 4 requests/minute limit

### Useful Commands

```bash
# Reset everything
docker-compose down -v
docker-compose up -d

# View specific service logs
docker-compose logs -f dns-firewall

# Access MongoDB shell
docker-compose exec mongo mongosh -u admin -p SecurePassword123!

# Access Redis CLI
docker-compose exec redis redis-cli
```