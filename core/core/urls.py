from django.contrib import admin
from django.urls import path
from accounts.views import loginpage
from labs.views import RMS, indexpage , alrms
urlpatterns = [
    path('' , indexpage , name='home'),
    path('amsRtzui/', admin.site.urls),
    path('login', loginpage , name='login'),
    path('RMS/' , RMS , name='rms'),
    path('api/alrms-up/',  alrms , name='arl' ),
]
