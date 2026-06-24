from datetime import date

from dateutil.relativedelta import relativedelta
from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.permissions import IsAdmin, IsStaff, IsTeacher


class AdminSummaryView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        from finance.models import Invoice, Payment
        from students.models import Class, Student
        from users.models import User

        today = date.today()

        total_students = Student.objects.filter(status='active').count()
        total_staff = User.objects.filter(
            role__in=['teacher', 'hr', 'accountant'], is_active=True).count()

        monthly_income = Payment.objects.filter(
            paid_at__year=today.year, paid_at__month=today.month
        ).aggregate(total=Sum('amount'))['total'] or 0

        overdue_count = Invoice.objects.filter(
            status='pending', due_date__lt=today).count()

        # Oxirgi 6 oy daromadi — aniq oy arifmetikasi (review I3)
        monthly_payments = []
        first = today.replace(day=1)
        for i in range(5, -1, -1):
            d = first - relativedelta(months=i)
            amt = Payment.objects.filter(
                paid_at__year=d.year, paid_at__month=d.month
            ).aggregate(total=Sum('amount'))['total'] or 0
            monthly_payments.append({'month': d.strftime('%b'), 'amount': float(amt)})

        # Sinflar davomati — bitta annotate so'rovi (review: N+1 ni kamaytirish)
        class_stats = []
        classes = Class.objects.annotate(
            total=Count('students__attendance'),
            present=Count('students__attendance',
                          filter=Q(students__attendance__status='present')),
        )[:8]
        for cls in classes:
            rate = round((cls.present / cls.total * 100) if cls.total else 0)
            class_stats.append({'class_name': cls.name, 'attendance_rate': rate})

        recent_payments = []
        for p in Payment.objects.select_related(
            'invoice__student__user', 'invoice__fee_type'
        ).order_by('-created_at')[:8]:
            recent_payments.append({
                'student_name': p.invoice.student.user.get_full_name(),
                'fee_type': p.invoice.fee_type.name,
                'amount': float(p.amount),
                'method': p.get_method_display(),
                'paid_at': p.paid_at.strftime('%d.%m.%Y'),
            })

        return Response({
            'total_students': total_students,
            'total_staff': total_staff,
            'monthly_income': float(monthly_income),
            'overdue_count': overdue_count,
            'monthly_payments': monthly_payments,
            'class_stats': class_stats,
            'recent_payments': recent_payments,
        })


class TeacherSummaryView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        from academics.models import Schedule
        from grades.models import Grade
        from lms.models import Assignment, Submission

        teacher = getattr(request.user, 'teacher_profile', None)
        if teacher is None:
            return Response({'detail': "O'qituvchi profili topilmadi"}, status=400)

        today = date.today()
        day_of_week = today.weekday() + 1

        today_schedule = []
        for s in Schedule.objects.filter(
            teacher=teacher, day_of_week=day_of_week
        ).select_related('subject', 'school_class', 'room', 'time_slot').order_by('time_slot__order'):
            today_schedule.append({
                'subject': s.subject.name,
                'class_name': s.school_class.name,
                'room': s.room.name if s.room else '',
                'start_time': str(s.time_slot.start_time)[:5],
            })

        ungraded = Submission.objects.filter(
            assignment__course__teacher=teacher, score__isnull=True).count()
        avg = Grade.objects.filter(teacher=teacher).aggregate(a=Avg('score'))['a']

        pending = []
        for a in Assignment.objects.filter(
            course__teacher=teacher
        ).select_related('course__school_class').order_by('-created_at')[:5]:
            pending_count = a.submissions.filter(score__isnull=True).count()
            if pending_count:
                pending.append({
                    'title': a.title,
                    'class_name': a.course.school_class.name,
                    'pending_count': pending_count,
                })

        return Response({
            'class_count': teacher.classes.count(),
            'today_lessons': len(today_schedule),
            'ungraded': ungraded,
            'avg_grade': round(avg, 1) if avg else None,
            'today_schedule': today_schedule,
            'pending_assignments': pending,
        })


class StudentSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from academics.models import Schedule
        from attendance.models import AttendanceRecord
        from grades.models import Grade
        from lms.models import Assignment

        student = getattr(request.user, 'student_profile', None)
        if student is None:
            return Response({'detail': 'Talaba profili topilmadi'}, status=400)

        today = date.today()
        day_of_week = today.weekday() + 1

        total_att = AttendanceRecord.objects.filter(student=student).count()
        present = AttendanceRecord.objects.filter(student=student, status='present').count()
        att_rate = round((present / total_att * 100) if total_att else 0)

        avg = Grade.objects.filter(student=student).aggregate(a=Avg('score'))['a']

        pending_assignments = Assignment.objects.filter(
            course__school_class=student.current_class,
            due_date__gte=timezone.now()
        ).exclude(submissions__student=student).count()

        today_schedule = []
        for s in Schedule.objects.filter(
            school_class=student.current_class, day_of_week=day_of_week
        ).select_related('subject', 'teacher__user', 'room', 'time_slot').order_by('time_slot__order'):
            today_schedule.append({
                'subject': s.subject.name,
                'teacher': s.teacher.user.get_full_name(),
                'room': s.room.name if s.room else '',
                'start_time': str(s.time_slot.start_time)[:5],
            })

        recent_grades = []
        for g in Grade.objects.filter(student=student).select_related(
            'subject', 'category'
        ).order_by('-date')[:6]:
            recent_grades.append({
                'subject': g.subject.name,
                'category': g.category.name if g.category else '',
                'score': float(g.score),
                'date': g.date.strftime('%d.%m'),
            })

        return Response({
            'attendance_rate': att_rate,
            'avg_grade': round(avg, 1) if avg else None,
            'pending_assignments': pending_assignments,
            'today_lessons': len(today_schedule),   # review M5: aniq nom
            'today_schedule': today_schedule,
            'recent_grades': recent_grades,
        })


class ParentSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from attendance.models import AttendanceRecord
        from finance.models import Invoice
        from grades.models import Grade
        from notifications.models import Notification
        from students.models import ParentStudent

        children_qs = ParentStudent.objects.filter(parent=request.user).select_related(
            'student__user', 'student__current_class')
        if not children_qs.exists():
            return Response({'detail': 'Farzand topilmadi'}, status=404)

        # review I7: barcha farzandlar ro'yxati + tanlangan farzand
        children = [{
            'id': ps.student.id,
            'full_name': ps.student.user.get_full_name(),
            'class_name': ps.student.current_class.name if ps.student.current_class else '',
            'student_id': ps.student.student_id,
        } for ps in children_qs]

        child_id = request.query_params.get('child_id')
        selected = children_qs.filter(student_id=child_id).first() if child_id else children_qs.first()
        student = selected.student

        total_att = AttendanceRecord.objects.filter(student=student).count()
        present = AttendanceRecord.objects.filter(student=student, status='present').count()
        att_rate = round((present / total_att * 100) if total_att else 0)

        att_detail = {}
        detail_qs = AttendanceRecord.objects.filter(student=student).values('status').annotate(c=Count('id'))
        for row in detail_qs:
            att_detail[row['status']] = row['c']
        for st in ['present', 'absent', 'late', 'excused']:
            att_detail.setdefault(st, 0)

        avg = Grade.objects.filter(student=student).aggregate(a=Avg('score'))['a']
        debt = Invoice.objects.filter(student=student, status='pending').aggregate(
            t=Sum('amount'))['t'] or 0
        unread = Notification.objects.filter(recipient=request.user, is_read=False).count()

        invoices = []
        for inv in Invoice.objects.filter(student=student).select_related('fee_type').order_by('-created_at')[:5]:
            invoices.append({
                'fee_type': inv.fee_type.name,
                'month': inv.month,
                'amount': float(inv.amount),
                'status': inv.status,
            })

        return Response({
            'children': children,
            'child': {
                'id': student.id,
                'full_name': student.user.get_full_name(),
                'class_name': student.current_class.name if student.current_class else '',
                'student_id': student.student_id,
                'first_name': student.user.first_name,
                'last_name': student.user.last_name,
            },
            'attendance_rate': att_rate,
            'attendance_detail': att_detail,
            'avg_grade': round(avg, 1) if avg else None,
            'debt': float(debt),
            'unread_notifications': unread,
            'invoices': invoices,
        })


class HRSummaryView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        from hr.models import Inventory, LeaveRequest, Payroll
        from staff.models import Department
        from users.models import User

        total_staff = User.objects.filter(
            role__in=['teacher', 'hr', 'accountant'], is_active=True).count()

        current_month = timezone.now().strftime('%Y-%m')
        monthly_payroll = Payroll.objects.filter(month=current_month).aggregate(
            t=Sum('net_salary'))['t'] or 0

        pending_leaves = LeaveRequest.objects.filter(status='pending').count()
        inventory_count = Inventory.objects.aggregate(t=Sum('quantity'))['t'] or 0

        by_department = []
        for dept in Department.objects.all():
            count = (User.objects.filter(teacher_profile__department=dept, is_active=True).count()
                     + User.objects.filter(staff_profile__department=dept, is_active=True).count())
            if count:
                by_department.append({'name': dept.name, 'count': count})

        leave_requests = []
        for req in LeaveRequest.objects.filter(status='pending').select_related(
            'employee', 'leave_type'
        ).order_by('-created_at')[:5]:
            leave_requests.append({
                'employee_name': req.employee.get_full_name(),
                'leave_type': req.leave_type.name,
                'days': req.days,
            })

        return Response({
            'total_staff': total_staff,
            'monthly_payroll': float(monthly_payroll),
            'pending_leaves': pending_leaves,
            'inventory_count': inventory_count,
            'by_department': by_department,
            'leave_requests': leave_requests,
        })
