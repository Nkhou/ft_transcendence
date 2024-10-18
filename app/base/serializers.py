from django.cont.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerialiser):
        class Meta:
            model = User
            field = ['username', 'email', 'password', 'password2']
        
        def create(self, validated_data):
            user = User.objects.create_user(
                validated_data['username'],
                validated_data['email'],
                validated_data['password']
                validated_data['password2']
            )
            return user

class LoginSerializer(serializers.Serializer):
    username = serializers.Charfield()
    password = serializers.Charfield()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        return token