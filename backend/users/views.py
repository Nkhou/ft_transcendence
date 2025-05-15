from django.contrib.auth import authenticate # type: ignore
from rest_framework import status, generics # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q 
from rest_framework.generics import CreateAPIView
from rest_framework.decorators import api_view
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync 
from django.http import HttpResponse
import os
from datetime import datetime
from django.conf import settings
from rest_framework.parsers import MultiPartParser, JSONParser
from .models import CustomUser, Conversation, Message, Friendship , GameRequest ,Game ,GameHistory ,BlockedUser
from .serializers import UserSerializer, ConversationSerializer, MessageSerializer, FriendshipSerializer ,GameHistorySerializer 
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated , AllowAny
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from io import BytesIO
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from channels.layers import get_channel_layer
from django.shortcuts import render
from django.contrib.auth.hashers import check_password
from django.http import JsonResponse
from django.utils.http import urlsafe_base64_decode
from django.core.mail import EmailMessage
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.conf import settings
import random
import string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
import requests
from django.http import JsonResponse, HttpResponseRedirect
from django.core.files.storage import default_storage
from django.template.loader import render_to_string
#force text
try:
    from django.utils.encoding import force_str
except ImportError:
    from django.utils.encoding import force_text




import logging

logger = logging.getLogger(__name__)
class UserView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    def get(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, *args, **kwargs):
        logger.info(f"Request data: {request.data}") 
        user = self.get_object()
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            logger.info(f"Valid data: {serializer.validated_data}")
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            logger.error(f"Errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_object(self):
        return CustomUser.objects.get(pk=self.kwargs['pk'])

    def delete(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
            user.delete()
            return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class DataUserByUsername(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, username):
        try:
            user = CustomUser.objects.get(username=username)
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        email = request.data.get('email')
        if CustomUser.objects.filter(username=username).exists():
            return Response({"error": "Username is already taken."})
        if CustomUser.objects.filter(email=email).exists():
            return Response({"error": "Email is already in use."})
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors)


    
class TokenValidationView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        # Extract the token from the 'access' cookie
        token = request.COOKIES.get('access')
        if not token:
            return Response(
                {'message': 'Invalid token'},
                status=status.HTTP_200_OK
            )

        try:
            # Validate the token using JWTAuthentication
            JWTAuthentication().get_validated_token(token)
            return Response(
                {'message': 'Token is valid'},
                status=status.HTTP_200_OK
            )
        except InvalidToken:
            return Response(
                {'message': 'Invalid token'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'message': 'Invalid token'},
                status=status.HTTP_404_NOT_FOUND
            )
        

        
#  najat 
def generateOTP():
    otp = ''.join(random.choices(string.digits, k=6))
    return otp


class activeTwoFactor(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        # Extract the parameter explicitly
        is_active = request.data.get('is_activeTwoFactor')
        if is_active == None:
            return Response({"message": "is_activeTwoFactor is required"}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        user.is_activeTwoFactor = is_active
        user.save()
        return Response({
            "message": "Two Factor Authentication status updated"
        }, status=status.HTTP_200_OK)



class deactiveTwoFactor(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.data.get('is_activeTwoFactor')
        if user == None:
            return Response({"message": "is_activeTwoFactor is required"}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        user.is_activeTwoFactor = False
        user.otp = None
        user.otp_time = None
        user.save()
        return Response({"message": "Two Factor Authentication is deactivated"}, status=status.HTTP_200_OK)
class loginwithtwoFactor(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        objects = CustomUser.objects.all()
        user = None
        for obj in objects:
            if obj.username == username:
                user = obj
                break
        if not user:
            return Response({"message": "B"})
        if user.is_activeTwoFactor == True:
            detail = {"Two Factor Authentication is activated. Please enter the otp sent to your email"}
            # userprofile = CustomUser.objects.get(username=username)
            codeVerify = generateOTP()
            user.otp = codeVerify
            user.otp_time = timezone.now() + timedelta(minutes=5)
            user.save()
            sender_email = os.environ.get('EMAIL_HOST_USER1')
            html_message = render_to_string('otp.html', {
                'user': user,
                'codeVerify': codeVerify,
            })
            msg = EmailMessage('OTP Verification', html_message, sender_email, [user.email])
            msg.content_subtype = "html"
            msg.send()
            return Response({"message": "A"})

        return Response({"message": "B"})
class ResetOtp(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        if not username:
            return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({"message": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        #user = request.user
        codeVerify = generateOTP()
        user.otp = codeVerify
        user.otp_time = timezone.now() + timedelta(minutes=5)
        user.save()
        sender_email = os.environ.get('EMAIL_HOST_USER1')
        html_message = render_to_string('otp.html', {
            'user': user,
            'codeVerify': codeVerify,
        })
        msg = EmailMessage('OTP Verification', html_message, sender_email, [user.email])
        msg.content_subtype = "html"
        msg.send()
        return Response({"message": "OTP sent successfully"}, status=status.HTTP_200_OK)


class verifyTwoFactor(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        otp = request.data.get('otp')
        if not username or not password or not otp:
            return Response({"message": "Username, password and otp are required"}, status=status.HTTP_400_BAD_REQUEST)
        user = CustomUser.objects.get(username=username)
        if not user:
            return Response({"message": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
        if not check_password(password, user.password):
            return Response({"message": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
        if otp == user.otp and user.otp_time > timezone.now():
            refresh = RefreshToken.for_user(user)
            user.is_online = True
            user.otp = None
            user.otp_time = None
            user.save()
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            response = JsonResponse({'message': 'Login successful'})
            response.set_cookie(
                key='access', 
                value=access_token, 
                expires=timezone.now() + timedelta(days=1),

                secure=True,    
                # samesite='Strict'  # SameSite protection
            )
            response.set_cookie(
                key='refresh',
                value=str(refresh),
                # httponly=True,
                secure=True,
                # samesite='Strict'
            )
            return response
        else:
            return Response({"message": "Invalid otp"}, status=status.HTTP_400_BAD_REQUEST)

########## END OF NAJAT ####################



########## START OF ABEL-HID ####################



class ForgetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = CustomUser.objects.get(email=email)
            token = PasswordResetTokenGenerator().make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            host = os.environ.get('HOST')
            reset_link = f"https://{host}/forgotten/reset/{uid}/{token}"
            html_message = render_to_string('index.html', {
                'user': user,
                'reset_link': reset_link,
            })
            msg = EmailMessage('[PING PONG] Please reset your password', html_message, settings.EMAIL_HOST_USER, [email])
            msg.content_subtype = "html"
            msg.to = [email]
            msg.send()
            return Response({'message': 'Password reset email sent.'}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"An error occurred: {e}")
            return Response({'error': 'An error occurred. Please try again later.'}, status=status.HTTP_400_BAD_REQUEST)



class ValidResetPasswordToken(APIView):
    permission_classes = [AllowAny]
    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
            if PasswordResetTokenGenerator().check_token(user, token):
                return Response({'message': 'Valid token. You can reset your password.'}, status=200)
            else:
                logger.warning(f"Invalid or expired token for user ID: {uid}")
                return Response({'error': 'Invalid or expired token.'}, status=400)
        except (CustomUser.DoesNotExist, ValueError, TypeError) as e:
            logger.error(f"Error validating reset password token: {str(e)}")
            return Response({'error': 'Invalid or expired token.'}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error during password reset validation: {str(e)}")
            return Response({'error': 'An unexpected error occurred.'}, status=400)
        
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, uidb64, token):
        password = request.data.get('password')
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
            if PasswordResetTokenGenerator().check_token(user, token):
                user.set_password(password)
                user.save()
                return JsonResponse({'message': 'Password reset successfully.'}, status=200)
            else:
                return JsonResponse({'error': 'Invalid or expired token.'}, status=400)
        except CustomUser.DoesNotExist:
            return JsonResponse({'error': 'User not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': 'An error occurred. Please try again later.'}, status=400)

########## END OF ABEL-HID ####################


    

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)





class LoginIntra42(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get('code')
        if not code:
            return Response({'error': 'Authorization code is missing'}, status=status.HTTP_400_BAD_REQUEST)
        host = os.environ.get('HOST')
        data = {
            'grant_type': 'authorization_code',
            'client_id': os.environ.get('CLIENT_ID'),
            'client_secret': os.environ.get('CLIENT_SECRET'),
            'code': code,
            'redirect_uri': f'https://{host}/api/users/Login42/',
        }
        try:
            response = requests.post('https://api.intra.42.fr/oauth/token', data=data)
            if response.status_code != 200:
                return Response({'error': 'Failed to exchange code for token', 'details': response.json()}, status=400)

            token_data = response.json()
            access_token = token_data.get('access_token')
            if not access_token:
                return Response({'error': 'Access token not received'}, status=400)

            user_info_response = requests.get(
                'https://api.intra.42.fr/v2/me',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            if user_info_response.status_code != 200:
                return Response({'error': 'Failed to fetch user info', 'details': user_info_response.json()}, status=400)
            user_data = user_info_response.json()
            try:
                user = CustomUser.objects.get(username=user_data['login'])
            except CustomUser.DoesNotExist:
                user = CustomUser.objects.create_user(
                    username=user_data['login'],
                    email=user_data.get('email', 'email'),
                    password='intra42', 
                )
                image_url = user_data.get('image', {}).get('link', '')
                if image_url:
                    img_response = requests.get(image_url)
                    if img_response.status_code == 200:
                        img = BytesIO(img_response.content)
                        img_name = f'{user.username}_profile.jpg'
                        user.profile_picture.save(img_name, ContentFile(img.read()), save=True)
                user.is_online = True
                user.save()
            
            refresh = RefreshToken.for_user(user)
            response = HttpResponseRedirect(f'https://{host}/dashboard')
            response.set_cookie(
                key='access',
                value=str(refresh.access_token),
                # httponly=True,
                secure=True,
                samesite='None'
            )
            response.set_cookie(
                key='refresh',
                value=str(refresh),
                # httponly=True,
                secure=True,
            )
            return response

        except requests.exceptions.RequestException as e:
            return Response({'error': 'An unexpected error occurred', 'details': str(e)}, status=400)
        except Exception as e:
            return Response({'error': 'An unexpected error occurred', 'details': str(e)}, status=400)
        

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user is not None:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            response = JsonResponse({'message': 'Login successful'})
            response.set_cookie(
                key='access', 
                value=access_token, 
                expires=timezone.now() + timedelta(days=1),
                # httponly=True,
                secure=True,  
                # samesite='Strict'
            )
            response.set_cookie(
                key='refresh',
                value=str(refresh),
                # httponly=True,
                secure=True,
                # samesite='Strict'
            )
            return response
        
        return JsonResponse({"detail": "Invalid credentials"})


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh')
        if not refresh_token:
            return Response({'message': 'Refresh token is missing'})

        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            response = JsonResponse({'message': 'Token refreshed'})
            response.set_cookie(
                key='access',
                value=access_token,
                expires=timezone.now() + timedelta(days=1),
                secure=True,
                # samesite='Strict'
            )


            return response
        except Exception as e:
            return Response({'message': 'Invalid refresh token'})

        

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.user
        user.is_online = False
        user.save()
        return Response({"message": "User logged out successfully"}, status=status.HTTP_200_OK)



class FriendsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        friends = Friendship.objects.filter(Q(from_user=request.user) | Q(to_user=request.user), status='accepted')
        friends_list = []
        for friend in friends:
            if friend.from_user == request.user:
                friends_list.append(friend.to_user)
            else:
                friends_list.append(friend.from_user)
        serializer = UserSerializer(friends_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class currentUser(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class allUsers(APIView):
    def get(self, request):
        name_query = request.query_params.get('name', None)
        if name_query:
            users = CustomUser.objects.filter(username__icontains=name_query)
        else:
            users = CustomUser.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class allNotBlockedUsers(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        blocked_users1 = BlockedUser.objects.filter(user=self.request.user).values_list('blocked_user', flat=True)
        blocked_users2 = BlockedUser.objects.filter(blocked_user=self.request.user).values_list('user', flat=True)
        all_blocked_user_ids = list(blocked_users1) + list(blocked_users2)
        blocked_users = CustomUser.objects.filter(id__in=all_blocked_user_ids)
        serializer = UserSerializer(blocked_users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(participants=request.user).distinct()
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        participants = request.data.get('participants')
        if not participants:
            return Response({'error': 'Participants are required'}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.id not in participants:
            participants.append(request.user.id)
        possible_conversations = Conversation.objects.annotate(num_participants=Count('participants')).filter(num_participants=len(participants))

        for conversation in possible_conversations:
            conversation_participants = list(conversation.participants.values_list('id', flat=True))
            if set(conversation_participants) == set(participants):
                serializer = ConversationSerializer(conversation)
                return Response(serializer.data, status=status.HTTP_200_OK)

        serializer = ConversationSerializer(data=request.data)
        if serializer.is_valid():
            conversation = serializer.save()
            conversation.participants.add(*participants)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MessageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id=None):
        if conversation_id:
            messages = Message.objects.filter(conversation_id=conversation_id)
        else:
            conversations = Conversation.objects.filter(participants=request.user).values_list('id', flat=True)
            messages = Message.objects.filter(conversation_id__in=conversations)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, conversation_id=None):
        if not conversation_id:
            return Response({"error": "Conversation ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        data['conversation'] = conversation_id
        data['sender'] = request.user.id

        serializer = MessageSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        if not old_password or not new_password:
            return Response({'error': 'Old password and new password are required'}, status=status.HTTP_400_BAD_REQUEST)
        if not check_password(old_password, user.password):
            return Response({'error': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)

class CountUnreadMessages(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, friend_id):
        user = request.user
        conversation = Conversation.objects.filter(participants__id=friend_id).filter(participants=user).first()
        if(not conversation):
            return Response({'count': 0}, status=status.HTTP_200_OK)
        messages = conversation.messages.filter(is_read=False).exclude(sender=user)
        count = messages.count()
        return Response({'count': count}, status=status.HTTP_200_OK)

class MarkMessagesAsRead(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, conversation_id):
        user = request.user
        conversation = Conversation.objects.get(id=conversation_id)
        messages = conversation.messages.filter(is_read=False).exclude(sender=user)
        messages.update(is_read=True)
        return Response({'message': 'Messages marked as read'}, status=status.HTTP_200_OK)



class Update_last_activity(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.user
        user.last_activity = timezone.now()
        user.save()
        return Response({'message': 'Last activity updated'}, status=status.HTTP_200_OK)

class UpdateStatus(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request):
        user = request.user
        status_text = request.data.get('status')
        if not status_text:
            return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)
        user.status = status_text
        user.save()
        channel_layer = get_channel_layer()
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
        return Response({'message': 'Status updated'}, status=status.HTTP_200_OK)


class UpdateEmail(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request):
        user = request.user
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        user.email = email
        user.save()
        return Response({'message': 'Email updated'}, status=status.HTTP_200_OK)

class GetGameHistory(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            game_history = GameHistory.objects.filter(user=request.user)

            if not game_history.exists():
                return Response([], status=status.HTTP_200_OK) 

            serializer = GameHistorySerializer(game_history, many=True)
            serialized_data = serializer.data

            for game in serialized_data:
                timestamp = game.get("timestamp")
                if timestamp:
                    datetime_obj = datetime.fromisoformat(timestamp)
                    game["formatted_time"] = datetime_obj.strftime("%Y-%m-%d %H:%M")

            return Response(serialized_data, status=status.HTTP_200_OK)

        except Exception:
            pass 




class GlobalRanking(APIView):
    def get(self, request):
        try:
            users = list(
                CustomUser.objects.values("username", "level")
                .order_by("-level")  
            )
            for index, user in enumerate(users, start=1):
                user["rank"] = index

            return JsonResponse(users, safe=False, status=200)

        except Exception as e:
            return JsonResponse(
                {"error": f"An error occurred: {str(e)}"}, status=404
            )


