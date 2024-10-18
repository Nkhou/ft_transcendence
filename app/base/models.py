from django.db import models
from django.contrib.auth.models import User

class MyModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

# class Customer(models.Model):
#     name = models.CharField("Name", max_length=240)
#     email = models.EmailField()
#     created = models.DateField(auto_now_add=True)

#     def __str__(self):
#         return self.name