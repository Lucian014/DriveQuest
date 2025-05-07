from django.urls import path
from . import views

urlpatterns = [

    path('csrf-token/',views.csrf_token,name='csrf_token'),
    path('get_centers/', views.get_centers, name='get_centers'),
    path('center_details/<int:center_id>/', views.center_details, name='center_details'),
    path('cars/', views.get_cars, name='get_cars'),
    path('car_details/<int:car_id>/', views.car_details, name='car_details'),
    path('rate_car/<int:car_id>/', views.rate_car, name='rate_car'),
    path('search_cars/', views.search_cars, name='search_cars'),
    path('login',views.login,name='login'),
    path('logout', views.logout, name='logout'),
    path('signup',views.signup,name='signup'),
    path('update_profile/<int:user_id>/',views.update_profile,name='update_profile'),
    path('profile/',views.profile,name='profile'),
    path('contact/',views.contact,name='contact'),
    path('car_rental/', views.car_rental, name='car_rental'),
    path('car_rental/<int:car_id>/',views.car_rental,name='car_rental'),
    path('post_comment/<int:car_id>/',views.post_comment,name='post_comment'),
    path('user',views.user,name='user'),
    path('delete_comment/<int:comment_id>/',views.delete_comment,name='delete_comment'),
    path('calculate_rating/', views.calculate_rating, name='calculate_rating'),
    path('rate_website/', views.rate_website, name='rate_website'),
    path('claim_reward/<int:prize_number>/', views.claim_reward, name='claim_reward'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('bill_history/', views.bill_history, name='bill_history'),
    path('opening_hours/<int:center_id>/', views.opening_hours, name='opening_hours'),
    path('search_centers/',views.search_centers,name='search_centers'),
]