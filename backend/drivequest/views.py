import requests
from django.db.models import Q
from django.contrib.auth import authenticate
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie, csrf_protect
from .models import Car, Contact, Car_Rental, Comment, RentalCenter, CarRating, Bill,OpeningHour
from django.contrib.auth import get_user_model,login,authenticate,login as django_login
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse
from django.contrib.auth import get_user_model, login as django_login,logout as django_logout
from django.core.exceptions import ValidationError
import json
from datetime import datetime
from rapidfuzz import fuzz


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
            'instagram': user.instagram if user.instagram else "https://www.instagram.com",
            'tiktok': user.tiktok if user.tiktok else "https://www.tiktok.com",
            'twitter': user.twitter if user.twitter else "https://www.twitter.com",
            'linkedin': user.linkedin if user.linkedin else "https://www.linkedin.com",
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
        user.instagram = data.get('instagram', user.instagram)
        user.tiktok = data.get('tiktok', user.tiktok)
        user.twitter = data.get('twitter', user.twitter)
        user.linkedin = data.get('linkedin', user.linkedin)
        user.save()

        return JsonResponse({
            'message': 'User updated successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'firstName': user.first_name,
                'lastName': user.last_name,
                'profile_picture': user.profile_picture.url if user.profile_picture else None,
                'instagram': user.instagram if user.instagram else "https://www.instagram.com",
                'tiktok': user.tiktok if user.tiktok else "https://www.tiktok.com",
                'twitter': user.twitter if user.twitter else "https://www.twitter.com",
                'linkedin': user.linkedin if user.linkedin else "https://www.linkedin.com",
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
                    'profile_picture': user.profile_picture.url if user.profile_picture else None,
                    'instagram': user.instagram if user.instagram else "https://www.instagram.com",
                    'tiktok': user.tiktok if user.tiktok else "https://www.tiktok.com",
                    'twitter': user.twitter if user.twitter else "https://www.twitter.com",
                    'linkedin': user.linkedin if user.linkedin else "https://www.linkedin.com",
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


def get_centers(request):
    if request.method == "GET":
        centers = RentalCenter.objects.all()
        centers_data = []
        for center in centers:
            centers_data.append({
                'id': center.id,
                'name': center.name,
                'address': center.address,
                'city': center.city,
                'country': center.country,
                'phone': center.phone,
                'image': center.image.url if center.image else None,
                'latitude': center.lat,
                'longitude': center.long,
            })
        return JsonResponse(centers_data, safe=False)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


def center_details(request, center_id):
    if request.method == 'GET':
        center = RentalCenter.objects.get(id=center_id)
        cars = Car.objects.filter(center=center)

        car_list = []
        for car in cars:
            car_list.append({
                'id': car.id,
                'brand': car.brand,
                'model': car.model,
                'year': car.year,
                'price': car.price,
                'image': car.image.url if car.image else None,
                'car_type': car.car_type,
                'rating': car.average_rating if car.average_rating > 0 else "N/A",
            })

        return JsonResponse({
            'center': {
                'id': center.id,
                'name': center.name,
                'city': center.city,
                'address': center.address,
                'country': center.country,
                'phone': center.phone,
                'image': request.build_absolute_uri(center.image.url) if center.image else None,
                'latitude': center.lat,
                'longitude': center.long,
                'cars': car_list,
            }
        }, status=200)
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

def search_cars(request):
    if request.method == "GET":
        input_value = request.GET.get('searchInput')
        start_date = request.GET.get('startDate')
        end_date = request.GET.get('endDate')
        car_type = request.GET.get('carType')
        if request.GET.get('center_id'):
            cars=Car.objects.filter(center_id=request.GET.get('center_id'))
        else:
            cars = Car.objects.all()

        if input_value:
            cars = cars.filter(
                Q(brand__icontains=input_value) |
                Q(model__icontains=input_value)
            )

        if car_type:
            cars = cars.filter(car_type=car_type)

        if start_date:
            try:
                start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
                # Exclude cars that have rentals overlapping with the selected start date
                cars = cars.exclude(
                    car_rental__start_date__lte=start_date_obj,
                    car_rental__end_date__gte=start_date_obj
                )
            except ValueError:
                pass  # Ignore invalid date format

        if end_date:
            try:
                end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
                # Exclude cars that have rentals overlapping with the selected end date
                cars = cars.exclude(
                    car_rental__start_date__lte=end_date_obj,
                    car_rental__end_date__gte=end_date_obj
                )
            except ValueError:
                pass  # Ignore invalid date format

        cars = cars.distinct()

        cars_data = []
        for car in cars:
            cars_data.append({
                'id': car.id,
                'brand': car.brand,
                'model': car.model,
                'year': car.year,
                'price': car.price,
                'image': car.image.url if car.image else None,
                'car_type': car.car_type,
            })

        return JsonResponse(cars_data, safe=False)

    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


def car_details(request, car_id):
    if request.method == 'GET':
        car = Car.objects.get(id=car_id)
        rents = Car_Rental.objects.filter(car=car)
        rented = rents.exists()

        rental_data = []
        for rent in rents:
            rental_data.append({
                'id': rent.id,
                'start_date': rent.start_date,
                'end_date': rent.end_date,
                'user': rent.user.username if rent.user else None,
            })

        related = Car.objects.filter(brand=car.brand, car_type=car.car_type).exclude(id=car.id)[:3]

        comments = Comment.objects.filter(car=car)
        comments_data = []
        for comment in comments:
            comments_data.append({
                'id': comment.id,
                'comment': comment.comment,
                'date': comment.date,
                'username': comment.user.username,
            })

        related_data = []
        for related_car in related:
            related_data.append({
                'id': related_car.id,
                'brand': related_car.brand,
                'model': related_car.model,
                'year': related_car.year,
                'price': related_car.price,
                'image': related_car.image.url if related_car.image else None,
                'car_type': related_car.car_type,
                'center': related_car.center.name if related_car.center else None,
                'rating': car.average_rating if car.average_rating > 0 else "N/A",
            })

        return JsonResponse({
            'car': {
                'id': car.id,
                'brand': car.brand,
                'model': car.model,
                'year': car.year,
                'price': car.price,
                'image': car.image.url if car.image else None,
                'rented': rented,
                'car_type': car.car_type,
                'center': car.center.name if car.center else None,
                'rating': car.average_rating if car.average_rating > 0 else "N/A",
            },
            'rental_history': rental_data,
            'comments': comments_data,
            'related_cars': related_data
        }, status=200)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)


def rate_car(request, car_id):
    if request.method == "POST":
        data = json.loads(request.body)
        rating = data.get('rating')
        car = Car.objects.get(id=car_id)
        user = request.user
        rated_car = CarRating.objects.filter(user=user, car=car).first()
        if rated_car:
            rated_car.rating = rating
            rated_car.save()
        else:
            CarRating.objects.create(
                user=user,
                car=car,
                rating=rating,
            )
        return JsonResponse({'message': 'Rating submitted successfully'}, status=200)
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
    elif request.method == "DELETE":
        rental = Car_Rental.objects.get(id=car_id)
        rental.delete()
        return JsonResponse({'message': 'Car rental deleted successfully'}, safe=False)
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
            'prize1': user.prize1,
            'prize2': user.prize2,
            'prize3': user.prize3,
            'prize4': user.prize4,
            'prize5': user.prize5,
        }}, status=200)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)

