const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

console.log('Starting server...');
console.log('Node version:', process.version);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/timesurvey', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    });

const Survey = mongoose.model('Survey', {
    name: String,
    users: { type: Object, default: {} },
    events: { type: Array, default: [] }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

app.get('/api/surveys/:surveyName', async (req, res) => {
    try {
        const { surveyName } = req.params;
        const survey = await Survey.findOne({ name: surveyName });
        if (survey) {
            res.json(survey);
        } else {
            res.status(404).json({ error: 'Survey not found' });
        }
    } catch (error) {
        console.error('Error fetching survey:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/surveys', async (req, res) => {
    try {
        const { name } = req.body;
        console.log('Attempting to create survey:', name);

        if (!name) {
            console.log('Survey name is missing');
            return res.status(400).json({ error: 'Survey name is required' });
        }

        const existingSurvey = await Survey.findOne({ name });
        if (existingSurvey) {
            console.log('Survey already exists:', name);
            return res.status(409).json({ error: 'Survey with this name already exists' });
        }

        const survey = new Survey({ name, users: {}, events: [] });
        await survey.save();
        console.log('Survey created successfully:', survey);
        res.status(201).json(survey);
    } catch (error) {
        console.error('Error creating survey:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.post('/api/surveys/join', async (req, res) => {
    try {
        const { surveyName, userName } = req.body;
        console.log('Joining survey:', { surveyName, userName });

        if (!surveyName || !userName) {
            return res.status(400).json({ error: 'Survey name and user name are required' });
        }

        const result = await Survey.updateOne(
            { name: surveyName },
            { $set: { [`users.${userName}`]: true } },
            { upsert: true }
        );

        if (result.matchedCount === 0 && result.upsertedCount === 0) {
            return res.status(404).json({ error: 'Survey not found' });
        }

        const updatedSurvey = await Survey.findOne({ name: surveyName });
        res.json(updatedSurvey);
    } catch (error) {
        console.error('Error joining survey:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/surveys/events', async (req, res) => {
    try {
        const { surveyName, event } = req.body;
        const survey = await Survey.findOne({ name: surveyName });
        if (survey) {
            survey.events.push(event);
            await survey.save();
            res.json(survey);
        } else {
            res.status(404).json({ error: 'Survey not found' });
        }
    } catch (error) {
        console.error('Error adding event:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/surveys/events', async (req, res) => {
    try {
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
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
