from django.shortcuts import render
from django.contrib.auth.decorators import login_required 
from django.views.decorators.csrf import csrf_exempt
from core.language import MethodNotAllowed , m
from django.http import JsonResponse
import time

@login_required
def RMS(r):
    return render(r , 'RMS.html')

@login_required
def indexpage(r):
    return render(r , 'index.html')

@csrf_exempt
def alrms(r):
    if r.method == "POST":
        return JsonResponse({
                "type": "alarm",
                "machine_id": "VENT02",
                "alarm_code": "P_HIGH",
                "alarm_q" : 42.7,
                "severity": "critical",
                "priority": 1,
                "message": "High Airway Pressure",
                "description": "Peak inspiratory pressure exceeded 40 cmH₂O",
                "timestamp": time.strftime("%H:%M:%S", time.localtime()),
                "current_values": {
                    "pressure_cmH2O": 42.7,
                    "flow_Lmin": 32.5,
                    "volume_ml": 512
                }
            }
        )
    
    return JsonResponse({m: MethodNotAllowed})
