const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost/timesurvey', { useNewUrlParser: true, useUnifiedTopology: true });

const Survey = mongoose.model('Survey', {
    name: String,
    users: Object,
    events: Array
});

app.post('/api/surveys', async (req, res) => {
    const { name } = req.body;
    const survey = new Survey({ name, users: {}, events: [] });
    await survey.save();
    res.json(survey);
});

app.post('/api/surveys/join', async (req, res) => {
    const { surveyName, userName } = req.body;
    const survey = await Survey.findOne({ name: surveyName });
    if (survey) {
        survey.users[userName] = true;
        await survey.save();
        res.json(survey);
    } else {
        res.status(404).json({ error: 'Survey not found' });
    }
});

app.post('/api/surveys/events', async (req, res) => {
    const { surveyName, event } = req.body;
    const survey = await Survey.findOne({ name: surveyName });
    if (survey) {
        survey.events.push(event);
        await survey.save();
        res.json(survey);
    } else {
        res.status(404).json({ error: 'Survey not found' });
    }
});

app.delete('/api/surveys/events', async (req, res) => {
    const { surveyName, event } = req.body;
    const survey = await Survey.findOne({ name: surveyName });
    if (survey) {
        survey.events = survey.events.filter(e =>
            !(e.title === event.title && e.start === event.start && e.end === event.end)
        );
        await survey.save();
        res.json(survey);
    } else {
        res.status(404).json({ error: 'Survey not found' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));