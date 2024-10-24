from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, LoginSerializer, MyTokenObtainPairSerializer
from .models import Player

# User Registration View
class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        db = Player.objects.all()
        if serializer.is_valid():
            for i in db:
                if i.email == serializer.validated_data['email']: # validated_data is used to access the validated data after validation.
                    return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)
                elif i.username == serializer.validated_data['username']:
                    return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
            db = Player.objects.create( # Create a new object in the Player model.
                username=serializer.validated_data['username'],
                email=serializer.validated_data['email'],
                first_name=serializer.validated_data['first_name'],
                last_name=serializer.validated_data['last_name'],
                password=serializer.validated_data['password'],
            )
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({"message": "User created successfully", 'access': str(refresh.access_token),
                    'refresh': str(refresh),}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# User Login View (Using JWT for authentication)
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        for i in Player.objects.all(): # Loop through all the objects in the Player model.
            if i.email == serializer.validated_data['username'] or i.name == serializer.validated_data['username']:
                serializer.validated_data['username'] = i.username
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password'],
            )
            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }, status=status.HTTP_200_OK)
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Custom JWT Token View
class MyTokenObtainPairView(APIView):
    def post(self, request):
        serializer = MyTokenObtainPairSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
