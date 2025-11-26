#!/bin/bash

#############################################
# quotecord Website Installer
# One-command installation with self-healing
#############################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Logging
LOG_FILE="$SCRIPT_DIR/install.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

#############################################
# Helper Functions
#############################################

print_banner() {
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║       quotecord Website Installer         ║"
    echo "║   One-command setup with auto-healing     ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "\n${CYAN}▶ $1${NC}"
}

spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

retry_command() {
    local max_attempts=$1
    local delay=$2
    shift 2
    local cmd="$@"
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if eval "$cmd"; then
            return 0
        fi

        if [ $attempt -lt $max_attempts ]; then
            log_warning "Attempt $attempt failed. Retrying in ${delay}s..."
            sleep $delay
            delay=$((delay * 2))
        fi
        attempt=$((attempt + 1))
    done

    return 1
}

detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            echo "debian"
        elif [ -f /etc/redhat-release ]; then
            echo "redhat"
        elif [ -f /etc/arch-release ]; then
            echo "arch"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

detect_package_manager() {
    if command -v apt-get &> /dev/null; then
        echo "apt"
    elif command -v yum &> /dev/null; then
        echo "yum"
    elif command -v dnf &> /dev/null; then
        echo "dnf"
    elif command -v pacman &> /dev/null; then
        echo "pacman"
    elif command -v brew &> /dev/null; then
        echo "brew"
    else
        echo "none"
    fi
}

#############################################
# Installation Functions
#############################################

check_node() {
    log_step "Checking Node.js installation..."

    if command -v node &> /dev/null; then
        local node_version=$(node -v | sed 's/v//')
        local major_version=$(echo $node_version | cut -d. -f1)

        if [ "$major_version" -ge 18 ]; then
            log_success "Node.js v$node_version found (meets requirement >= 18)"
            return 0
        else
            log_warning "Node.js v$node_version found but v18+ is required"
            return 1
        fi
    else
        log_warning "Node.js not found"
        return 1
    fi
}

install_node() {
    log_step "Installing Node.js..."

    local os=$(detect_os)
    local pkg_manager=$(detect_package_manager)

    # Try using nvm first (most reliable cross-platform)
    if ! command -v nvm &> /dev/null; then
        log_info "Installing nvm (Node Version Manager)..."

        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

        # Load nvm
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi

    if command -v nvm &> /dev/null; then
        log_info "Installing Node.js 20 LTS via nvm..."
        nvm install 20
        nvm use 20
        nvm alias default 20
    else
        # Fallback to package manager
        log_info "Installing Node.js via package manager..."

        case $pkg_manager in
            apt)
                curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
                sudo apt-get install -y nodejs
                ;;
            yum|dnf)
                curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
                sudo $pkg_manager install -y nodejs
                ;;
            pacman)
                sudo pacman -S --noconfirm nodejs npm
                ;;
            brew)
                brew install node@20
                ;;
            *)
                log_error "Could not install Node.js automatically. Please install Node.js 18+ manually."
                exit 1
                ;;
        esac
    fi

    # Verify installation
    if check_node; then
        log_success "Node.js installed successfully"
    else
        log_error "Node.js installation failed"
        exit 1
    fi
}

check_npm() {
    log_step "Checking npm..."

    if command -v npm &> /dev/null; then
        local npm_version=$(npm -v)
        log_success "npm v$npm_version found"
        return 0
    else
        log_warning "npm not found"
        return 1
    fi
}

install_dependencies() {
    log_step "Installing npm dependencies..."

    # Clean install for reliability
    if [ -d "node_modules" ]; then
        log_info "Removing existing node_modules..."
        rm -rf node_modules
    fi

    if [ -f "package-lock.json" ]; then
        log_info "Removing package-lock.json for clean install..."
        rm -f package-lock.json
    fi

    # Install with retries
    if retry_command 3 2 "npm install --legacy-peer-deps 2>&1"; then
        log_success "Dependencies installed successfully"
    else
        log_warning "Standard install failed, trying with force..."
        if npm install --force 2>&1; then
            log_success "Dependencies installed with force flag"
        else
            log_error "Failed to install dependencies"
            exit 1
        fi
    fi
}

