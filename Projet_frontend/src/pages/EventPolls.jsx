import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const EventPolls = () => {
  const { id } = useParams();
  const { events, updateEvent } = useContext(AppContext);
  const [selectedOptions, setSelectedOptions] = useState({});

  const event = events.find((e) => e.id === parseInt(id));

  if (!event) {
    return (
      <div className="text-center mt-16">
        <h2 className="text-2xl font-bold text-gray-700">Événement introuvable 😢</h2>
      </div>
    );
  }

  const handleVote = (pollIndex, optionIndex) => {
    const updatedPolls = [...event.polls];
    updatedPolls[pollIndex].options[optionIndex].votes += 1;

    const updatedEvent = { ...event, polls: updatedPolls };
    updateEvent(updatedEvent);
    setSelectedOptions({ ...selectedOptions, [pollIndex]: optionIndex });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">📋 Sondages</h2>

      {event.polls && event.polls.length > 0 ? (
        <div className="space-y-6">
          {event.polls.map((poll, pollIndex) => (
            <div key={pollIndex} className="border rounded-lg p-4 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{poll.question}</h3>
              <ul className="space-y-2">
                {poll.options.map((opt, optionIndex) => (
                  <li
                    key={optionIndex}
                    className={`flex justify-between items-center p-2 rounded ${
                      selectedOptions[pollIndex] === optionIndex
                        ? "bg-purple-100"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span>{opt.text}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{opt.votes} votes</span>
                      <button
                        onClick={() => handleVote(pollIndex, optionIndex)}
                        disabled={selectedOptions[pollIndex] !== undefined}
                        className={`px-2 py-1 text-sm rounded ${
                          selectedOptions[pollIndex] === undefined
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "bg-gray-300 text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        Voter
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 italic">Aucun sondage actif.</p>
      )}
    </div>
  );
};

export default EventPolls;