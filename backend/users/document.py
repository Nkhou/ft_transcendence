from django_elasticsearch_dsl import Document
from django_elasticsearch_dsl.registries import registry

from .models import CustomUser

@registry.register_document

class CustomUserDocument(Document):
    class Index:
        name = 'users'
        settings = {'number_of_shards': 1,
                    'number_of_replicas': 0}

    class Django:
        model = CustomUser
        fields = [
            'username',
            'email',
            'level',
            'collation',
            'score',
            'bio',
            'is_online',
            'is_activeTwoFactor',
            'otp',
            'otp_time',
            'last_activity',
            'status'
        ]