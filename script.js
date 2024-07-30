document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        selectable: true,
        select: function (info) {
            const isAvailable = confirm(`你在 ${info.startStr} 有空嗎？`);
            if (isAvailable) {
                calendar.addEvent({
                    title: '有空',
                    start: info.startStr,
                    end: info.endStr,
                    allDay: true,
                    color: 'green'
                });
            }
        },
        eventClick: function (info) {
            if (confirm('要刪除這個時間嗎？')) {
                info.event.remove();
            }
        }
    });
    calendar.render();
});