
# from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Friendship
from .models import Conversation, Message ,CustomUser , GameHistory
from .models import Friendship

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False) 
    profile_picture = serializers.ImageField(required=False)
   

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'profile_picture', 'level', 'collation', 'score', 'password', 'bio', 'is_online','is_activeTwoFactor' , 'status','statistics']
        extra_kwargs = {
            'password': {'write_only': True},
            'profile_picture': {'required': False},
            'email': {'required': False},
            'level': {'required': False},
            'collation': {'required': False},
            'score': {'required': False},
            'bio': {'required': False},
            'is_online' :{'required' :False},
            'is_activeTwoFactor': {'required': False},

        }

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email']
        )
        for attr, value in validated_data.items():
            if attr in ['profile_picture', 'level', 'collation', 'score', 'bio','is_online','is_activeTwoFactor', 'otp', 'otp_time']:
                setattr(user, attr, value)
        user.save()
        return user
    
    

    def put(self, instance, validated_data):
        for attr, value in validated_data.items():
            if attr in ['profile_picture', 'level', 'collation', 'score','is_activeTwoFactor', 'otp', 'otp_time']:
                setattr(instance, attr, value)
        instance.save()
        return instance

    
class ConversationSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), many=True)

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'created_at']

    def create(self, validated_data):
        participants = validated_data.pop('participants', [])
        conversation = super().create(validated_data)
        conversation.participants.set(participants)
        return conversation

class MessageSerializer(serializers.ModelSerializer): 
    sender = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    conversation = serializers.PrimaryKeyRelatedField(queryset=Conversation.objects.all())

    class Meta:
        model = Message
        fields = ['id', 'sender', 'conversation', 'content', 'timestamp']
        read_only_fields = ['timestamp']


    def create(self, validated_data):
        return super().create(validated_data)
    







class FriendshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friendship
        fields = ['id', 'from_user', 'to_user', 'status', 'created_at','is_online']



class GameHistorySerializer(serializers.ModelSerializer):
    user = UserSerializer()
    opponent = UserSerializer()

    class Meta:
        model = GameHistory
        fields = ['id', 'user', 'opponent', 'result', 'score', 'timestamp']
        
        ordering = ['-timestamp']
        depth = 2  # This will include nested relationships to a specified depth

# serializers.p


