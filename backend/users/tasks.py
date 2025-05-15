from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from channels.layers import get_channel_layer
from .models import CustomUser
import logging
from asgiref.sync import async_to_sync 

logger = logging.getLogger(__name__)

@shared_task
def update_user_status():
    timeout = timedelta(seconds=60)
    channel_layer = get_channel_layer()

    for user in CustomUser.objects.all():
        if user.last_activity:
            time_diff = timezone.now() - user.last_activity
        else:
            time_diff = timeout + timedelta(seconds=1)  
        if time_diff > timeout:
            if user.is_online:
                user.is_online = False
                user.status = "unavailable"
                user.save()
                async_to_sync(channel_layer.group_send)(
                    "test",
                    {
                        "type": "update_status",
                        "user": {
                            "id": user.id,
                            "status": user.status
                        }
                    }
                )
                async_to_sync(channel_layer.group_send)(
                    "friends_updates",
                    {
                        "type": "status_update",
                        "friend": {
                            "id": user.id,
                            "is_online": user.is_online
                        }
                    }
                )
        else:
            if not user.is_online:
                user.is_online = True
                user.status = "available"
                user.save()
                async_to_sync(channel_layer.group_send)(
                    "test",
                    {
                        "type": "update_status",
                        "user": {
                            "id": user.id,
                            "status": user.status
                        }
                    }
                )
                async_to_sync(channel_layer.group_send)(
                    "friends_updates",
                    {
                        "type": "status_update",
                        "friend": {
                            "id": user.id,
                            "is_online": user.is_online
                        }
                    }
                )
                
    return f"Updated users statuses online/offline. {CustomUser.objects.filter(is_online=True).count()} users are online."
