#!/bin/bash
# Import corporate proxy certificate into Java truststore

CERT_FILE="$1"
TRUSTSTORE="/app/truststore.jks"
STOREPASS="changeit"

if [ -z "$CERT_FILE" ]; then
  echo "No certificate file provided, skipping import"
  exit 0
fi

if [ ! -f "$CERT_FILE" ]; then
  echo "Certificate file not found: $CERT_FILE"
  exit 1
fi

echo "Importing certificate from $CERT_FILE..."

# First, backup the original cacerts
cp $JAVA_HOME/lib/security/cacerts $JAVA_HOME/lib/security/cacerts.original

# Create a new truststore by copying the default Java truststore
cp $JAVA_HOME/lib/security/cacerts $TRUSTSTORE

# Check if the file contains multiple certificates (certificate chain)
cert_count=$(grep -c "BEGIN CERTIFICATE" "$CERT_FILE")
echo "Found $cert_count certificate(s) in the file"

if [ $cert_count -gt 1 ]; then
  # Split the certificate chain into individual files
  awk '/-----BEGIN CERTIFICATE-----/{f=sprintf("/tmp/cert_%02d.crt",++i)} f{print > f} /-----END CERTIFICATE-----/{close(f)}' "$CERT_FILE"

  # Import each certificate to both truststores
  for i in /tmp/cert_*.crt; do
    cert_name=$(basename "$i" .crt)
    echo "Importing $cert_name..."
    keytool -import -trustcacerts -keystore $TRUSTSTORE -storepass $STOREPASS -noprompt -alias "$cert_name" -file "$i"
    # Also import to default cacerts for gradle wrapper
    keytool -import -trustcacerts -keystore $JAVA_HOME/lib/security/cacerts -storepass changeit -noprompt -alias "$cert_name" -file "$i"
  done

  # Clean up
  rm -f /tmp/cert_*.crt
else
  # Single certificate
  keytool -import -trustcacerts -keystore $TRUSTSTORE -storepass $STOREPASS -noprompt -alias proxy-cert -file $CERT_FILE
  # Also import to default cacerts for gradle wrapper
  keytool -import -trustcacerts -keystore $JAVA_HOME/lib/security/cacerts -storepass changeit -noprompt -alias proxy-cert -file $CERT_FILE
fi

echo "Certificate(s) imported successfully to both truststores"
