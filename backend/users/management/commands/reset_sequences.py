from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Resets the auto-increment sequences for all models'

    def handle(self, *args, **kwargs):
        with connection.cursor() as cursor:
            # Find sequences for all tables
            cursor.execute("""
                SELECT sequence_name
                FROM information_schema.sequences
                WHERE sequence_schema = 'public'
            """)
            sequences = cursor.fetchall()

            for sequence in sequences:
                sequence_name = sequence[0]
                table_name = sequence_name.rsplit('_', 2)[0]  # Remove '_id_seq' suffix
                table_name = table_name.replace('_', '')  # Adjust if needed to match your table names

                # Reset sequence to the max id in the table + 1
                cursor.execute(f"""
                    SELECT setval('{sequence_name}', COALESCE(MAX(id), 1) + 1, FALSE)
                    FROM {table_name}
                """)
                self.stdout.write(self.style.SUCCESS(f'Sequence {sequence_name} reset.'))
