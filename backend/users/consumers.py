from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
from asgiref.sync import sync_to_async
from .models import CustomUser, GameRequest , Friendship , Game , GameHistory, BlockedUser
from channels.db import database_sync_to_async
logger = logging.getLogger(__name__)
from django.utils import timezone
import asyncio
import random
from django.db.models import Q
from django.core.cache import cache
from .serializers import UserSerializer
from django.core.exceptions import ObjectDoesNotExist

@sync_to_async
def get_custom_user(user_id):
    try:
        return CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        logger.error(f"CustomUser with id {user_id} does not exist.")
        return None

@sync_to_async
def save_game_request(game_request):
    try:
        game_request.save()
    except Exception as e:
        logger.error(f"Error saving game request: {str(e)}")

@database_sync_to_async
def fetch_pending_requests(user):
    return GameRequest.objects.filter(receiver=user, status='pending').select_related('sender')


@database_sync_to_async
def create_game(gamerequest, status: str, action: str, state: str, winner: str = None) -> int:
    """
    Creates a new game or retrieves game data based on the action.

    :param gamerequest: GameRequest object containing sender and receiver.
    :param status: The status of the game.
    :param action: Action to perform ('new_game' or 'get_game_data').
    :return: ID of the created game or None.
    """
    try:
        if action == 'new_game':
            if not gamerequest.sender or not gamerequest.receiver:
                logger.error("Game request missing sender or receiver.")
                return None

            logger.info(f"Creating new game between {gamerequest.sender} and {gamerequest.receiver}.")
            
            new_game = Game(
                player1=gamerequest.sender,
                player2=gamerequest.receiver,
                winner=winner,  # No winner initially since the game hasn't started
                state=state,
                status=status,
                created_at=timezone.now(),
                updated_at=timezone.now()
            )
            new_game.save()
            return new_game.id  # Return the ID of the newly created game

        elif action == 'get_game_data':
            logger.info("Fetching game data is not yet implemented.")
            return None

        else:
            logger.error(f"Invalid action provided: {action}.")
            return None

    except GameRequest.DoesNotExist:
        logger.error("GameRequest does not exist.")
        return None
    except Exception as e:
        logger.error(f"Unexpected error in create_game: {str(e)}")
        return None
    


from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.layers import get_channel_layer
from django.core.cache import cache
from asgiref.sync import sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        self.user = self.scope['user']
        
        users_key = f"{self.room_group_name}_users"
        users = await self.get_users_from_cache(users_key) or []
        
        if self.user.username not in users:
            users.append(self.user.username)
        await self.set_users_to_cache(users_key, users)
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'users': users,
            }
        )
        await self.accept()

    async def disconnect(self, close_code):
        users_key = f"{self.room_group_name}_users"
        users = await self.get_users_from_cache(users_key) or []
        if self.user.username in users:
            users.remove(self.user.username)
            await self.set_users_to_cache(users_key, users)
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_left',
                'users': users,
            }
        )
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    @sync_to_async
    def get_users_from_cache(self, users_key):
        return cache.get(users_key)

    @sync_to_async
    def set_users_to_cache(self, users_key, users):
        return cache.set(users_key, users)
    
    @sync_to_async
    def remove_user_from_cache(self, users_key):
        return cache.delete(users_key)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_id = text_data_json['message_id']
        sender = text_data_json['sender']
        message = text_data_json['message']
        timestamp = text_data_json['timestamp']

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message_id': message_id,
                'sender': sender,
                'message': message,
                'timestamp': timestamp
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message_id': event['message_id'],
            'sender': event['sender'],
            'message': event['message'],
            'timestamp': event['timestamp']
        }))

    async def user_joined(self, event):
        users = await self.get_users_from_cache(f"{self.room_group_name}_users") or []
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'users': users,
        }))

    async def user_left(self, event):
        users = await self.get_users_from_cache(f"{self.room_group_name}_users") or []
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'users': users,
        }))


@database_sync_to_async
def get_custom_user(user_id):
    try:
        return CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        logger.error(f"CustomUser with id {user_id} does not exist.")
        return None

@sync_to_async
def save_game_request(game_request):
    try:
        game_request.save()
    except Exception as e:
        logger.error(f"Error saving game request: {str(e)}")

@database_sync_to_async
def fetch_pending_requests_data(user):
    """Fetch pending requests and return them as tuples."""
    pending_requests = GameRequest.objects.filter(receiver=user, status='pending').select_related('sender')
    return [
        (
            request.id,
            request.sender.username,
            request.receiver.username,
            request.status,
        )
        for request in pending_requests
    ]

import asyncio

