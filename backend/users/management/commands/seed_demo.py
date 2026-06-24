"""Demo ma'lumotlar bilan bazani to'ldirish: python manage.py seed_demo

Dashboardlarni tekshirish uchun minimal, lekin yetarli test ma'lumoti yaratadi.
Idempotent — qayta ishga tushirsa dublikat yaratmaydi.
"""
from datetime import date, time, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone


class Command(BaseCommand):
    help = "Demo ma'lumotlar yaratadi (test uchun)"

    @transaction.atomic
    def handle(self, *args, **options):
        from academics.models import Room, Schedule, TimeSlot
        from attendance.models import AttendanceRecord
        from finance.models import FeeType, Invoice, Payment
        from grades.models import Grade, GradeCategory
        from students.models import Class, ParentStudent, Student
        from staff.models import Department, Subject, Teacher
        from users.models import User

        def mkuser(username, role, first, last, pwd='demo1234'):
            u, created = User.objects.get_or_create(
                username=username,
                defaults={'role': role, 'first_name': first, 'last_name': last,
                          'email': f'{username}@educore.uz'})
            if created:
                u.set_password(pwd)
                u.save()
            return u

        year = '2024-2025'

        dept, _ = Department.objects.get_or_create(name='Aniq fanlar')
        math, _ = Subject.objects.get_or_create(code='MATH', defaults={'name': 'Matematika'})
        eng, _ = Subject.objects.get_or_create(code='ENG', defaults={'name': 'Ingliz tili'})

        t_user = mkuser('teacher1', 'teacher', 'Akmal', 'Karimov')
        teacher, _ = Teacher.objects.get_or_create(
            user=t_user, defaults={'teacher_id': 'T-001', 'department': dept,
                                    'hire_date': date(2020, 9, 1), 'salary': Decimal('6000000')})
        teacher.subjects.add(math, eng)

        klass, _ = Class.objects.get_or_create(
            name='10-A', academic_year=year,
            defaults={'grade_level': 10, 'homeroom_teacher': t_user, 'capacity': 30})
        teacher.classes.add(klass)

        # TimeSlot, Room, Schedule
        ts1, _ = TimeSlot.objects.get_or_create(order=1, defaults={
            'name': '1-dars', 'start_time': time(8, 30), 'end_time': time(9, 15)})
        ts2, _ = TimeSlot.objects.get_or_create(order=2, defaults={
            'name': '2-dars', 'start_time': time(9, 25), 'end_time': time(10, 10)})
        room, _ = Room.objects.get_or_create(name='201', defaults={'capacity': 30})
        today_dow = date.today().weekday() + 1
        Schedule.objects.get_or_create(
            teacher=teacher, time_slot=ts1, day_of_week=today_dow, academic_year=year,
            defaults={'school_class': klass, 'subject': math, 'room': room})
        Schedule.objects.get_or_create(
            teacher=teacher, time_slot=ts2, day_of_week=today_dow, academic_year=year,
            defaults={'school_class': klass, 'subject': eng, 'room': room})

        cat, _ = GradeCategory.objects.get_or_create(name='Nazorat ishi', defaults={'weight': 1.0})
        fee, _ = FeeType.objects.get_or_create(
            name="O'qish haqi", defaults={'amount': Decimal('1500000'), 'frequency': 'monthly'})

        parent = mkuser('parent1', 'parent', 'Dilshod', 'Karimov')

        students = []
        for i in range(1, 4):
            su = mkuser(f'student{i}', 'student', f'Talaba{i}', 'Karimov')
            st, _ = Student.objects.get_or_create(
                user=su, defaults={'student_id': f'S-2024-00{i}', 'current_class': klass,
                                   'date_of_birth': date(2009, 3, i), 'gender': 'male',
                                   'enrollment_date': date(2024, 9, 1)})
            students.append(st)
            ParentStudent.objects.get_or_create(parent=parent, student=st,
                                                 defaults={'relation': 'father'})
            # Baholar
            for s_idx, score in enumerate([85, 72, 90]):
                Grade.objects.get_or_create(
                    student=st, subject=math, teacher=teacher, category=cat,
                    term='1', academic_year=year, date=date.today() - timedelta(days=s_idx * 3),
                    defaults={'score': Decimal(score)})
            # Davomat (oxirgi 10 kun)
            for d in range(10):
                AttendanceRecord.objects.get_or_create(
                    student=st, subject=math, date=date.today() - timedelta(days=d),
                    defaults={'teacher': teacher,
                              'status': 'present' if d % 4 else 'absent'})
            # Invoice + payment (birinchi talaba to'lagan)
            inv, _ = Invoice.objects.get_or_create(
                student=st, fee_type=fee, month='2024-09',
                defaults={'amount': Decimal('1500000'), 'due_date': date(2024, 9, 10)})
            if i == 1:
                Payment.objects.get_or_create(
                    invoice=inv, defaults={'amount': Decimal('1500000'), 'method': 'click',
                                           'paid_at': timezone.now()})

        self.stdout.write(self.style.SUCCESS(
            "Demo ma'lumot tayyor. Login: admin/admin123, teacher1/demo1234, "
            "student1/demo1234, parent1/demo1234"))
