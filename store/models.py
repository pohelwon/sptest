# store/models.py
from django.db import models

class Item(models.Model):
    name = models.CharField(max_length=200)
    rarity = models.CharField(max_length=50, choices=[
        ('common','Common'),
        ('rare','Rare'),
        ('ultra-rare','Ultra-Rare'),
        ('legendary','Legendary'),
    ])
    price = models.DecimalField(max_digits=6, decimal_places=2)
    age = models.CharField(max_length=50, choices=[
        ('newborn','Newborn'),
        ('reborn','Reborn'),
        ('full','Full Grown'),
    ])
    # props (многие варианты) — можно хранить через TextField, JSON, или ManyToMany
    # Для упрощения можно сделать CharField и хранить через запятую, либо boolean поля.
    props = models.CharField(max_length=200, blank=True)
    
    popularity = models.IntegerField(default=0)
    img = models.URLField(blank=True)  # ссылка на картинку

    def __str__(self):
        return self.name

