from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import JsonResponse
from .models import Item


def index(request):
    # Главная страница "StarPets" (index.html)
    return render(request, 'store/index.html')

def login_user(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('index')  # или 'profile', как удобно
        else:
            messages.error(request, "Неверное имя пользователя или пароль")
            return redirect('login')
    else:
        return render(request, 'store/login.html')

def register_user(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        if User.objects.filter(username=username).exists():
            messages.error(request, "Пользователь уже существует")
            return redirect('register')
        else:
            user = User.objects.create_user(username=username, password=password)
            login(request, user)
            return redirect('index')
    else:
        return render(request, 'store/register.html')

def logout_user(request):
    logout(request)
    return redirect('index')

def profile(request):
    if request.user.is_authenticated:
        return render(request, 'store/profile.html')
    else:
        messages.info(request, "Сначала войдите в аккаунт")
        return redirect('login')

def items_api(request):
    from .models import Item
    qs = Item.objects.all()
    
    price_min = request.GET.get('price_min')
    if price_min:
        qs = qs.filter(price__gte=price_min)
    
    price_max = request.GET.get('price_max')
    if price_max:
        qs = qs.filter(price__lte=price_max)
    
    rarities = request.GET.getlist('rarity')
    if rarities:
        qs = qs.filter(rarity__in=rarities)
    
    # props
    props = request.GET.getlist('props')
    # нужно решить, как хранить props в модели. Если как "flyable,neon",
    # то придется делать небольшую проверку: например, item.props.contains( 'flyable' ) etc.
    # Для упрощения можно пропустить.
    
    ages = request.GET.getlist('age')
    if ages:
        qs = qs.filter(age__in=ages)
    
    search = request.GET.get('search')
    if search:
        qs = qs.filter(name__icontains=search)
    
    sort_value = request.GET.get('sort')
    if sort_value == 'priceAsc':
        qs = qs.order_by('price')
    elif sort_value == 'priceDesc':
        qs = qs.order_by('-price')
    elif sort_value == 'popularity':
        qs = qs.order_by('-popularity')
    else:
        # дефолт
        qs = qs.order_by('-popularity')
    
    data = []
    for item in qs:
        data.append({
            'name': item.name,
            'rarity': item.rarity,
            'price': float(item.price),
            'img': item.img or "https://via.placeholder.com/100?text=No+Img",
            'props': item.props,  # Если строка
            'age': item.age,
            'popularity': item.popularity,
        })
    
    return JsonResponse(data, safe=False)
