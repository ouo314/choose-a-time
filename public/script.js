document.addEventListener('DOMContentLoaded', function () {
    let calendar;
    let currentSurveyName = null;
    let currentUserName = null;

    const createSurveyBtn = document.getElementById('createSurveyBtn');
    const joinSurveyBtn = document.getElementById('joinSurveyBtn');
    const surveyNameInput = document.getElementById('surveyName');
    const joinSurveyNameInput = document.getElementById('joinSurveyName');
    const userNameInput = document.getElementById('userName');
    const surveyInfo = document.getElementById('surveyInfo');
    const currentSurveyNameSpan = document.getElementById('currentSurveyName');
    const currentUserNameSpan = document.getElementById('currentUserName');
    const API_URL = 'https://choose-a-time.onrender.com';

    createSurveyBtn.addEventListener('click', createSurvey);
    joinSurveyBtn.addEventListener('click', joinSurvey);

    async function createSurvey() {
        const surveyName = surveyNameInput.value.trim();
        if (surveyName) {
            try {
                const response = await fetch(`${API_URL}/api/surveys`, {
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

    async function fetchSurveyInfo(surveyName) {
        try {
            const response = await fetch(`${API_URL}/api/surveys/${surveyName}`);
            if (!response.ok) {
                throw new Error('Server response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching survey info:', error);
            alert('獲取調查信息時出錯');
        }
    }

    async function joinSurvey() {
        const surveyName = joinSurveyNameInput.value.trim();
        const userName = userNameInput.value.trim();
        if (surveyName && userName) {
            try {
                const response = await fetch(`${API_URL}/api/surveys/join`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ surveyName, userName })
                });
                if (!response.ok) {
                    throw new Error('Server response was not ok');
                }
                const data = await response.json();
                currentSurveyName = surveyName;
                currentUserName = userName;
                localStorage.setItem('currentSurveyName', surveyName);
                localStorage.setItem('currentUserName', userName);
                showSurveyInfo();
                initializeCalendar();
            } catch (error) {
                console.error('Error joining survey:', error);
                alert('加入調查時出錯');
            }
        } else {
            alert('請輸入調查名稱和您的名字');
        }
    }
    async function checkCurrentSurvey() {
        currentSurveyName = localStorage.getItem('currentSurveyName');
        currentUserName = localStorage.getItem('currentUserName');
        if (currentSurveyName && currentUserName) {
            try {
                const surveyInfo = await fetchSurveyInfo(currentSurveyName);
                if (surveyInfo.users[currentUserName]) {
                    showSurveyInfo();
                    initializeCalendar();
                } else {
                    localStorage.removeItem('currentSurveyName');
                    localStorage.removeItem('currentUserName');
                    currentSurveyName = null;
                    currentUserName = null;
                }
            } catch (error) {
                console.error('Error checking current survey:', error);
            }
        }
    }

    function showSurveyInfo() {
        if (currentSurveyName && currentUserName) {
            currentSurveyNameSpan.textContent = currentSurveyName;
            currentUserNameSpan.textContent = currentUserName;
            surveyInfo.style.display = 'block';
        } else {
            currentSurveyNameSpan.textContent = '未加入調查';
            currentUserNameSpan.textContent = '未登入';
            surveyInfo.style.display = 'block';
        }
    }

    async function initializeCalendar() {
        const calendarEl = document.getElementById('calendar');
        calendarEl.style.display = 'block';
        const surveyInfo = await fetchSurveyInfo(currentSurveyName);
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            selectable: true,
            select: async function (info) {
                if (currentUserName) {
                    const surveyInfo = await fetchSurveyInfo(currentSurveyName);
                    const existingEvent = surveyInfo.events.find(e =>
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
                        try {
                            await fetch(`${API_URL}/api/surveys/events`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ surveyName: currentSurveyName, event })
                            });
                            calendar.addEvent(event);
                        } catch (error) {
                            console.error('Error adding event:', error);
                            alert('添加事件時出錯');
                        }
                    }
                } else {
                    alert('請先加入調查');
                }
            },
            eventClick: async function (info) {
                if (info.event.title === currentUserName) {
                    if (confirm('要刪除這個時間嗎？')) {
                        try {
                            await fetch(`${API_URL}/api/surveys/events`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    surveyName: currentSurveyName,
                                    event: {
                                        title: currentUserName,
                                        start: info.event.startStr,
                                        end: info.event.endStr
                                    }
                                })
                            });
                            info.event.remove();
                        } catch (error) {
                            console.error('Error deleting event:', error);
                            alert('刪除事件時出錯');
                        }
                    }
                } else {
                    alert('您只能刪除自己標註的時間');
                }
            },
            events: surveyInfo.events
        });
        calendar.render();
    }

    checkCurrentSurvey();

});
