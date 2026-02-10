#!/bin/bash

# Hospital Management System - Quick Start Script
# This script installs all dependencies and sets up the application

echo "========================================"
echo "  Hospital Management System Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
echo "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js $NODE_VERSION is installed"
else
    echo "✗ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check if PostgreSQL is installed
echo "Checking PostgreSQL installation..."
if command -v psql &> /dev/null; then
    echo "✓ PostgreSQL is installed"
else
    echo "⚠ PostgreSQL might not be installed or not in PATH"
    echo "  Please ensure PostgreSQL is installed and running"
fi

echo ""
echo "Installing dependencies..."
echo ""

# Install root dependencies
echo "[1/3] Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "✗ Failed to install root dependencies"
    exit 1
fi
echo "✓ Root dependencies installed"

# Install backend dependencies
echo "[2/3] Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "✗ Failed to install backend dependencies"
    exit 1
fi
echo "✓ Backend dependencies installed"

# Install frontend dependencies
echo "[3/3] Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "✗ Failed to install frontend dependencies"
    exit 1
fi
echo "✓ Frontend dependencies installed"
cd ..

echo ""
echo "========================================"
echo "  Installation Complete!"
echo "========================================"
echo ""

echo "Next Steps:"
echo ""
echo "1. Configure database connection:"
echo "   Edit backend/.env with your PostgreSQL credentials"
echo ""
echo "2. Create database:"
echo "   psql -U postgres -c 'CREATE DATABASE hospital_management;'"
echo ""
echo "3. Run migrations:"
echo "   cd backend"
echo "   npm run db:migrate"
echo "   npm run db:seed"
echo ""
echo "4. Start the application:"
echo "   npm run dev"
echo ""
echo "For detailed setup instructions, see SETUP.md"
echo ""
