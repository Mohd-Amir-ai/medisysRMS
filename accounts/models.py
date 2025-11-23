from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db import models
from django.contrib.auth import get_user_model

class CustomUser(AbstractUser):
    """
    Minimal custom user for Medisys POC.
    Username = hospital_id
    Password = hospital password
    """

    hospital_id = models.CharField(max_length=100, unique=True)  # used as login username
    hospital_address = models.CharField(max_length=255, blank=True)

    machine_ids = models.JSONField(default=list, blank=True)

    USERNAME_FIELD = 'hospital_id'

    def __str__(self):
        return self.hospital_id


User = get_user_model()

