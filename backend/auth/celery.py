
import os
from celery import Celery

# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth.settings')

app = Celery('auth')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.conf.broker_connection_retry_on_startup = True
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'update-user-status-every-20-seconds': {
        'task': 'users.tasks.update_user_status',
        'schedule': 10.0,
    },
}