import time
import datetime
import io
import re
import sys
import builtins
import importlib

from django import forms


class Terminal(forms.Form):
    content = forms.CharField(widget=forms.Textarea(attrs={'id': 'terminal-input'}))
    result = ''
    speed = forms.CharField(widget=forms.HiddenInput, required=False)
    old_speed = ''

    def evaluate(self):
        self.old_speed = self.cleaned_data['speed']
        start_time = self.microtime()
        self.result = Terminal.stdout(lambda: exec(self.cleaned_data['content']))
        self.cleaned_data['speed'] = round(self.microtime() - start_time, 10)

    @staticmethod
    def microtime() -> float:
        d = datetime.datetime.now()
        return time.mktime(d.timetuple()) + d.microsecond / 1000000

    @staticmethod
    def search(string: str):
        result = []
        if str.find(string, '.') > -1:
            full_method = re.sub('\.[^\.]*$', '', string)
            method = re.sub('^(.+)\.([^\.]*)$', r"\2", string)
            my_module = importlib.import_module(full_method)
            functions = dir(my_module)
        else:
            full_method = ''
            method = string
            functions = dir(builtins)
        for i in functions:
            if not re.match('^' + method, i):
                continue
            res = i if not full_method else '.'.join([full_method, i])
            if callable(res):
                res += '()'
            result.append(res)
        return result

    @staticmethod
    def stdout(callback):
        real_stdout = sys.stdout
        fake_stdout = io.StringIO()  # or perhaps io.StringIO()
        try:
            sys.stdout = fake_stdout
            callback()
        finally:
            sys.stdout = real_stdout
            result = fake_stdout.getvalue()
            fake_stdout.close()
            return result

    @staticmethod
    def doc(string: str):
        return Terminal.stdout(lambda: help(string.replace('()', '')))