#############################################
# Environment Configuration
#############################################

setup_environment() {
    log_step "Setting up environment variables..."

    local env_file="$SCRIPT_DIR/.env.local"

    # Check if .env.local already exists
    if [ -f "$env_file" ]; then
        log_info "Found existing .env.local"
        read -p "Do you want to reconfigure? (y/N): " reconfigure
        if [[ ! $reconfigure =~ ^[Yy]$ ]]; then
            log_info "Keeping existing configuration"
            return 0
        fi
    fi

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "${CYAN}       Environment Configuration           ${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo ""

    # Supabase configuration
    echo -e "${YELLOW}Supabase Configuration${NC}"
    echo "Get these from: https://supabase.com/dashboard/project/_/settings/api"
    echo ""

    read -p "Supabase Project URL (https://xxx.supabase.co): " SUPABASE_URL
    read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
    read -p "Supabase Service Role Key: " SUPABASE_SERVICE_KEY

    echo ""
    echo -e "${YELLOW}Stripe Configuration${NC}"
    echo "Get these from: https://dashboard.stripe.com/apikeys"
    echo ""

    read -p "Stripe Secret Key (sk_...): " STRIPE_SECRET
    read -p "Stripe Publishable Key (pk_...): " STRIPE_PUBLISHABLE
    read -p "Stripe Webhook Secret (whsec_...): " STRIPE_WEBHOOK
    read -p "Stripe Monthly Price ID (price_...): " STRIPE_MONTHLY_PRICE
    read -p "Stripe Annual Price ID (price_...): " STRIPE_ANNUAL_PRICE

    echo ""
    echo -e "${YELLOW}App Configuration${NC}"
    echo ""

    read -p "App URL (default: http://localhost:3000): " APP_URL
    APP_URL=${APP_URL:-http://localhost:3000}

    # Write environment file
    cat > "$env_file" << EOF
# quotecord Website Environment Variables
# Generated by installer on $(date)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY

# Stripe
STRIPE_SECRET_KEY=$STRIPE_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE
STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK
STRIPE_PREMIUM_MONTHLY_PRICE_ID=$STRIPE_MONTHLY_PRICE
STRIPE_PREMIUM_ANNUAL_PRICE_ID=$STRIPE_ANNUAL_PRICE

# App
NEXT_PUBLIC_URL=$APP_URL
EOF

    log_success "Environment file created at .env.local"
}

setup_environment_auto() {
    log_step "Setting up environment (auto mode)..."

    local env_file="$SCRIPT_DIR/.env.local"

    if [ -f "$env_file" ]; then
        log_success "Environment file already exists"
        return 0
    fi

    # Copy from example and use placeholders
    if [ -f "$SCRIPT_DIR/.env.example" ]; then
        cp "$SCRIPT_DIR/.env.example" "$env_file"
        log_warning "Created .env.local from template - YOU MUST EDIT THIS FILE"
        log_info "Edit .env.local with your actual Supabase and Stripe credentials"
    else
        log_error "No .env.example found"
        exit 1
    fi
}

validate_environment() {
    log_step "Validating environment configuration..."

    local env_file="$SCRIPT_DIR/.env.local"

    if [ ! -f "$env_file" ]; then
        log_error "No .env.local file found"
        return 1
    fi

    # Source the env file
    set -a
    source "$env_file"
    set +a

    local valid=true

    # Check required variables
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [[ "$NEXT_PUBLIC_SUPABASE_URL" == *"your-project"* ]]; then
        log_warning "NEXT_PUBLIC_SUPABASE_URL is not configured"
        valid=false
    fi

    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [[ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" == *"your-anon-key"* ]]; then
        log_warning "NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured"
        valid=false
    fi

    if [ -z "$STRIPE_SECRET_KEY" ] || [[ "$STRIPE_SECRET_KEY" == *"sk_test_xxx"* ]]; then
        log_warning "STRIPE_SECRET_KEY is not configured"
        valid=false
    fi

    if [ "$valid" = true ]; then
        log_success "Environment configuration looks valid"
        return 0
    else
        log_warning "Some environment variables need to be configured"
        log_info "The app will run but some features won't work until configured"
        return 0  # Don't fail, just warn
    fi
}

#############################################
# Build and Run
#############################################

build_project() {
    log_step "Building project..."

    # Clear any previous build
    if [ -d ".next" ]; then
        log_info "Clearing previous build..."
        rm -rf .next
    fi

    # Build with retries
    if retry_command 2 5 "npm run build 2>&1"; then
        log_success "Project built successfully"
    else
        log_error "Build failed"

        # Try to fix common issues
        log_info "Attempting to fix build issues..."

        # Clear cache and rebuild
        rm -rf .next node_modules/.cache

        if npm run build 2>&1; then
            log_success "Build succeeded after cache clear"
        else
            log_error "Build failed. Check the errors above."
            exit 1
        fi
    fi
}

run_dev_server() {
    log_step "Starting development server..."

    log_info "Server will start at http://localhost:3000"
    log_info "Press Ctrl+C to stop"
    echo ""

    npm run dev
}

run_production_server() {
    log_step "Starting production server..."

    log_info "Server will start at http://localhost:3000"
    log_info "Press Ctrl+C to stop"
    echo ""

    npm run start
}

#############################################
# Database Setup Helper
#############################################

show_database_instructions() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "${CYAN}       Database Setup Instructions         ${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo ""
    echo "To complete setup, run the SQL schema in Supabase:"
    echo ""
    echo "1. Go to your Supabase Dashboard"
    echo "2. Navigate to SQL Editor"
    echo "3. Copy contents of: supabase/schema.sql"
    echo "4. Paste and run in SQL Editor"
    echo ""
    echo "Also configure Discord OAuth in Supabase:"
    echo "1. Go to Authentication > Providers > Discord"
    echo "2. Enable Discord provider"
    echo "3. Add your Discord app credentials"
    echo "4. Set redirect URL in Discord Developer Portal:"
    echo "   https://YOUR-PROJECT.supabase.co/auth/v1/callback"
    echo ""
}

#############################################
# Main Installation Flow
#############################################

main() {
    print_banner

    echo "Installation log: $LOG_FILE"
    echo ""

    # Parse arguments
    local auto_mode=false
    local skip_build=false
    local start_server=false
    local dev_mode=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --auto)
                auto_mode=true
                shift
                ;;
            --skip-build)
                skip_build=true
                shift
                ;;
            --start)
                start_server=true
                shift
                ;;
            --dev)
                dev_mode=true
                start_server=true
                shift
                ;;
            --help)
                echo "Usage: ./install.sh [options]"
                echo ""
                echo "Options:"
                echo "  --auto        Non-interactive mode (uses .env.example)"
                echo "  --skip-build  Skip the build step"
                echo "  --start       Start production server after install"
                echo "  --dev         Start development server after install"
                echo "  --help        Show this help message"
                echo ""
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    # Step 1: Check/Install Node.js
    if ! check_node; then
        install_node
    fi

    # Step 2: Check npm
    if ! check_npm; then
        log_error "npm is required but not found"
        exit 1
    fi

    # Step 3: Install dependencies
    install_dependencies

    # Step 4: Setup environment
    if [ "$auto_mode" = true ]; then
        setup_environment_auto
    else
        setup_environment
    fi

    # Step 5: Validate environment
    validate_environment

    # Step 6: Build project
    if [ "$skip_build" = false ]; then
        build_project
    fi

    # Step 7: Show database instructions
    show_database_instructions

    # Final summary
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}       Installation Complete!              ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env.local with your credentials (if not done)"
    echo "2. Run the database schema in Supabase SQL Editor"
    echo "3. Configure Discord OAuth in Supabase"
    echo ""
    echo "To start the server:"
    echo "  Development: npm run dev"
    echo "  Production:  npm run start"
    echo ""

    # Start server if requested
    if [ "$start_server" = true ]; then
        if [ "$dev_mode" = true ]; then
            run_dev_server
        else
            run_production_server
        fi
    fi
}

# Run main function
main "$@"
