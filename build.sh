#!/usr/bin/env bash
set -o errexit

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Only run collectstatic if Django is properly configured
python manage.py collectstatic --noinput --clear || echo "Collectstatic failed, continuing..."

# Apply migrations
python manage.py migrate --noinput || echo "Migrations failed, continuing..."
