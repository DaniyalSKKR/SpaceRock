from django.db import models
from django.utils import timezone

class Scenario(models.Model):

    # outputs
    transient_diameter = models.DecimalField(default=1, max_digits=10, decimal_places=6)
    affected_radius = models.DecimalField(default=1, max_digits=10, decimal_places=6) 
    impact_coordinates = models.CharField(default='(0, 0)', max_length=20)
    tsunami_risk = models.CharField(default='Low', max_length=10)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Scenario date = {self.date} | d = {self.transient_diameter} m | r = {self.affected_radius} m | tsunami risk = {self.tsunami_risk} | coordinates = {self.impact_coordinates}"

class Meteor(models.Model):

    scenario = models.OneToOneField(Scenario, on_delete=models.CASCADE)
    name = models.CharField(default='Impactor', max_length=20)
    diameter = models.DecimalField(max_digits=10, decimal_places=6)
    velocity = models.DecimalField(max_digits=8, decimal_places=2)
    density  = models.DecimalField(max_digits=7, decimal_places=2)  
    angle    = models.DecimalField(max_digits=5, decimal_places=2)   
    

    def __str__(self):
        return f"Meteor name={self.name} | d={self.diameter} m | v={self.velocity} m/s | ρ={self.density} kg/m³ | angle={self.angle}°"
    
class Target(models.Model):

    scenario = models.OneToOneField(Scenario, on_delete=models.CASCADE)
    name = models.CharField(default='Earth' ,max_length=50)

    k1 = models.DecimalField(max_digits=4, decimal_places=3)
    mu = models.DecimalField(max_digits=4, decimal_places=3)
    nu = models.DecimalField(max_digits=4, decimal_places=3)
    
    material = models.CharField(max_length=20)
    gravity = models.DecimalField(max_digits=7, decimal_places=2)
    density  = models.DecimalField(max_digits=7, decimal_places=2) 
    material_strength = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.name} | material=({self.material}) | g={self.gravity} m/s² | ρ={self.density} kg/m³ | strength={self.material_strength} Pa | k1={self.k1} | mu={self.mu} | nu={self.nu}"
