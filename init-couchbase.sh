#!/bin/bash
set -e

echo "Waiting for Couchbase to be ready..."

until curl -s -f http://couchbase:8091/pools > /dev/null 2>&1; do
  echo "  ... still waiting"
  sleep 5
done

echo "Couchbase is up. Initializing cluster..."

couchbase-cli cluster-init \
  --cluster couchbase:8091 \
  --cluster-username Administrator \
  --cluster-password changeme123 \
  --cluster-ramsize 512 \
  --cluster-index-ramsize 256 \
  --services data,index,query \
  || echo "Cluster already initialized (skipping)"

echo "Creating bucket identity_access..."

couchbase-cli bucket-create \
  --cluster couchbase:8091 \
  --username Administrator \
  --password changeme123 \
  --bucket identity_access \
  --bucket-type couchbase \
  --bucket-ramsize 256 \
  --bucket-replica 0 \
  || echo "Bucket already exists (skipping)"

echo "Creating scope identity..."

couchbase-cli collection-manage \
  --cluster couchbase:8091 \
  --username Administrator \
  --password changeme123 \
  --bucket identity_access \
  --create-scope identity \
  || echo "Scope already exists (skipping)"

echo "Creating collection identity.users..."

couchbase-cli collection-manage \
  --cluster couchbase:8091 \
  --username Administrator \
  --password changeme123 \
  --bucket identity_access \
  --create-collection identity.users \
  || echo "Collection already exists (skipping)"

echo "Couchbase initialization complete."