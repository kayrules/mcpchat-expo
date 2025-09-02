# Publishing RHB Chat SDK

## Option 1: Local npm Registry (Verdaccio)

### 1. Install Verdaccio (local npm registry)

```bash
npm install -g verdaccio
```

### 2. Start Verdaccio

```bash
verdaccio
```

This will start a local registry at `http://localhost:4873`

### 3. Configure npm to use local registry

```bash
npm set registry http://localhost:4873
```

### 4. Create user for local registry

```bash
npm adduser --registry http://localhost:4873
```

### 5. Build and publish the SDK

```bash
cd packages/rhb-chat-sdk
npm run build
npm publish --registry http://localhost:4873
```

### 6. Install in host app

```bash
# In your host app directory
npm install rhb-chat-sdk --registry http://localhost:4873
```

## Option 2: npm pack (for testing)

### 1. Build and pack the SDK

```bash
cd packages/rhb-chat-sdk
npm run build
npm pack
```

This creates a `.tgz` file

### 2. Install in host app

```bash
# In your host app directory
npm install /path/to/rhb-chat-sdk-1.0.0.tgz
```

## Option 3: File Link (for development)

### 1. Build the SDK

```bash
cd packages/rhb-chat-sdk
npm run build
```

### 2. Create global link

```bash
npm link
```

### 3. Link in host app

```bash
# In your host app directory
npm link rhb-chat-sdk
```

## Reset npm registry (after testing)

```bash
npm set registry https://registry.npmjs.org
```

## Automated Publishing Script

Create a script to automate the process:

```bash
#!/bin/bash
cd packages/rhb-chat-sdk
npm run clean
npm run build
npm version patch
npm publish --registry http://localhost:4873
echo "✅ Published to local registry"
```