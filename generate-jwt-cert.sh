#!/bin/bash

echo "=== Generating JWT Certificate for Salesforce Connected App ==="
echo ""

# Create certs directory if it doesn't exist
mkdir -p certs

# Generate private key
echo "1. Generating private key..."
openssl genrsa -out certs/server.key 2048

# Generate certificate signing request
echo "2. Creating certificate signing request..."
openssl req -new -key certs/server.key -out certs/server.csr \
  -subj "/C=US/ST=State/L=City/O=Gesher/CN=gesher-intake"

# Generate self-signed certificate (valid for 2 years)
echo "3. Generating self-signed certificate..."
openssl x509 -req -days 730 -in certs/server.csr \
  -signkey certs/server.key -out certs/server.crt

echo ""
echo "✅ Certificate generated successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Upload the certificate to your Connected App:"
echo "   - Go to Salesforce Setup → Apps → App Manager"
echo "   - Find your Connected App and click Edit"
echo "   - Check 'Use digital signatures'"
echo "   - Upload file: certs/server.crt"
echo "   - Save"
echo ""
echo "2. The private key is saved at: certs/server.key"
echo "   This will be used by the app to sign JWT tokens"
echo ""
echo "3. Update .env.local with:"
echo "   SALESFORCE_PRIVATE_KEY_PATH=certs/server.key"
echo ""

# Display the certificate for copying if needed
echo "Certificate content (if you need to copy/paste):"
echo "================================================"
cat certs/server.crt
echo "================================================"