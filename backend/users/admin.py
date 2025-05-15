from django.contrib import admin
from .models import Conversation, Message ,CustomUser ,Friendship  , GameRequest ,Game ,GameHistory



@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at')
    search_fields = ('participants__username',)
    filter_horizontal = ('participants',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'content', 'timestamp')
    list_filter = ('conversation', 'sender', 'timestamp')
    search_fields = ('sender__username', 'content')
    ordering = ('-timestamp',)

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'level', 'collation', 'score','profile_picture' ,'password','bio','statistics')
    list_editable = ('level', 'collation', 'score','profile_picture' ,'password','bio','statistics')
    search_fields = ('username', 'email','level', 'collation', 'score')
    list_filter = ('level', 'collation', 'score')
    fields = ('username', 'email', 'level', 'collation', 'score', 'profile_picture', 'bio', 'password')





@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('id', 'from_user', 'to_user', 'status')
    list_filter = ('status',)
    search_fields = ('from_user__username', 'to_user__username')
    list_editable = ('status',)
    fields = ('from_user', 'to_user', 'status')


@admin.register(GameRequest)
class GameRequest(admin.ModelAdmin):
    list_display = ('id','sender','receiver','status')

@admin.register(Game)
class Gameadmin(admin.ModelAdmin):
    list_display = ('id','player1','player2','winner','state', 'status','created_at','updated_at')





@admin.register(GameHistory)
class GameHistoryadmin(admin.ModelAdmin):
    list_display = ('id','user','game','opponent','result','score','timestamp')