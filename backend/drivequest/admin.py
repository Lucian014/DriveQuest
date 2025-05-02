from django.contrib import admin
from .models import Car, User, Contact, Car_Rental, Comment, RentalCenter, Bill

# Register your models here.

admin.site.register(User)
admin.site.register(Car)
admin.site.register(Contact)
admin.site.register(Car_Rental)
admin.site.register(Comment)
admin.site.register(RentalCenter)

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ('id','user','car_rental','total_amount','payment_method','from_date','due_date')