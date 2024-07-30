const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/timesurvey', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    });

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

app.post('/api/surveys', async (req, res) => {
    try {
        const { name } = req.body;
        const survey = new Survey({ name, users: {}, events: [] });
        await survey.save();
        res.json(survey);
    } catch (error) {
        console.error('Error creating survey:', error);
        res.status(500).json({ error: 'Internal server error' });
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