def delete_comment(request, comment_id):
    if request.method == "DELETE":
        Comment.objects.filter(id=comment_id).delete()
        return JsonResponse({'message': 'Comment deleted successfully'}, status=200)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)


def calculate_rating(request):
    if request.method == 'GET':
       User = get_user_model()
       users = User.objects.filter(stars__lte=5)
       rating = 0
       cnt = 0
       for user in users:
          rating += user.stars
          cnt +=1
       if cnt == 0:
          cnt = 1
       rating /= cnt
       return JsonResponse({'rating': rating}, status=200)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)


def rate_website(request):
    if request.method == 'PUT':
        user = request.user
        data = json.loads(request.body)
        stars = data.get('rating')
        user.stars = stars
        user.save()
        return JsonResponse({'message': 'Rating submitted successfully'}, status=200)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)


def claim_reward(request, prize_number):
    if request.method == 'PUT':
        user = request.user
        prize_field = f'prize{prize_number}'
        if hasattr(user, prize_field):
            setattr(user, prize_field, True)
            user.save()
            return JsonResponse({'message': f'Prize {prize_field} claimed successfully'}, status=200)
        else:
            return JsonResponse({'message': f'Invalid prize: {prize_field}'}, status=400)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)


def leaderboard(request):
    if request.method == 'GET':
        User = get_user_model()
        users = User.objects.order_by('-XP')[:5]
        users_data = []

        for index, user in enumerate(users, start=1):
            users_data.append({
                'id': user.id,
                'username': user.username,
                'XP': user.XP,
                'profile_picture': request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
                'rank': index,
            })

        current_user = request.user if request.user.is_authenticated else None
        if current_user:
            current_user_rank = (
                    User.objects.filter(XP__gt=current_user.XP).count() + 1
            )
            if current_user_rank > 5:
              users_data.append({
                'id': current_user.id,
                'username': current_user.username,
                'XP': current_user.XP,
                'profile_picture': request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
                'rank': current_user_rank,
              })

        return JsonResponse(users_data, safe=False)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


