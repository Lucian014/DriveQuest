import requests
from django.contrib.auth import authenticate
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie, csrf_protect
from .models import Car, Contact, Car_Rental, Comment
from django.contrib.auth import get_user_model,login,authenticate,login as django_login
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse
from django.contrib.auth import get_user_model, login as django_login,logout as django_logout
from django.core.exceptions import ValidationError
import json
from datetime import datetime

@ensure_csrf_cookie
def csrf_token(request):
    csrf_token = get_token(request)
    return JsonResponse({'csrfToken': csrf_token})


@csrf_protect
def signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        username = data.get('username')
        if email is not None and password is not None:
            User = get_user_model()
            if User.objects.filter(email=email).exists():
                return JsonResponse({'message': 'Email already used'}, status=400)
            if User.objects.filter(username=username).exists():
                return JsonResponse({'message': 'Username already used'}, status=400)
            try:
                user = User.objects.create_user(
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    username=username,
                )
            except ValidationError as e:
                return JsonResponse({'message': str(e)}, status=400)
            django_login(request, user)
            request.session.set_expiry(6 * 3600)
            user_data = {
                'email':email,
                'first_name':first_name,
                'last_name':last_name,
                'username':username,
            }
            return JsonResponse({'user': user_data}, status=201)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)




@csrf_protect
def login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)

        email = data.get('email')
        password = data.get('password')

        if not (email and password):
            return JsonResponse({'message': 'Email and password required'}, status=400)

        user = authenticate(request, email=email, password=password)
        if user is not None:
            django_login(request, user)
            # Setează sesiunea pentru 6 ore (6 * 3600 secunde)
            request.session.set_expiry(6 * 3600)

            # Nu expune parola (chiar dacă e hash-uită) în răspuns
            user_data = {
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_superuser': user.is_superuser,
            }
            return JsonResponse({'message': 'User logged in successfully', 'user': user_data}, status=200)
        else:
            return JsonResponse({'message': 'Invalid Credentials'}, status=400)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)

@csrf_exempt
def logout(request):
    if request.method == "POST":
        django_logout(request)
        return JsonResponse({'message': 'User logged out successfully'}, status=200)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)


@login_required
def profile(request):
    if request.method == "GET":
        user = request.user
        return JsonResponse({'user':{
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'firstName': user.first_name,
            'lastName': user.last_name,
            'profile_picture': request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
            'points':user.points,
            'xp':user.XP,
        }}, status=200)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)


def update_profile(request, user_id):
    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({'message': 'User does not exist'}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        user.first_name = data.get('firstName', user.first_name)
        user.last_name = data.get('lastName', user.last_name)
        user.username = data.get('username', user.username)
        user.save()

        return JsonResponse({
            'message': 'User updated successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'firstName': user.first_name,
                'lastName': user.last_name,
                'profile_picture': user.profile_picture.url if user.profile_picture else None
            }
        }, status=200)

    elif request.method == "POST":
        profile_picture = request.FILES.get("profile_picture")
        if profile_picture:
            user.profile_picture = profile_picture
            user.save()
            return JsonResponse({
                'message': 'Image uploaded successfully',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'firstName': user.first_name,
                    'lastName': user.last_name,
                    'profile_picture': user.profile_picture.url if user.profile_picture else None
                }
            }, status=200)
        else:
            return JsonResponse({'message': 'No image provided'}, status=400)

    elif request.method == "DELETE":
        if user.profile_picture:
            user.profile_picture.delete(save=True)
            return JsonResponse({'message': 'Image deleted successfully'}, status=200)
        else:
            return JsonResponse({'message': 'No image to delete'}, status=404)

    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)


def get_cars(request, car_id=None):
    if request.method == "GET":
        cars= Car.objects.all()
        cars_data = []
        for car in cars:
            cars_data.append({
                'id': car.id,
                'brand': car.brand,
                'model': car.model,
                'year': car.year,
                'price': car.price,
                'image': car.image.url if car.image else None
            })
        return JsonResponse(cars_data, safe=False)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

def car_details(request, car_id):
    if request.method == 'GET':
        car = Car.objects.get(id=car_id)
        rent =Car_Rental.objects.filter(car=car).first()
        rented = False
        end_date = None
        if rent is not None:
            rented = True
            end_date = rent.end_date
        comments = Comment.objects.filter(car=car)
        comments_data = []
        for comment in comments:
            comments_data.append({
                'id': comment.id,
                'comment': comment.comment,
                'date': comment.date,
                'username': comment.user.username,
            })
        return JsonResponse({'car':{
            'id': car.id,
            'brand': car.brand,
            'model': car.model,
            'year': car.year,
            'price': car.price,
            'image': car.image.url if car.image else None,
            'rented': rented,
            'end_date': end_date if end_date else None
        }, 'comments': comments_data}, status=200)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)

def post_comment(request, car_id):
    if request.method == "POST":
        data = json.loads(request.body)
        user = request.user
        car = Car.objects.get(id=car_id)
        comment = data.get('comment')
        date = datetime.now()
        comment = Comment.objects.create(
            user=user,
            car=car,
            comment=comment,
            date=date,
        )
        return JsonResponse({
            'comment': {
                'id': comment.id,
                'username': comment.user.username,  # Assuming 'username' is the field you want
                'car': comment.car.id,  # Include car ID or relevant details
                'comment': comment.comment,
                'date': comment.date.strftime('%Y-%m-%d %H:%M:%S'),  # Format the date
            }
        }, status=200)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)

@login_required
def contact(request):
    if request.method == "POST":
        user = request.user
        data = json.loads(request.body)
        title = data.get('title')
        message = data.get('message')
        phone = data.get('phone')
        contact = Contact.objects.create(
            user=user,
            title=title,
            message=message,
            phone=phone,
        )
        return JsonResponse({'message': 'Contact created successfully'}, safe=False)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

@login_required
def car_rental(request, car_id=None):
    user = request.user
    if request.method == "POST":
        car = Car.objects.get(id=car_id)
        data = json.loads(request.body)
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        days = data.get('days')
        price = data.get('price')
        payment_method = data.get('payment_method')
        points = data.get('points')
        user.points += points
        user.XP += points
        user.save()
        car.popularity += 1
        car.save()
        Car_Rental.objects.create(
            user=user,
            car=car,
            start_date=start_date,
            end_date=end_date,
            days=days,
            price=price,
            payment_method=payment_method,
        )

        return JsonResponse({'message': 'Car rental created successfully'}, safe=False)

    elif request.method == "GET":
        rentals = Car_Rental.objects.filter(user=user).select_related('car')
        rental_list = [{
            'id': rental.id,
            'car_id': rental.car.id,
            'brand': rental.car.brand,
            'model': rental.car.model,
            'year': rental.car.year,
            'image': rental.car.image.url if rental.car.image else None,
            'start_date': rental.start_date,
            'end_date': rental.end_date,
            'days': rental.days,
            'price': rental.price,
        } for rental in rentals]

        return JsonResponse(rental_list, safe=False)

    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


@login_required
def user(request):
    if request.method == "GET":
        user = request.user
        return JsonResponse({'user':{
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'firstName': user.first_name,
            'lastName': user.last_name,
            'is_superuser': user.is_superuser,
            'points': user.points,
            'xp': user.XP,
            'profile_picture': user.profile_picture.url if user.profile_picture else None,
        }}, status=200)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)

def delete_comment(request, comment_id):
    if request.method == "DELETE":
        Comment.objects.filter(id=comment_id).delete()
        return JsonResponse({'message': 'Comment deleted successfully'}, status=200)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)