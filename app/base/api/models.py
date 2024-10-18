from django.db import models

# Create your models here.

class base(models.Model):
        name = models.CharField("Name", max_lenth=240)
        email = models.EmailField()
        created = models.DateField(auto_now_add=True)

        def _str_(self):
                return self.name