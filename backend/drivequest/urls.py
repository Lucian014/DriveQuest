from django.urls import path
from . import views

urlpatterns = [

    path('csrf-token/',views.csrf_token,name='csrf_token'),
    path('cars/', views.get_cars, name='get_cars'),
    path('car_details/<int:car_id>/', views.car_details, name='car_details'),
    path('login',views.login,name='login'),
    path('logout', views.logout, name='logout'),
    path('signup',views.signup,name='signup'),
    path('update_profile/<int:user_id>/',views.update_profile,name='update_profile'),
    path('profile/',views.profile,name='profile'),
    path('contact/',views.contact,name='contact'),
path('car_rental/', views.car_rental, name='car_rental'),
    path('car_rental/<int:car_id>/',views.car_rental,name='car_rental'),
]