INSERT INTO events (id, name, slug, description) VALUES (1, 'Forritarahittingur í febrúar', 'forritarahittingur-i-februar', 'Forritarar hittast í febrúar og forrita saman eitthvað frábært.');
INSERT INTO events (id, name, slug, description) VALUES (2, 'Hönnuðahittingur í mars', 'honnudahittingur-i-mars', 'Spennandi hittingur hönnuða í Hönnunarmars.');
INSERT INTO events (id, name, slug, description) VALUES (3, 'Verkefnastjórahittingur í apríl', 'verkefnastjorahittingur-i-april', 'Virkilega vel verkefnastýrður hittingur.');
INSERT INTO events (id, name, slug, description) VALUES (4, 'ostaborð', 'ostabord', 'Ostar handa þeim sem elska osta');
INSERT INTO events (id, name, slug, description) VALUES (5, 'Gervigreindarskákmót', 'Gervisgreindarskakmot', 'Við prófum hverskonar gervigreind er best í skák, mælum ekki með því að verðja á tungumálamódelin.');

INSERT INTO users (name, username, password, admin) VALUES ('badmin','admin', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', true);
INSERT INTO users (name,username, password) VALUES ('Forvitinn forritari','A','$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');
INSERT INTO users (name,username, password) VALUES ('Jón Jónsson','B','$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');
INSERT INTO users (name,username, password) VALUES ('Guðrún Guðrúnar','C','$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');
INSERT INTO users (name,username, password) VALUES ('Gunna','D','$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');

INSERT INTO registrations (name,username, comment, event) VALUES ('Forvitinn forritari','A', 'Hlakka til að forrita með ykkur', 1);
INSERT INTO registrations (name,username, comment, event) VALUES ('Jón Jónsson','B', null, 1);
INSERT INTO registrations (name,username, comment, event) VALUES ('Guðrún Guðrúnar','C', 'verður vefforritað?', 1);
INSERT INTO registrations (name,username, comment, event) VALUES ('algotrazh','D', 'hvað er ostur?', 4);
INSERT INTO registrations (name,username, comment, event) VALUES ('Jón Jónsson','B', null, 5);



