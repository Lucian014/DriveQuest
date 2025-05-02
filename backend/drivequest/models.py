from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser, PermissionsMixin
from django.db import models
from django.db.models import Avg

# Create your models here.

class CustomUserManager(BaseUserManager):
    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self,email=None,password=None,**extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self._create_user(email,password,**extra_fields)

    def _create_user(self,email,password=None,**extra_fields):
        user = self.model(email=email,**extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

class User(AbstractUser,PermissionsMixin):
    email = models.EmailField(max_length=255,unique=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    username = models.CharField(max_length=255,unique=True)
    is_staff = models.BooleanField(default=False)
    dater_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    profile_picture = models.ImageField(upload_to='user_images/',blank=True,null=True)
    points = models.PositiveIntegerField(default=0)
    XP = models.PositiveIntegerField(default=0)
    stars = models.PositiveIntegerField(default=10)
    prize1 = models.BooleanField(default=False)
    prize2 = models.BooleanField(default=False)
    prize3 = models.BooleanField(default=False)
    prize4 = models.BooleanField(default=False)
    prize5 = models.BooleanField(default=False)
    instagram = models.CharField(max_length=255,blank=True,null=True)
    tiktok = models.CharField(max_length=255,blank=True,null=True)
    twitter = models.CharField(max_length=255,blank=True,null=True)
    linkedin = models.CharField(max_length=255,blank=True,null=True)
    objects = CustomUserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']


class Contact(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    message = models.TextField()
    phone = models.CharField(max_length=100)

class Car(models.Model):
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    price = models.FloatField()
    year = models.IntegerField()
    image = models.ImageField(upload_to='car_images/',blank=True, null=True)
    popularity = models.PositiveIntegerField(default=0)
    CAR_TYPE = [
        ('Unknown', 'Unknown'),
        ('Sedan','Sedan'),
        ('SUV','SUV'),
        ('Hatchback','Hatchback'),
        ('Electric','Electric'),
        ('Convertible','Convertible'),
        ('Hybrid','Hybrid'),
        ('Sports','Sports'),
        ('Luxury','Luxury'),
        ('Pickup','Pickup'),
    ]
    car_type = models.CharField(default='Unknown',choices=CAR_TYPE,max_length=14)
    center = models.ForeignKey('RentalCenter', on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self):
        return f"{self.brand} {self.model}"

    @property
    def average_rating(self):
        # Aggregate average from related ratings.
        return self.ratings.aggregate(avg=Avg('rating'))['avg'] or 0

class CarRating(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name="ratings")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()  # e.g., 1-5 scale

    class Meta:
        unique_together = ('car', 'user')  # Enforce one rating per user per car

    def __str__(self):
        return f"{self.user.username} rated {self.car} as {self.rating}"

class Car_Rental(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    car = models.ForeignKey(Car, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    days = models.IntegerField(default=0)
    price = models.FloatField()
    PAYMENT_METHOD = [
        ('None','None'),
        ('Cash','Cash'),
        ('PayPal','PayPal'),
        ('Credit Card','Credit Card'),
    ]
    payment_method = models.CharField(default='None',choices=PAYMENT_METHOD,max_length=11)

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    car = models.ForeignKey(Car, on_delete=models.CASCADE)
    comment = models.TextField()
    date = models.DateTimeField()


class RentalCenter(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    phone = models.CharField(max_length=100)
    image = models.ImageField(upload_to='rent_center_images/',blank=True, null=True)
    lat = models.FloatField()
    long = models.FloatField()

    def __str__(self):
        return self.name


class Bill(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    car_rental = models.ForeignKey(Car_Rental, on_delete=models.CASCADE)
    total_amount = models.FloatField()
    payment_method = models.CharField(max_length=20)
    from_date = models.DateField()
    due_date = models.DateField()
    pdf_file = models.FileField(upload_to='bills/', null=True, blank=True)

    def __str__(self):
        return f"Bill #{self.id} for {self.user.username}"


class OpeningHours(models.Model):
    DAYS_OF_WEEK = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday'),
    ]
    rental_center = models.ForeignKey(RentalCenter,on_delete=models.CASCADE)
    day = models.CharField(max_length=10,choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def str(self):
        return f"{self.get_day_display()}: {self.start_time} - {self.end_time}"