@database_sync_to_async
def update_game_request_status(game_request_id, status):
    try:
        game_request = GameRequest.objects.get(id=game_request_id)
        game_request.status = status
        game_request.save()
        return game_request
    except GameRequest.DoesNotExist:
        return None


@database_sync_to_async
def checkif_sent_meor(user1, user2):
    return GameRequest.objects.filter(Q(sender=user1, receiver=user2) | Q(sender=user2, receiver=user1), status='pending').exists()



class GameRequestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            logger.warning("Unauthenticated user tried to connect.")
            await self.close()
            return

        self.user_group_name = f"user_{self.user.id}"
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.user_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'send_play_notification':
            receiver_id = data.get('receiver_id')
            await self.handle_send_play_notification(receiver_id)
        elif action == 'get_pending_requests':
            await self.send_pending_requests()
        elif action == 'accept_request':
            game_request_id = data.get('game_request_id')
            await self.handle_update_request_status(game_request_id, 'accepted')
        elif action == 'reject_request':
            game_request_id = data.get('game_request_id')
            await self.handle_update_request_status(game_request_id, 'rejected')
        elif action == 'send_game_request_notification':
            await self.send_game_request_notification(data)
      

    async def handle_send_play_notification(self, receiver_id):
        if not receiver_id:
            await self.send(text_data=json.dumps({
                'status': 'failure',
                'message': 'Receiver ID not provided.',
            }))
            return

        receiver = await get_custom_user(receiver_id)
        if receiver is None:
            await self.send(text_data=json.dumps({
                'status': 'failure',
                'message': 'Receiver not found.',
            }))
            return
        existing_request = await sync_to_async(
            lambda: GameRequest.objects.filter(sender=self.user, receiver_id=receiver_id, status='pending').exists()
        )()

        if existing_request:
            await self.send(text_data=json.dumps({
                'status': 'failure',
                'message': 'A game request is already pending for this user.',
            }))
            return
        already_sent = await checkif_sent_meor(self.user, receiver)
        if already_sent:
            await self.send(text_data=json.dumps({
                'status': 'failure',
                'message': 'sent a request to this user. or already recieved a request',
            }))
            return

        try:
            game_request = GameRequest(sender=self.user, receiver=receiver)
            await save_game_request(game_request)
            await self.send(text_data=json.dumps({
                'status': 'success',
                'message': 'Game request sent successfully!',
            }))
            
            await self.channel_layer.group_send(
                f"user_{receiver_id}",
                {
                    'type': 'game_request_notification',
                    'game_request_id': game_request.id,
                    'sender': self.user.username,
                    'receiver': receiver.username,  
                    'status': 'pending',  
                }
            )
        except Exception as e:
            logger.error(f"Error processing game request: {str(e)}")
            await self.send(text_data=json.dumps({
                'status': 'failure',
                'message': 'An error occurred while processing your game request.',
            }))



    async def handle_update_request_status(self, game_request_id, status):
        updated_game_request = await update_game_request_status(game_request_id, status)

        game_request = updated_game_request 

        if game_request is None:
                await self.send(text_data=json.dumps({
                    'status': 'failure',
                    'message': 'Game request not found or could not be updated.',
                }))
                return

        sender_group_name = f"user_{await sync_to_async(lambda: game_request.sender.id)()}"
        if game_request:
            sender_group_name = f"user_{game_request.sender.id}"
            if status == 'accepted':
                notification_message = f"{self.user.username} has accepted your game request!"
            else:
                notification_message = f"{self.user.username} has {status} your game request."
            await self.send(text_data=json.dumps({
                'status': 'success',
                'message': f'Game request {status} successfully!',
            }))
            if status == 'accepted':
                game_id = await create_game(game_request, status, 'new_game', 'onprogress')
                await self.send(text_data=json.dumps({
                    'type': 'game_request_status_update',
                    'game_request_id': game_id,
                }))
                await self.channel_layer.group_send(
                sender_group_name,
                {
                    'type': 'game_request_status_update',
                    'game_request_id': game_id,
                    'status': status,
                    'receiver': self.user.username,
                    'message': notification_message,
                }
            )
        else:
            await self.send(text_data=json.dumps({
                'status': 'failure',
                'message': 'Game request not found or could not be updated.',
            }))

    async def send_game_request_notification(self, event):
        game_request_id = event.get('game_request_id')
        sender = event.get('sender')
        receiver = event.get('receiver')
        status = event.get('status')
        logger.debug(f"Sending game request notification: game_request_id={game_request_id}, sender={sender}, receiver={receiver}, status={status}")

        await self.send(text_data=json.dumps({
            'type': 'game_request_notification',
            'id': game_request_id,
            'sender': sender,
            'receiver': receiver,
            'status': status,
        }))


    async def game_request_status_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_request_status_update',
            'game_request_id': event.get('game_request_id'),
            'status': event.get('status'),
            'receiver': event.get('receiver'),
            'message': event.get('message'),
        }))
        



    async def send_pending_requests(self):
        if self.user.is_authenticated:
            try:
                pending_requests = await fetch_pending_requests_data(self.user)
                for request in pending_requests:
                    await self.send(text_data=json.dumps({
                        'type': 'game_request_notification',
                        'id': request[0],
                        'sender': request[1],
                        'receiver': request[2],
                        'status': request[3],
                    }))
            except Exception as e:
                logger.error(f"Error sending pending requests: {str(e)}")
                await self.send(text_data=json.dumps({
                    'status': 'failure',
                    'message': 'An error occurred while sending pending requests.',
                }))
        else:
            await self.send(text_data=json.dumps({
                'status': 'failure',
                'message': 'User not authenticated.',
            }))






