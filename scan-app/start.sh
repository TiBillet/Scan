#!/bin/bash
set -e

export PATH="/home/scan/.local/bin:$PATH"
npm install
echo "Node install ok"

#cordova run browser

sleep infinity


#if [[ "$GUNICORN" == "1" ]]; then
#    echo "→ Gunicorn activé, démarrage…"
#    uv run python3 manage.py collectstatic --noinput
#    uv run gunicorn fossbadge.wsgi --log-level=info -w 3 -b 0.0.0.0:8000
#else
#    echo "→ Gunicorn désactivé, on sleep…"
#	  echo "To start the server : rsp"
#    sleep infinity
#fi
#echo "Run GUNICORN"
#echo "You should be able to see the Fedow dashbord at :"
#echo "https://$DOMAIN/dashboard/"
#poetry run gunicorn fossbadgeallet_django.wsgi --log-level=info --log-file /home/fossbadge/Fedow/logs/gunicorn.logs -w 5 -b 0.0.0.0:8000

