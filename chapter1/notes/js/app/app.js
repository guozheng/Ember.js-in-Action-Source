var Notes = Ember.Application.create({
});

/** Router **/
Notes.Router.map(function () {
    this.resource('notes', {path: "/"}, function() {
        this.route('note', {path: "/note/:note_id"});
    });
});

Notes.NotesRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('note');
    }
});

Notes.NotesNoteRoute = Ember.Route.extend({
    model: function(note) {
        return this.store.find('note', note.note_id);
    }
});

/** Ember Data **/
Notes.Note = DS.Model.extend({
    name: DS.attr('string'),
    value: DS.attr('string'),

    /** computed property */
    intro: function() {
        var intro = '';
        if (this.get('value')) {
            intro = this.get('value').substring(0, 15) + '...';
        }
        return intro;
    }.property('value')
});

Notes.Store = DS.Store.extend({
    adapter: DS.LSAdapter
});


Notes.NotesController = Ember.ArrayController.extend({
    needs: ['notesNote'],
    newNoteName: null,

    actions: {
        createNewNote: function() {
            var content = this.get('content');
            var newNoteName = this.get('newNoteName');
            var unique = newNoteName != null && newNoteName.length > 1;

            content.forEach(function(note) {
                if (newNoteName === note.get('name')) {
                    unique = false; return;
                }
            });

            if (unique) {
                var newNote = this.store.createRecord('note');
                newNote.set('id', newNoteName);
                newNote.set('name', newNoteName);
                newNote.save();

                this.set('newNoteName', null);
            } else {
                alert('Note must have a unique name of at least 2 characters!');
            }
        },

        doDeleteNote: function (note) {
            this.set('noteForDeletion', note);
            $("#confirmDeleteNoteDialog").modal({"show": true});
        },

        doCancelDelete: function () {
            this.set('noteForDeletion', null);
            $("#confirmDeleteNoteDialog").modal('hide');
        },

        doConfirmDelete: function () {
            var selectedNote = this.get('noteForDeletion');
            this.set('noteForDeletion', null);
            if (selectedNote) {
                this.store.deleteRecord(selectedNote);
                selectedNote.save();

                if (this.get('controllers.notesNote.model.id') === selectedNote.get('id')) {
                    this.transitionToRoute('notes');
                }
            }
            $("#confirmDeleteNoteDialog").modal('hide');
        }
    }
});

Notes.NotesNoteController = Ember.ObjectController.extend({
    actions: {
        updateNote: function(note) {
            var noteName = this.get('name');
            var content = this.get('value');
            console.log('Note name: ' + noteName);
            console.log('Note content: ' + content);
            console.log(this instanceof Notes.NotesNoteController);
            console.log(note instanceof Notes.Note);
            console.log('before: ' + note.get('name') + ', ' + note.get('value'));
            if (content) {
                console.log('saving...');
                var targetNote = note.store.find('id', noteName);
                targetNote.set('value', content);
                console.log('after: ' + note.get('name') + ', ' + note.get('value'));
            }
        }
    }
});