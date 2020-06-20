from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from project.apps.terminal.models import Terminal


def index(request):
    model = Terminal(request.POST)
    if model.is_valid():
        model.evaluate()
    if request.is_ajax():
        return JsonResponse({"result": model.result, "speed": model.cleaned_data['speed'], "old_speed": model.old_speed})
    return render(request, 'index.html', {
        "model": model
    })


def search(request):
    return JsonResponse(Terminal.search(request.GET['term']), safe=False)


def doc(request):
    return JsonResponse(Terminal.doc(request.GET['term']), safe=False)
