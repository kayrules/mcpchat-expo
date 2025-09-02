#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Publishing RHB Chat SDK to local registry...${NC}"

# Check if verdaccio is running
if ! curl -s http://localhost:4873 > /dev/null; then
    echo -e "${RED}❌ Verdaccio is not running. Please start it first:${NC}"
    echo "npm install -g verdaccio && verdaccio"
    exit 1
fi

# Clean and build
echo -e "${YELLOW}🧹 Cleaning and building...${NC}"
npm run clean
npm run build

# Check if build was successful
if [ ! -d "lib" ]; then
    echo -e "${RED}❌ Build failed. No lib directory found.${NC}"
    exit 1
fi

# Publish to local registry
echo -e "${YELLOW}📦 Publishing to local registry...${NC}"
npm publish --registry http://localhost:4873

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully published to local registry!${NC}"
    echo ""
    echo -e "${YELLOW}📋 To install in your host app:${NC}"
    echo "npm install rhb-chat-sdk --registry http://localhost:4873"
    echo ""
    echo -e "${YELLOW}🔄 To reset npm registry later:${NC}"
    echo "npm set registry https://registry.npmjs.org"
else
    echo -e "${RED}❌ Publish failed${NC}"
    exit 1
fi