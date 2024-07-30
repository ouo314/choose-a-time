document.addEventListener('DOMContentLoaded', function () {
    let calendar;
    let currentSurveyName = null;
    let currentUserName = null;
    let surveys = {};

    const createSurveyBtn = document.getElementById('createSurveyBtn');
    const joinSurveyBtn = document.getElementById('joinSurveyBtn');
    const surveyNameInput = document.getElementById('surveyName');
    const joinSurveyNameInput = document.getElementById('joinSurveyName');
    const userNameInput = document.getElementById('userName');
    const surveyInfo = document.getElementById('surveyInfo');
    const currentSurveyNameSpan = document.getElementById('currentSurveyName');
    const currentUserNameSpan = document.getElementById('currentUserName');

    createSurveyBtn.addEventListener('click', createSurvey);
    joinSurveyBtn.addEventListener('click', joinSurvey);

    async function createSurvey() {
        const surveyName = surveyNameInput.value.trim();
        if (surveyName) {
            try {
                const response = await fetch('http://localhost:3000/api/surveys', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: surveyName })
                });
                const data = await response.json();
                surveys[surveyName] = data;
                showSurveyInfo(surveyName);
                initializeCalendar();
            } catch (error) {
                console.error('Error creating survey:', error);
                alert('創建調查時出錯');
            }
        } else {
            alert('請輸入調查名稱');
        }
    }

    function joinSurvey() {
        const surveyName = joinSurveyNameInput.value.trim();
        const userName = userNameInput.value.trim();
        if (surveyName && userName) {
            if (surveys[surveyName]) {
                if (surveys[surveyName].users[userName]) {
                    alert('此用戶名已在該調查中使用');
                } else {
                    surveys[surveyName].users[userName] = true;
                    currentSurveyName = surveyName;
                    currentUserName = userName;
                    showSurveyInfo();
                    initializeCalendar();
                }
            } else {
                alert('找不到該調查');
            }
        } else {
            alert('請輸入調查名稱和您的名字');
        }
    }

    function showSurveyInfo() {
        currentSurveyNameSpan.textContent = currentSurveyName;
        currentUserNameSpan.textContent = currentUserName || '未登入';
        surveyInfo.style.display = 'block';
    }

    function initializeCalendar() {
        const calendarEl = document.getElementById('calendar');
        calendarEl.style.display = 'block';
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            selectable: true,
            select: function (info) {
                if (currentUserName) {
                    const existingEvent = surveys[currentSurveyName].events.find(e =>
                        e.title === currentUserName &&
                        e.start === info.startStr &&
                        e.end === info.endStr
                    );
                    if (existingEvent) {
                        alert('您已經在此時間段標註過了');
                    } else {
                        const event = {
                            title: currentUserName,
                            start: info.startStr,
                            end: info.endStr,
                            allDay: true
                        };
                        calendar.addEvent(event);
                        surveys[currentSurveyName].events.push(event);
                    }
                } else {
                    alert('請先加入調查');
                }
            },
            eventClick: function (info) {
                if (info.event.title === currentUserName) {
                    if (confirm('要刪除這個時間嗎？')) {
                        info.event.remove();
                        surveys[currentSurveyName].events = surveys[currentSurveyName].events.filter(e =>
                            !(e.title === currentUserName && e.start === info.event.startStr && e.end === info.event.endStr)
                        );
                    }
                } else {
                    alert('您只能刪除自己標註的時間');
                }
            },
            events: surveys[currentSurveyName] ? surveys[currentSurveyName].events : []
        });
        calendar.render();
    }
});
