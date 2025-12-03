import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Données de base
  const [data, setData] = useState({ user: "Jean Carolin" });

  // Liste d'événements
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Anniversaire de Max",
      description: "Une soirée spéciale pour fêter les 25 ans de Max ! 🎉",
      date: "2025-07-10",
      time: "19:00",
      location: "Maison de Max",
      guests: [
        { name: "Alice", confirmed: true },
        { name: "Bob", confirmed: false },
        { name: "Chloé", confirmed: true },
      ],
      polls: [
        {
          question: "Quel plat préférez-vous ?",
          options: [
            { text: "Pizza", votes: 5 },
            { text: "Burger", votes: 2 },
            { text: "Sushi", votes: 3 },
          ],
        },
      ],
    },
  ]);

  // Fonction pour ajouter un événement
  const addEvent = (newEvent) => {
    const newId = events.length > 0 ? events[events.length - 1].id + 1 : 1;
    setEvents([
      ...events,
      {
        id: newId,
        ...newEvent,
        guests: [],
        polls: [],
      },
    ]);
  };

  // Fonction pour supprimer un événement
  const deleteEvent = (id) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  // Fonction pour modifier un événement
  const updateEvent = (updatedEvent) => {
    setEvents(events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
  };

  return (
    <AppContext.Provider
      value={{ data, setData, events, addEvent, deleteEvent, updateEvent }}
    >
      {children}
    </AppContext.Provider>
  );
};