############ Friends Request Consumer ####################

@database_sync_to_async
def get_custom_user(user_id):
    try:
        return CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        logger.error(f"CustomUser with id {user_id} does not exist.")
        return None


@sync_to_async
def save_friendship_request(friendship):
    try:
        friendship.save()
    except Exception as e:
        logger.error(f"Error saving friendship request: {str(e)}")


@database_sync_to_async
def update_game_request_status(game_request_id, status):
    try:
        game_request = GameRequest.objects.get(id=game_request_id)
        game_request.status = status
        game_request.save()
        return game_request
    except GameRequest.DoesNotExist:
        logger.error(f"GameRequest with id {game_request_id} does not exist.")
        return None
    except Exception as e:
        logger.error(f"Error updating game request: {str(e)}")
        return None
@database_sync_to_async
def update_friendship_request_status(friendship_request_id, status):
    try:
        friendship_request = Friendship.objects.get(id=friendship_request_id)
        friendship_request.status = status
        friendship_request.save()
        return friendship_request
    except Friendship.DoesNotExist:
        logger.error(f"Friendship with id {friendship_request_id} does not exist.")
        return None
    except Exception as e:
        logger.error(f"Error updating friendship request: {str(e)}")
        return None



# Fetch pending friendship requests
@database_sync_to_async
def fetch_pending_friendship_requests_data(user):
    """Fetch pending friendship requests and return them as tuples."""
    pending_requests = Friendship.objects.filter(to_user=user, status='pending').select_related('from_user')
    return [
        (
            request.id,
            request.from_user.username,
            request.to_user.username,
            request.status,
        )
        for request in pending_requests
    ]
@database_sync_to_async
def check_if_already_friend(user1, user2):
    return Friendship.objects.filter(Q(from_user=user1, to_user=user2) | Q(from_user=user2, to_user=user1), status='accepted').exists()
#check if already recieved a request
@database_sync_to_async
def check_if_already_recieved_request(user1, user2):
    return Friendship.objects.filter(from_user=user2, to_user=user1, status='pending').exists()
@database_sync_to_async
#check if already sent a request
def check_if_already_sent_request(user1, user2):
    return Friendship.objects.filter(from_user=user1, to_user=user2, status='pending').exists()

@database_sync_to_async
def fetch_friends_data(user):
    """Fetch all friends where the user is either the sender or the receiver."""
    friends_from_user = Friendship.objects.filter(
        from_user=user, status='accepted'
    ).select_related('to_user')
    friends_to_user = Friendship.objects.filter(
        to_user=user, status='accepted'
    ).select_related('from_user')
    
    # Combine and format results
    friends = [
        (friend.to_user.id, friend.to_user.username) for friend in friends_from_user
    ] + [
        (friend.from_user.id, friend.from_user.username) for friend in friends_to_user
    ]
    return friends


@database_sync_to_async
def get_friends_list(user):
    friends = Friendship.objects.filter(
        Q(from_user=user) | Q(to_user=user),
        status='accepted'
    )
    friends_list = []
    for friend in friends:
        if friend.from_user == user:
            friends_list.append(friend.to_user)
        else:
            friends_list.append(friend.from_user)
    
    serializer = UserSerializer(friends_list, many=True)
    return serializer.data



@database_sync_to_async
def remove_friendship(user1, user2):
    friendship = Friendship.objects.filtert(
        Q(from_user=user1) & Q(to_user= user2) | Q(from_user=user2) & Q(to_user= user1) 
    )
@database_sync_to_async
def get_blocked_list(user):
    blocked_users = user.blocked_users.all()
    blocked_users_list = []
    for blocked_user in blocked_users:
        blocked_users_list.append(blocked_user.blocked_user.username)
    return blocked_users_list

