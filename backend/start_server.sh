   #!/bin/bash
   cd /home/xlon/xlon_app/esg-dashboard/backend 
   gunicorn app.main:app -c gunicorn_conf.py