def bill_history(request):
    if request.method == 'GET':
        user = request.user
        bills = Bill.objects.filter(user=user)
        bills_data = []

        for bill in bills:
            bills_data.append({
                'id': bill.id,
                'car_rental': f'{bill.car_rental.car.brand} {bill.car_rental.car.model} ({bill.car_rental.car.year})',  # Adjust as needed
                'total_amount': bill.total_amount,
                'payment_method': bill.payment_method,
                'from_date': bill.from_date.strftime('%Y-%m-%d'),
                'due_date': bill.due_date.strftime('%Y-%m-%d'),
                'pdf_url': request.build_absolute_uri(bill.pdf_file.url) if bill.pdf_file else None,
            })

        return JsonResponse(bills_data, safe=False)
    elif request.method == 'DELETE':
        bill_id = request.GET.get('id')
        bill = Bill.objects.get(id=bill_id)
        bill.delete()
        return JsonResponse({'message': 'Bill deleted successfully'}, safe=False)
    else:
        return JsonResponse({'error': 'Only GET requests are allowed.'}, status=405)

def opening_hours(request, center_id):
    if request.method == 'GET':
        try:
            opening_hour = OpeningHour.objects.get(rental_center_id=center_id)

            data = {
                "monday": [opening_hour.monday_start, opening_hour.monday_end],
                "tuesday": [opening_hour.tuesday_start, opening_hour.tuesday_end],
                "wednesday": [opening_hour.wednesday_start, opening_hour.wednesday_end],
                "thursday": [opening_hour.thursday_start, opening_hour.thursday_end],
                "friday": [opening_hour.friday_start, opening_hour.friday_end],
                "saturday": [opening_hour.saturday_start, opening_hour.saturday_end],
                "sunday": [opening_hour.sunday_start, opening_hour.sunday_end],
            }

            # Convertește TimeField-urile în string-uri (ex: "09:00")
            for day in data:
                data[day] = [t.strftime('%H:%M') if t else None for t in data[day]]

            return JsonResponse(data, status=200)

        except OpeningHour.DoesNotExist:
            return JsonResponse({"error": "Opening hours not found."}, status=404)

def search_centers(request):
    if request.method == 'GET':
        country = request.GET.get('country', '').strip()
        city = request.GET.get('city', '').strip()
        address = request.GET.get('address', '').strip()
        name = request.GET.get('name', '').strip()

        # Ia toate centrele
        all_centers = RentalCenter.objects.all()

        # Filtrare fuzzy în Python
        results = []

        for center in all_centers:
            match = True

            if country and fuzz.partial_ratio(center.country.lower(), country.lower()) < 85:
                match = False
            if city and fuzz.partial_ratio(center.city.lower(), city.lower()) < 85:
                match = False
            if address and fuzz.partial_ratio(center.address.lower(), address.lower()) < 90:
                match = False
            if name and fuzz.partial_ratio(center.name.lower(), name.lower()) < 50:
                match = False

            if match:
                results.append({
                    'id': center.id,
                    'name': center.name,
                    'country': center.country,
                    'city': center.city,
                    'phone': center.phone,
                    'address': center.address,
                    'latitude': center.lat,
                    'longitude': center.long,
                })

        return JsonResponse(results, safe=False)

    return JsonResponse({'error': 'Invalid request method'}, status=405)