import io
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.files.base import ContentFile
from django.utils import timezone
from .models import Car_Rental, Bill

@receiver(post_save, sender=Car_Rental)
def create_bill_for_rental(sender, instance, created, **kwargs):
    if not created:
        return

    # Compute total
    total = instance.price

    # Create Bill record
    bill = Bill.objects.create(
        user=instance.user,
        car_rental=instance,
        total_amount=total,
        payment_method=instance.payment_method,
        from_date=instance.start_date,
        due_date=instance.end_date,
    )

    # Generate PDF in memory
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Header
    p.setFont("Helvetica-Bold", 16)
    p.drawCentredString(width/2, height - 50, "Car Rental Bill")

    # Details
    p.setFont("Helvetica", 10)
    y = height - 100
    p.drawString(40, y, f"Email: {instance.user.email}")
    y -= 15
    p.drawString(40, y, f"Issue Date: {timezone.now().date()}")
    y -= 15
    p.drawString(40, y, f"Rental: {instance.start_date} to {instance.end_date}")
    y -= 30

    # Table header
    p.setFont("Helvetica-Bold", 10)
    p.drawString(40, y, "Car")
    p.drawString(220, y, "Days")
    p.drawString(300, y, "Price/Day")
    p.drawString(400, y, "Total")
    y -= 15
    p.line(40, y, width-40, y)
    y -= 15

    # Table row
    p.setFont("Helvetica", 10)
    p.drawString(40, y, f"{instance.car}")
    p.drawString(220, y, str(instance.days))
    p.drawString(300, y, f"{instance.price/instance.days:.2f} EUR")
    p.drawString(400, y, f"{total:.2f} EUR")

    # Footer
    y -= 40
    p.setFont("Helvetica-Bold", 12)
    p.drawString(40, y, f"Total: {total:.2f} EUR")
    y -= 20
    p.setFont("Helvetica", 10)
    p.drawString(40, y, f"Payment Method: {instance.payment_method}")

    p.showPage()
    p.save()

    buffer.seek(0)
    bill.pdf_file.save(f"bill_{bill.id}.pdf", ContentFile(buffer.read()))
    buffer.close()