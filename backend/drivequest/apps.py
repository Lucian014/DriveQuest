from django.apps import AppConfig

class DrivequestConfig(AppConfig):
    name = 'drivequest'
    def ready(self):
        import drivequest.signals