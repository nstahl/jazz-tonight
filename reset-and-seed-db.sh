#!/bin/bash

echo "Resetting database..."
npx prisma db push --force-reset

echo "Generating Prisma client..."
npx prisma generate

echo "Seeding database..."
npx prisma db seed
