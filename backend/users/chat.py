from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.layers import get_channel_layer

class UnreadCountConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.room_group_name = "test"
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get("type")

        if message_type == "update_status":
            user_data = text_data_json.get("user", {})
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "update_status",
                    "user": user_data
                }
            )
        elif message_type == "unread_count":
            unread = text_data_json.get("unread", 0)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "unread_count",
                    "unread": unread
                }
            )

    async def update_status(self, event):
        user = event["user"]
        await self.send(text_data=json.dumps({
            "type": "update_status",
            "user": user
        }))

    async def unread_count(self, event):
        unread = event["unread"]
        await self.send(text_data=json.dumps({
            "type": "unread_count",
            "unread": unread
        }))


class FriendsUpdateConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        await self.channel_layer.group_add(
            "friends_updates",  
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            "friends_updates",
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get("type")
        
        
        if message_type == "status_update":
            friend = text_data_json.get("friend", {})
            await self.channel_layer.group_send(
                "friends_updates",
                {
                    "type": "status_update",
                    "friend": friend
                }
            )
            
        if message_type == "friend_removed":
            friend = text_data_json.get("friend", {})
            await self.channel_layer.group_send(
                "friends_updates",
                {
                    "type": "friend_removed",
                    "friend": friend
                }
            )
            

    async def status_update(self, event):
        friend = event["friend"]
        await self.send(text_data=json.dumps({
            "type": "status_update",
            "friend": friend
        }))
    
    async def friend_removed(self, event):
        friend = event["friend"]
        await self.send(text_data=json.dumps({
            "type": "friend_removed",
            "friend": friend
        }))