@database_sync_to_async
def get_friendship(user1, user2):
    friendship = Friendship.objects.filter(
        (Q(from_user=user1) & Q(to_user=user2)) | (Q(from_user=user2) & Q(to_user=user1))
    ).first()
    return friendship

@database_sync_to_async
def get_blocked_user(user, blocked_user):
    return BlockedUser.objects.filter(user=user, blocked_user=blocked_user).first()


@sync_to_async
def get_custom_user_By_name(username):
    try:
        return CustomUser.objects.get(username=username)
    except CustomUser.DoesNotExist:
        logger.error(f"CustomUser with id {username} does not exist.")
        return None







@database_sync_to_async
def getBlocked(user, blocked_user):
    blocked = BlockedUser.objects.filter(Q(user=user) & Q(blocked_user=blocked_user) | Q(user=blocked_user) & Q(blocked_user=user)).first()
    return blocked









class FriendshipRequestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            logger.warning("Unauthenticated user tried to connect.")
            await self.close()
            return

        self.user_group_name = f"user_{self.user.id}"
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.user_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'send_friend_request':
            receiver_id = data.get('receiver_id')
            await self.handle_send_friend_request(receiver_id)
        elif action == 'get_pending_friend_requests':
            await self.send_pending_friend_requests()
        elif action == 'accept_friend_request':
            friendship_request_id = data.get('friend_request_id')
            await self.handle_update_friend_request_status(friendship_request_id, 'accepted')
        elif action == 'reject_friend_request':
            friendship_request_id = data.get('friend_request_id')
            await self.handle_update_friend_request_status(friendship_request_id, 'rejected')
        elif action == 'send_friend_request_notification':
            await self.send_friend_request_notification(data)
        elif action == 'get_friends':
            friends = await get_friends_list(self.user)
            await self.send(text_data=json.dumps({
                'type': 'friends_list',
                'friends': friends,
            }))
        elif action == 'remove_friend':
            friend_id = data.get('friend_id')
            await self.remove_friend(friend_id)
        elif action == 'block_friend':
            friend_id = data.get('friend_id')
            await self.block_friend(friend_id)
        elif action == 'unblock_friend':
            username = data.get('username')
            await self.unblock_friend(username)
        elif action == 'get_blocked_friends':
            blocked_users_list = await get_blocked_list(self.user)
            await self.send(text_data=json.dumps({
                'type': 'blocked_friends',
                'blocked_users': blocked_users_list,
            }))

    
    async def remove_friend(self, friend_id):
        friend = await get_custom_user(friend_id)
        if friend:
            removed = await remove_friendship(self.user, friend)
        
            if removed:
                channel_layer = get_channel_layer()
                await channel_layer.group_send(
                    "friends_updates",
                    {
                        "type": "friend_removed",
                        "friend": {
                            "id": friend_id,
                        }
                    }
                )
                

    async def handle_send_friend_request(self, receiver_id):
        if not receiver_id:
            await self.send(text_data=json.dumps({
                'status': 'failure',
                'message': 'Receiver ID not provided.',
            }))
            return

        

        receiver = await get_custom_user(receiver_id)
        if receiver is None:
            await self.send(text_data=json.dumps({
                'status': 'failure',
                'message': 'Receiver not found.',
            }))
            return

        if await check_if_already_friend(self.user, receiver):
                await self.send(text_data=json.dumps({
                    'status': 'failure',
                    'message': 'You are already friends.',
                }))
                return
        if await check_if_already_sent_request(self.user, receiver) or await check_if_already_recieved_request(self.user, receiver):

                if await check_if_already_sent_request(self.user, receiver):
                    await self.send(text_data=json.dumps({
                    'status': 'failure',
                    'message': 'You have already sent a request to this user.',
                }))
                    return
                else:
                    await self.send(text_data=json.dumps({
                    'status': 'failure',
                    'message': 'You have already recieved a request from this user.',
                }))
                    return
        try:
            friendship_request = Friendship(from_user=self.user, to_user=receiver)
            await save_friendship_request(friendship_request)
            await self.send(text_data=json.dumps({
                'status': 'success',
                'message': 'Friendship request sent successfully!',
            }))
            await self.channel_layer.group_send(
                f"user_{receiver_id}",
                {
                    'type': 'send_friend_request_notification',
                    'friendship_request_id': friendship_request.id,
                    'sender': self.user.username,
                }
            )
           

        except Exception as e:
            logger.error(f"Error processing friendship request: {str(e)}")
            await self.send(text_data=json.dumps({
                'status': 'failure',
                'message': 'An error occurred while processing your friendship request.',
            }))

    async def handle_update_friend_request_status(self, friend_req_id, status):
        try:
            updated_friendship_request = await update_friendship_request_status(friend_req_id, status)
            friendship_request = updated_friendship_request  # No `await` needed here

            sender_group_name = f"user_{await sync_to_async(lambda: friendship_request.from_user.id)()}"
            if friendship_request:
                if status == 'accepted':
                    notification_message = f"{self.user.username} has accepted your friend request!"
                else:
                    notification_message = f"{self.user.username} has {status} your friend request."
                
                await self.channel_layer.group_send(
                    sender_group_name,
                    {
                        'type': 'friend_request_status_update',
                        'friendship_request_id': friendship_request.id,
                        'status': status,
                        'receiver': self.user.username,
                        'message': notification_message,
                    }
                )

                await self.send(text_data=json.dumps({
                    'status': status,
                    'message': f'Friend request {status} successfully!',
                }))
            else:
                await self.send(text_data=json.dumps({
                    'status': 'failure',
                    'message': 'Friend request not found or could not be updated.',
                }))
        except Exception as e:
            logger.error(f"Error updating friendship request: {str(e)}")
            await self.send(text_data=json.dumps({
                'status': 'failure',
                'message': 'An error occurred while updating the friendship request.',
            }))


    async def send_friend_request_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'friend_request_notification',
            'id': event.get('friendship_request_id'),
            'sender': event.get('sender'),
            'receiver': self.user.username,
            'status': 'pending',
            
        }))

    async def friend_request_status_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'friend_request_status_update',
            'id': event.get('friendship_request_id'),
            'status': event.get('status'),
            'receiver': event.get('receiver'),
            'message': event.get('message'),
        }))

    async def send_pending_friend_requests(self):
        if self.user.is_authenticated:
            try:
                # Fetch pending friend requests asynchronously
                pending_requests = await fetch_pending_friendship_requests_data(self.user)
                
                if pending_requests:
                    # Send each pending request to the client
                    for request in pending_requests:
                        await self.send(text_data=json.dumps({
                            'type': 'pending_friend_request_notification',
                            'id': request[0],
                            'sender': request[1],
                            'receiver': request[2],
                            'status': request[3],
                        }))
                else:
                    # Optionally, send a message if no pending requests
                    await self.send(text_data=json.dumps({
                        'status': 'no_requests',
                        'message': 'No pending friend requests.',
                    }))
            except Exception as e:
                logger.error(f"Error sending pending requests: {str(e)}")
                await self.send(text_data=json.dumps({
                    'status': 'failure',
                    'message': 'An error occurred while sending pending requests.',
                }))
        else:
            await self.send(text_data=json.dumps({
                'status': 'failure',
                'message': 'User not authenticated.',
            }))

    async def block_friend(self, friend_id):
        try:
            friend = await get_custom_user(friend_id)
            if not friend:
                await self.send(text_data=json.dumps({
                    'status': 'failure',
                    'message': 'Friend not found.',
                }))
                return

            blocked = await get_blocked_user(self.user, friend)
            if blocked:
                await self.send(text_data=json.dumps({
                    'status': 'failure',
                    'message': 'Friend is already blocked.',
                }))
                return

            blocked_user = BlockedUser(user=self.user, blocked_user=friend)
            friendship = await get_friendship(self.user, friend)
            await sync_to_async(blocked_user.save)()
            if friendship and friendship.status == 'accepted':
                friendship.status = 'blocked'
                await save_friendship_request(friendship)
            list_friends = await get_friends_list(friend)
            new_list = await get_friends_list(self.user)
            channel_layer = get_channel_layer()
            await channel_layer.group_send(
                "friends_updates",
                {
                    "type": "friend_removed",
                    "friend": {
                        "id": friend_id,
                    }
                }
            )


        except Exception as e:
            logger.error(f"Error blocking friend: {str(e)}")
            await self.send(text_data=json.dumps({
                'status': 'failure',
                'message': 'An error occurred while blocking the friend.',
            }))

    async def unblock_friend(self, data):
        try:
            username = data
            if not username:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Username is required.',
                }))
                return
            user_to_unblock = await get_custom_user_By_name(username)
            if not user_to_unblock:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'User not found.',
                }))
                return

            blocked_user = await get_blocked_user(self.user, user_to_unblock)
            if blocked_user:
                friendship = await get_friendship(self.user, user_to_unblock)
                if friendship:
                    await sync_to_async(friendship.delete)()
                await sync_to_async(blocked_user.delete)()
                blocked_friends = await get_blocked_list(self.user)
                await self.send(text_data=json.dumps({
                    'type': 'friend_unblocked',
                    'blocked_users': list(blocked_friends),
                }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'User is not blocked.',
                }))
        except Exception as e:
            logger.error(f"Error unblocking friend: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'An error occurred while unblocking the friend.',
            }))

    async def friend_blocked(self, event):
        await self.send(text_data=json.dumps({
            'type': 'friend_blocked',
            'friend': event['friend'],
        }))

    async def friend_unblocked(self, event):
        await self.send(text_data=json.dumps({
            'type': 'friend_unblocked',
            'blocked_list': event['blocked_list'],
        }))



