from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now
from django.contrib.postgres.fields import ArrayField



def get_default_statistics():
    return [0, 0, 0]
class CustomUser(AbstractUser):
    username = models.CharField(max_length=255, unique=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    email = models.EmailField(max_length=255, unique=True)
    level = models.IntegerField(default=1) # to be imported from the game
    collation = models.CharField(max_length=255, null=True, blank=True)
    score = models.IntegerField(default=0) # to be imported from the game
    bio = models.TextField(null=True, blank=True, default="Beat me if you can!")
    is_online = models.BooleanField(default=False)
    is_activeTwoFactor = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, null=True, blank=True)
    otp_time = models.DateTimeField(null=True, blank=True)
    last_activity = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=255, default="Available")
    statistics = models.JSONField(default=get_default_statistics)
    statistics = models.JSONField(default=get_default_statistics)
    
    groups = [
    ]
    def __str__(self):
        return self.username



class BlockedUser(models.Model):
    user = models.ForeignKey(CustomUser, related_name='blocked_users', on_delete=models.CASCADE)
    blocked_user = models.ForeignKey(CustomUser, related_name='blocked_by_users', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user_id} blocked {self.blocked_user_id}"


class Friendship(models.Model):
    from_user = models.ForeignKey(CustomUser, related_name='friendship_requests_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(CustomUser, related_name='friendship_requests_received', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, default='pending') 
    created_at = models.DateTimeField(auto_now_add=True)
    is_online = models.BooleanField(default=True)
    # def __str__(self):
    #     return f"{self.from_user_id} -> {self.to_user_id} ({self.status})"


class Conversation(models.Model):
    participants = models.ManyToManyField(CustomUser, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'
        ordering = ['-created_at']

    def __str__(self):
        return f'Conversation {self.id}'

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages', db_index=True)
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, db_index=True)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['timestamp']

    def __str__(self):
        return f'Message {self.id} from {self.sender}, Read: {self.is_read}'


class GameRequest(models.Model):
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="sent_requests", db_column="from_user_id")
    receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="received_requests", db_column="to_user_id")
    status = models.CharField(max_length=10, default='pending')
    created_at = models.DateTimeField(default=now)



class Game(models.Model):
    player1 = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="player1")
    player2 = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="player2")
    winner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="winner", null=True, blank=True)
    state = models.CharField(max_length=50, default="default_state_value")
    status = models.CharField(max_length=50, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    
    def __str__(self):
        return f"{self.player1} vs {self.player2} - Winner: {self.winner if self.winner else 'Pending'}"

class GameHistory(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="game_history")
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="game_histories")
    opponent = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="opponent_histories")
    result = models.CharField(max_length=10, choices=[('won', 'Won'), ('lost', 'Lost')])
    score = models.IntegerField(default=0) 
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'game')
    def __str__(self):
        return f"{self.user.username} vs {self.opponent.username} - {self.result} ({self.timestamp})"


