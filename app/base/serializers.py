from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)  # For password confirmation

    class Meta:
        model = User
        fields = ['username', 'email','first_name','last_name',  'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True},
            'first_name': {'write_only': True},
            'last_name': {'write_only': True},
            'email': {'write_only': True},
            'username': {'write_only': True},
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords must match.")
        elif User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError("Username already exists.")
        elif User.objects.filter(email=data.get('email', '')).exists():
            raise serializers.ValidationError("Email already exists.")
        elif User.objects.filter(first_name=data.get('first_name', '')).exists():
            raise serializers.ValidationError("first_name already exists.")
        # elif len(data['password']) < 8:
        #     raise serializers.ValidationError("Password must be at least 8 characters.")
        # elif len(data['username']) < 5 or len(data['username']) > 20:
        #     raise serializers.ValidationError("Username needs to be between 5 and 20 characters.")
        # elif len(data['first_name']) < 2 or len(data['first_name']) > 20:
        #     raise serializers.ValidationError("first_name needs to be between 2 and 20 characters.")
        # elif len(data['last_name']) < 2 or len(data['last_name']) > 20:
        #     raise serializers.ValidationError("last_name needs to be between 2 and 20 characters.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')  # Remove password2 before creating user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),  # Use get() here
            last_name=validated_data.get('last_name', '')
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class LogOutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token