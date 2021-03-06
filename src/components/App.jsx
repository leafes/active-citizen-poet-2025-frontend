import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Header from './Header';
import Footer from './Footer';
import Dashboard from './Dashboard';
import Events from './Events';
import CreateEvent from './CreateEvent';
import Event from './Event';
import PopupSubmitEvent from './PopupSubmitEvent';

import api from '../utils/api';
import EncryptVerse from '../utils/EncryptVerse';

function App() {
  const [events, setEvents] = React.useState([]);

  React.useEffect(() => {
    api.getInitialEvents().then((initialEvents) => {
      setEvents(initialEvents);
    }).catch((err) => new Error(`Ошибка: ${err}`));
  }, []);

  const [isSubmitEventPopupOpen, setSubmitEventPopupOpen] = React.useState(false);

  function onSubmitEvent() {
    setSubmitEventPopupOpen(true);
  }

  function closePopup() {
    setSubmitEventPopupOpen(false);
  }

  const getVerse = async (frase) => {
    const info = { name: '', verse: '' };
    const getVerse1 = await api.getRandomVerse();
    const currentName = getVerse1.fields.name;
    const eVerse = new EncryptVerse(frase, getVerse1.fields.text);
    if (eVerse.checkVerse() !== undefined) {
      const currentVerse = eVerse.replaceChars();
      info.name = currentName;
      info.verse = currentVerse;
    } else return getVerse(frase);
    return info;
  };

  function handleAddEventSubmit(data) {
    getVerse(data.name)
      .then((info) => {
        console.log(info);
        api.postEvent({
          name: info.name,
          imageLink: data.imageLink,
          owner: data.owner,
          date: data.date,
          address: data.address,
          type: data.type,
          verse: info.verse,
        }).then((newEvent) => {
          console.log(newEvent);
          setEvents([newEvent, ...events]);
          onSubmitEvent();
        })
          .catch((err) => new Error(`Ошибка: ${err}`));
      });
  }

  return (
    <div className="page">
      <Header />
      <main className="content">

        <Switch>
          <Route exact path="/">
            <Dashboard />
          </Route>
          <Route path="/events">
            <Events events={events} />
          </Route>
          <Route path="/event/:id">
            <Event events={events} />
          </Route>
          <Route path="/create-event">
            <CreateEvent onAddEvent={handleAddEventSubmit} />
          </Route>
        </Switch>

      </main>
      <Footer />
      <PopupSubmitEvent isOpen={isSubmitEventPopupOpen} onClose={closePopup} />
    </div>
  );
}

export default App;
