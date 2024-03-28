const PORT = process.env.PORT || 3001;
const fs = require ('fs');
const path = require('path');

const express = require('express');
const app = express();

const allNotes = require('./db/db.json');

const localhostLink = `http://localhost:${PORT}`; 
console.log('Localhost link:', localhostLink);


//  setting up middleware for parsing incoming URL-encoded and JSON data, and also configuring Express to serve static files from the public directory
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(express.static('public'));

app.get('/api/notes', (req, res) => {
    res.json(allNotes.slice(1));
});

app.get('/index', (req,res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/notes', (req,res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

app.get('*', (req,res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

if (allNotes !== null) {
    console.log("allNotes is null!")
} else {
    console.error("Uh-oh! allNotes isn't null.");
}

let notes;
try {
    notes = require('./db/db.json');
} catch (error) {
    console.error('Error loading db.json:', error);
    // Handle the error
}

// creating a new note, assigning it a unique ID, and updating the list of notes stored in a JSON file
function createNewNote(body, notesArray) {
    const newNote = body;
    if (!Array.isArray(notesArray))
        notesArray = [];
    
    if (notesArray.length === 0)
        notesArray.push(0);

    body.id = notesArray[0];
    notesArray[0]++;

    notesArray.push(newNote);

    try {
    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify(notesArray, null, 2)
    );
    } catch (error) {
    console.error('Error writing to file:', error);
    // Handle the error, possibly by logging and/or sending an appropriate response to the client.
    }
    return newNote;
};

app.post('/api/notes', (req, res) => {
    const newNote = createNewNote(req.body, allNotes);
    res.json(newNote);
});

// Delete request 
function deleteNote(id, notesArray) {
    for (let i = 0; i < notesArray.length; i++) {
        let note = notesArray[i];

        if (note.id == parseInt(id, 10)) {
            notesArray.splice(i, 1);
            fs.writeFileSync(
                path.join(__dirname, './db/db.json'),
                JSON.stringify(notesArray, null, 2)
            );

            break;
        }
    }
}

app.delete('/api/notes/:id', (req, res) => {
    deleteNote(req.params.id, allNotes);
    res.json(true);
});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});