##################### GAME


@database_sync_to_async
def update_user_scoreand_level(username):
    try:
        user = CustomUser.objects.get(username=username)
        user.score += 100
        if user.score >= 1000:
            user.level += 1
            user.score = 0
        user.save()
    except CustomUser.DoesNotExist:
        logger.error(f"CustomUser with username {username} does not exist.")
    except Exception as e:
        logger.error(f"Error updating user score and level: {str(e)}")



@database_sync_to_async
def create_game_history(user, game_data, opponent, result, score):
    try:
        game = Game.objects.get(id=game_data['id'])
  
        user_statistics = user.statistics or [0, 0, 0]
        user_statistics[0] += 1
        if result == 'won':
            user_statistics[1] += 1
        if result == 'lost':
            user_statistics[2] += 1
        user.statistics = user_statistics
        user.save()

        game_history = GameHistory(
            user=user,
            game=game,
            opponent=opponent,
            result=result,
            score=score,
            timestamp=timezone.now()
        )
        game_history.save()
    except ObjectDoesNotExist:
        logger.error(f"Game with ID {game_data['id']} does not exist.")
        raise
    except Exception as e:
        logger.error(f"Error creating game history: {str(e)}")
        logger.debug(f"User: {user}, Game Data: {game_data}, Opponent: {opponent}, Result: {result}, Score: {score}")
        raise e  # Re-raise the exception to catch it in the outer layer for debugging


