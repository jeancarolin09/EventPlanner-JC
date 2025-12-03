// hooks/useInvitations.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export const useInvitations = (email) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await axios.get(`http://localhost:8000/api/invitations/user/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const invitationsWithPolls = await Promise.all(
        res.data.map(async (inv) => {
          if (inv.status === "accepted") {
            // Récupération des polls pour cet événement
            const pollsRes = await axios.get(
              `http://localhost:8000/api/events/${inv.event.id}/polls`,
              { headers: { "Invitation-Token": inv.token, Authorization: `Bearer ${token}` } }
            );
            return { ...inv, event: { ...inv.event, polls: pollsRes.data } };
          }
          return inv;
        })
      );

      setInvitations(invitationsWithPolls);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) fetchInvitations();
  }, [email]);

  return { invitations, loading, error, setInvitations, reloadInvitations: fetchInvitations };
};
