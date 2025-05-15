# users/urls.py
from django.urls import path # type: ignore
from django.conf import settings # type: ignore
from django.conf.urls.static import static # type: ignore
from . import views
from .views import RegisterView, LoginView, currentUser, allUsers, FriendsListView,  ConversationView, MessageView, TokenValidationView, UserView, activeTwoFactor, verifyTwoFactor, deactiveTwoFactor, ResetOtp, loginwithtwoFactor, LogoutView
from .views import ForgetPasswordView , ResetPasswordView, ValidResetPasswordToken , MeView , LoginIntra42
from .views import DataUserByUsername, allNotBlockedUsers
from .views import DataUserByUsername, CountUnreadMessages, MarkMessagesAsRead , Update_last_activity, UpdateStatus, GetGameHistory

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('login/', LoginView.as_view(), name='login'),
    path('user/', currentUser.as_view(), name='user'),
    path('alluser/', allUsers.as_view(), name='alluser'),
    path('allNotBlocked/', views.allNotBlockedUsers.as_view(), name='allNotBlocked'),
    
    path('friends/', FriendsListView.as_view(), name='friends_list'),
    path('conversation/', ConversationView.as_view(), name='conversation_list'),
    path('messages/<int:conversation_id>/', MessageView.as_view(), name='message_by_conversation'),
    path('validate-token/', TokenValidationView.as_view(), name='validate-token'),
    path('users/<int:pk>/', UserView.as_view(), name='user-detail'),
    path ('me/', views.MeView.as_view(), name='me'),
    path('Login42/', LoginIntra42.as_view(), name='login-intra42'),
    path('update-email/', views.UpdateEmail.as_view(), name='update-email'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('refresh-token/', views.RefreshTokenView.as_view(), name='refresh-token'),
    #Najat 

    path('two-factor-auth/', activeTwoFactor.as_view(), name='two-factor-auth'),
    path('two-factor-auth/validate/', verifyTwoFactor.as_view(), name='two-factor-auth-validation'),
    path('two-factor-auth/disable/', deactiveTwoFactor.as_view(), name='two-factor-auth-disable'),
    path('reset-otp/', ResetOtp.as_view(), name='reset-otp'),
    path('two-factor-send-otp/', loginwithtwoFactor.as_view(), name='two-factor-send-otp'),

    #abel-hid
 
    path('forgot-password/', ForgetPasswordView.as_view(), name='forgot-password'),
    path('reset-password/<uidb64>/<token>/', ResetPasswordView.as_view(), name='reset-password'),
    path('validate-reset-password-token/<uidb64>/<token>/', ValidResetPasswordToken.as_view(), name='validate-reset-password-token'),
    path('userData/<str:username>/', DataUserByUsername.as_view(), name='user-detail'),
    path('<int:friend_id>/unread/', CountUnreadMessages.as_view(), name='count-unread-messages'),
    path('messages/<int:conversation_id>/mark-messages-as-read/', MarkMessagesAsRead.as_view(), name='mark-messages-as-read'),
    path('update-last-activity/', Update_last_activity.as_view(), name='update-last-activity'),
    path('update-status/', UpdateStatus.as_view(), name='update-status'),
    path('game-history/', GetGameHistory.as_view(), name='game-history'),
    path('global-ranking/', views.GlobalRanking.as_view(), name='global-ranking'),

    # these are the game related urls i need to add the socket logic
    # path('game/request/', GameRequestView.as_view(), name='game-request'),
    # path('game/request/respond/', AcceptRejectGameRequestView.as_view(), name='accept-reject-game-request'),
    # path('game/requests/', GameRequestsView.as_view(), name='game-requests'),
]