@database_sync_to_async
def get_game_state(game_id):
    """Fetch the current game state from the database."""
    game = Game.objects.filter(id=game_id).first()
    if not game:
        return None
    return {
        "id": game.id,
        "player1": game.player1.username,
        "player2": game.player2.username,
        "state": game.state,
        "winner": game.winner.username if game.winner else None,
        "status": game.status,
    }

@database_sync_to_async
def update_game_state(game_id, game_state):
    game = Game.objects.filter(id=game_id).first()
    winner = (CustomUser.objects.get)(username=game_state['winner']) if game_state['winner'] else None
    if not game:
        return None
    game.state = game_state['state']
    game.status = game_state['status']
    game.winner = winner
    game.save()
    print("game : ",game)
    return game

DEFAULT_PADDLE_POSITION = [0, 0.2, 2.5]
class PongGameConsumer(AsyncWebsocketConsumer):
    async def initialize_paddles(self):
        paddles = await self.get_paddle()
        if paddles:
            await self.remove_paddle()
            paddles = None
        paddles = {
            'player1': DEFAULT_PADDLE_POSITION,
            'player2': DEFAULT_PADDLE_POSITION
        }
        await self.set_paddle(paddles)
            
    @sync_to_async
    def update(self, player, paddle_position):
        try:
            paddles = cache.get(f"game_{self.game_id}_paddle")  
            paddles[player] = paddle_position
            cache.set(f"game_{self.game_id}_paddle", paddles)
        except Exception as e:
            return None

    @sync_to_async
    def set_paddle(self, paddles):
        try:
            cache.set(f"game_{self.game_id}_paddle", paddles)
        except Exception as e:
            return None

    @sync_to_async
    def get_paddle(self):
        try:
            return cache.get(f"game_{self.game_id}_paddle")
        except Exception as e:
            return None

    @sync_to_async
    def remove_paddle(self):
        try:
            paddle = cache.get(f"game_{self.game_id}_paddle")
            if paddle:
                return cache.delete(f"game_{self.game_id}_paddle")
            else:
                return None
        except Exception as e:
            return None

    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = f'game_{self.game_id}'
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        self.ball_position = [0, 0.2, 0]
        self.velocity = [0.010, 0, 0.1]
        self.player2_score = 0
        self.player1_score = 0
        self.max_score = 10
        
        await self.initialize_paddles()
        self.player1_paddle = DEFAULT_PADDLE_POSITION
        self.player2_paddle = DEFAULT_PADDLE_POSITION

        try:
            game_state = await get_game_state(self.game_id)
            if not game_state:
                await self.close()
        except Exception as e:
            await self.close()
    
    async def disconnect(self, code):
        await self.player_disconnected()
        if hasattr(self, 'task') and not self.task.done():
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        await super().disconnect(code)
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action')

            if action == 'get_game_state':
                await self.send_game_state()
            elif action == 'start_game':
                await self.start_game(data)
            elif action == 'update_paddle':
                await self.update_paddle(data)
            elif action == "update_ball":
                await self.update_ball()
            elif action == 'end_game':
                await self.end_game(data)
        except Exception as e:
            await self.send(text_data=json.dumps({
                'status': 'error',
                'message': 'Invalid data received.',
            }))
    
    async def update_ball(self):
        
        game_state = await get_game_state(self.game_id)
        if not game_state:
            await self.send(text_data=json.dumps({
                'status': 'failure',
                'message': 'Game not found.',
            }))
            return
        player1 = game_state['player1']
        player2 = game_state['player2']
        fps = 60
        frame_delay = 1 / fps
        table_width = 1.5
        table_length = 3
        
        while True:
            try:
                if self.player1_score >= self.max_score or self.player2_score >= self.max_score:
                    game_state['status'] = 'completed'
                    game_state['state'] = 'ended'
                    winner_username = player1 if self.player1_score >= self.max_score else player2
                    loser_username = player2 if winner_username == player1 else player1
                    
                    winner_score = self.player1_score if winner_username == player1 else self.player2_score
                    loser_score = self.player2_score if winner_username == player1 else self.player1_score
                    await update_user_scoreand_level(winner_username)
                    try:
                        winner = await database_sync_to_async(CustomUser.objects.get)(username=winner_username)
                        loser = await database_sync_to_async(CustomUser.objects.get)(username=loser_username)
                        game_state['winner'] = winner
                        await update_game_state(self.game_id, game_state)
                        game = await get_game_state(self.game_id)
                        await create_game_history(winner, game, loser, 'won', winner_score)
                        await create_game_history(loser, game, winner, 'lost', loser_score)
                    
                        
                    except CustomUser.DoesNotExist:
                        break
                    
                    break
                
                self.ball_position[0] += self.velocity[0]
                self.ball_position[1] += self.velocity[1]
                self.ball_position[2] += self.velocity[2]

                if self.ball_position[0] >= table_width or self.ball_position[0] <= -table_width:
                    self.velocity[0] *= -1

                if self.ball_position[2] >= table_length or self.ball_position[2] <= -table_length:
                    self.velocity[2] *= -1

                def check_collision(paddle_position, ball_position):
                    paddle_width = 0.8
                    paddle_height = 0.1
                    paddle_depth = 0.2

                    ball_radius = 0.1

                    
                    paddle_min = [
                        paddle_position[0] - paddle_width / 2,
                        paddle_position[1] - paddle_height / 2,
                        paddle_position[2] - paddle_depth / 2,
                    ]
                    paddle_max = [
                        paddle_position[0] + paddle_width / 2,
                        paddle_position[1] + paddle_height / 2,
                        paddle_position[2] + paddle_depth / 2,
                    ]
                    
                    ball_min = [
                        ball_position[0] - ball_radius,
                        ball_position[1] - ball_radius,
                        ball_position[2] - ball_radius,
                    ]
                    ball_max = [
                        ball_position[0] + ball_radius,
                        ball_position[1] + ball_radius,
                        ball_position[2] + ball_radius,
                    ]
                    return (
                        paddle_min[0] <= ball_max[0] and
                        paddle_max[0] >= ball_min[0] and
                        paddle_min[1] <= ball_max[1] and
                        paddle_max[1] >= ball_min[1] and
                        paddle_min[2] <= ball_max[2] and
                        paddle_max[2] >= ball_min[2]
                    )
                
                ball = [-self.ball_position[0], self.ball_position[1], -self.ball_position[2]]
                paddle = await self.get_paddle()
                self.player1_paddle = paddle['player1']
                self.player2_paddle = paddle['player2']
                
                if check_collision(self.player1_paddle , self.ball_position):
                    self.velocity[2] = -abs(self.velocity[2])
                    self.velocity[0] += (self.ball_position[0] - self.player1_paddle[0]) * 0.02
                elif check_collision(self.player2_paddle , ball):
                    self.velocity[2] = abs(self.velocity[2])
                    self.velocity[0] += (self.ball_position[0] - self.player2_paddle[0]) * 0.02

        
                if self.ball_position[2] > table_length:
                    self.player2_score += 1
                    self.ball_position = [0, 0.2, 0]
                    self.velocity = [0.010, 0, 0.1]
                elif self.ball_position[2] < -table_length:
                    self.player1_score += 1
                    self.ball_position = [0, 0.2, 0] 
                    self.velocity = [-0.010, 0, -0.1]
                   

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'broadcast',
                        'sender': self.user.username,
                        'command': 'ball_update',
                        'message': {
                            'position_player1': self.ball_position,
                            'position_player2': ball,
                            'score_player1': self.player1_score,
                            'score_player2': self.player2_score,
                        },
                    }
                )
                await asyncio.sleep(frame_delay)
            except Exception as e:
                await self.send(text_data=json.dumps({
                    'status': 'error',
                    'message': str(e),
                }))
                break

    async def update_paddle(self, data):
        try:
            new_position = data.get('position')
            game_state = await get_game_state(self.game_id)
            if not game_state:
                await self.send(text_data=json.dumps({
                    'status': 'failure',
                    'message': 'Game not found.',
                }))
                return
            if self.user.username == game_state['player1']: 
                await self.update('player1', new_position)
            elif self.user.username == game_state['player2']:
                await self.update('player2', new_position)
            else:
                return
        
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'broadcast',
                    'sender': self.user.username,
                    'command': 'paddle_update',
                    'message': {
                        'paddle': 'opponent',
                        'position': new_position,
                    },
                }
            )
            
        except Exception as e:
            await self.send(text_data=json.dumps({
                'status': 'error',
                'message': 'An unexpected error occurred.',
            }))

    async def send_game_state(self):
        try:
            game_state = await get_game_state(self.game_id)
            if game_state:
                await self.send(text_data=json.dumps({
                    'type': 'game_state',
                    'game_state': game_state,
                }))
            else:
                await self.send(text_data=json.dumps({
                    'status': 'failure',
                    'message': 'Game not found.',
                }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'status': 'error',
                'message': 'Failed to fetch game state.',
            }))

    async def start_game(self, data):
        try:
            game_state = await get_game_state(self.game_id)
            if game_state:
                game_state['state'] = 'started'
                await update_game_state(self.game_id, game_state)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'broadcast',
                        'sender': self.user.username,
                        'command': 'game_started',
                        'message': 'The game has started!',
                    }
                )
                self.task = asyncio.create_task(self.update_ball())
            else:
                await self.send(text_data=json.dumps({
                    'status': 'failure',
                    'message': 'Game not found.',
                }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'status': 'error',
                'message': 'Failed to start the game.',
            }))

    async def broadcast(self, event):
        try:
            sender = event.get('sender')
            command = event.get('command')
            if command == 'paddle_update' and sender == self.user.username:
                return

            await self.send(text_data=json.dumps({
                'command': event.get('command'),
                'message': event.get('message'),
            }))
        except Exception as e:
           return 

    async def update_game_state(self):
        while True:
            try:
                game_state = await get_game_state(self.game_id)
                if game_state:
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'broadcast',
                            'sender': None,
                            'command': 'update_game_state',
                            'message': game_state,
                        }
                    )
                await asyncio.sleep(1)  
            except asyncio.CancelledError:
                break
            except Exception as e:
                return

 

    async def end_game(self, data):
        try:
            game_state = await get_game_state(self.game_id)
            if game_state:
                game_state['state'] = 'ended'
                game_state['status'] = 'completed'
                game_state['winner'] = self.user

                await update_game_state(self.game_id, game_state)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'broadcast',
                        'sender': self.user.username,
                        'command': 'game_ended',
                        'message': f'The game has ended! {self.user.username} wins!',
                    }
                )
            else:
                await self.send(text_data=json.dumps({
                    'status': 'failure',
                    'message': 'Game not found.',
                }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'status': 'error',
                'message': 'Failed to end the game.',
            }))
    async def player_disconnected(self):
        try:
            game_state = await get_game_state(self.game_id)
            if not game_state:
                return False
            if game_state['state'] != 'started':
                    return False
            if self.user.username == game_state['player1']:
                winner_username = game_state['player2']
            elif self.user.username == game_state['player2']:
                winner_username = game_state['player1']
            else:
                return False
            try:
                winner = await database_sync_to_async(CustomUser.objects.get)(username=winner_username)
            except CustomUser.DoesNotExist:
                return False
            try:
                game_instance = await get_game_state(self.game_id)
                game_instance['state'] = 'ended'
                game_instance['status'] = 'completed'
                game_instance['winner'] = winner
                await update_game_state(self.game_id, game_instance)
                winner_score = 10
                loser_score = 0
                await create_game_history(winner, game_instance, self.user, 'won', winner_score)
                await create_game_history(self.user, game_instance, winner, 'lost', loser_score)
                await update_user_scoreand_level(winner_username)
                

            except Exception as e:
                return False

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'broadcast',
                    'sender': self.user.username,
                    'command': 'player_disconnected',
                    'message': {
                        'winner': winner.username,
                        'message': f'Congratulations {winner.username}! You won because your opponent {self.user.username} left the game.',
                    }
                }
            )
            return True

        except Exception as e:
            return False