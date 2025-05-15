#!bin/sh 

#start the backend
cd backend

rm */__pycache__/*
deactivate
rm -rf env
pg_ctl -D "/Users/${USER}/.brew/opt/postgresql@14" stop 
pg_ctl -D "/Users/${USER}/.brew/opt/postgresql@14" start 

python3.7 -m venv env
source env/bin/activate
python3.7 -m pip install --upgrade pip
python3.7 -m pip install -r requirements.txt
python3.7 -m pip uninstall psycopg2-binary
python3.7 -m pip install psycopg2-binary


python3.7 manage.py makemigrations users
python3.7 manage.py migrate

python3.7 manage.py runserver 0.0.0.0:8000
