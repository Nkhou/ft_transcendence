from django.urls import re_path, path
from .consumers import ChatConsumer
from .consumers import PongGameConsumer ,GameRequestConsumer ,FriendshipRequestConsumer
from .chat import UnreadCountConsumer , FriendsUpdateConsumer

websocket_urlpatterns = [
    path('ws/friends-updates/', FriendsUpdateConsumer.as_asgi()),
    path('ws/chat/unread-messages/', UnreadCountConsumer.as_asgi()),
    path('ws/chat/<conversation_id>/', ChatConsumer.as_asgi()),
    re_path(r'ws/game/(?P<game_id>\d+)/$', PongGameConsumer.as_asgi()),   
    path('ws/game-request/', GameRequestConsumer.as_asgi()),
    path('ws/friendship/', FriendshipRequestConsumer.as_asgi()),
]
 