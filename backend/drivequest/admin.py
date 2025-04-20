from django.contrib import admin
from .models import Car,User,Contact,Car_Rental

# Register your models here.

admin.site.register(User)
admin.site.register(Car)
admin.site.register(Contact)
admin.site.register(Car_Rental)