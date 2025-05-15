from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.db import connection

@receiver(post_delete, sender=YourModel)
def reset_sequence(sender, **kwargs):
    with connection.cursor() as cursor:
        cursor.execute(f"""
            SELECT setval('{sender._meta.db_table}_id_seq', COALESCE(MAX(id), 1), FALSE)
            FROM {sender._meta.db_table}
        """)
