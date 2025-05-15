from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from users.models import CustomUser as User

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        raw_token = request.COOKIES.get('access')
        if not raw_token:
            print("No token found in cookies")
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except InvalidToken:
            print("Invalid token")
            return None

    def get_user(self, validated_token):
        user_id = validated_token['user_id']
        user = User.objects.get(id=user_id)
        return user
    
    

    