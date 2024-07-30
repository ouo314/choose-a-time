document.addEventListener('DOMContentLoaded', function () {
    let calendar;
    let currentSurveyId = null;

    const createSurveyBtn = document.getElementById('createSurveyBtn');
    const surveyNameInput = document.getElementById('surveyName');
    const surveyInfo = document.getElementById('surveyInfo');
    const surveyIdSpan = document.getElementById('surveyId');
    const userNameInput = document.getElementById('userName');

    createSurveyBtn.addEventListener('click', createSurvey);

    function createSurvey() {
        const surveyName = surveyNameInput.value;
        if (surveyName) {
            currentSurveyId = generateUniqueId();
            surveyIdSpan.textContent = currentSurveyId;
            surveyInfo.style.display = 'block';
            initializeCalendar();
        } else {
            alert('請輸入調查名稱');
        }
    }

    function generateUniqueId() {
        return Math.random().toString(36).substr(2, 9);
    }

    function initializeCalendar() {
        const calendarEl = document.getElementById('calendar');
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            selectable: true,
            select: function (info) {
                const userName = userNameInput.value;
                if (userName) {
                    calendar.addEvent({
                        title: userName,
                        start: info.startStr,
                        end: info.endStr,
                        allDay: true
                    });
                } else {
                    alert('請輸入您的名字');
                }
            }
        });
        calendar.render();
    }
});