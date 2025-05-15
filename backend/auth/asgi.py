"""
ASGI config for auth project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from users.routing import websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth.settings')

import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token
from users import consumers
from django.conf import settings
from django.urls import path
import jwt
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
import users.routing
User = get_user_model()

@database_sync_to_async
def get_user_from_jwt_token(token_key):
    try:
        payload = jwt.decode(token_key, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get('user_id')
        return User.objects.get(id=user_id)
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = dict((x.split('=') for x in scope['query_string'].decode().split('&')))
        token_key = query_string.get('token')
        scope['user'] = await get_user_from_jwt_token(token_key) if token_key else AnonymousUser()
        return await super().__call__(scope, receive, send)



application = ProtocolTypeRouter({
    "http": get_asgi_application(),  
    "websocket": AllowedHostsOriginValidator(  
        JWTAuthMiddleware(
            URLRouter(
                users.routing.websocket_urlpatterns
            )
        )
    ),
})






