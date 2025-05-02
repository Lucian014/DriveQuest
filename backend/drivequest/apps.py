from django.apps import AppConfig

class DrivequestConfig(AppConfig):
    name = 'drivequest'
    def ready(self):
        # delay import of signals to avoid import-time errors
        import drivequest.signals