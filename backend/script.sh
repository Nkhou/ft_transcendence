until pg_isready -h postgres -U postgres; do
  echo "Waiting for PostgreSQL..."
  sleep 1
done

rm -rf users/migrations
python manage.py makemigrations users 
python manage.py makemigrations
python manage.py migrate
python manage.py migrate users

python manage.py runserver 0.0.0.0:8000