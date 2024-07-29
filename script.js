document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    app.appendChild(dateInput);

    const submitButton = document.createElement('button');
    submitButton.textContent = '提交可用時間';
    app.appendChild(submitButton);

    const resultsDiv = document.createElement('div');
    resultsDiv.id = 'results';
    app.appendChild(resultsDiv);

    submitButton.addEventListener('click', () => {
        const date = dateInput.value;
        if (date) {
            const result = document.createElement('p');
            result.textContent = `已記錄：${date}`;
            resultsDiv.appendChild(result);
        } else {
            alert('請選擇日期');
        }
    });
});