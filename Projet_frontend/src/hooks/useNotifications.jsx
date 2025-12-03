import { useState, useEffect } from "react";

export const useNotifications = (interval = 5000) => {
  const [notifications, setNotifications] = useState([]);
  const [counts, setCounts] = useState({
    messages: 0,
    invitations: 0,
    activities: 0,
  });

  const fetchNotifications = async () => {
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await fetch("http://localhost:8000/api/notifications", {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Erreur API notifications");

      const data = await res.json();
      setNotifications(data.notifications);

      // Calcul automatique des badges par type
      setCounts({
        messages: data.notifications.filter(
          (n) => n.relatedTable === "message" && !n.isRead
        ).length,
        invitations: data.notifications.filter(
          (n) => n.relatedTable === "invitation" && !n.isRead
        ).length,
        activities: data.notifications.filter(
          (n) => n.relatedTable === "activity" && !n.isRead
        ).length,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const jwt = localStorage.getItem("jwt");
      await fetch("http://localhost:8000/api/notifications/mark-all-read", {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}`,
         "Content-Type": "application/json"
    },
      });

    
        setUnreadCount(0);
        // 🔥 force update des notifications
        fetchNotifications();

    } catch (err) {
        console.error(err);
    }
};

const markMessagesAsRead = async () => {
    try {
        const jwt = localStorage.getItem("jwt");

        await fetch("http://localhost:8000/api/notifications/messages/mark-as-read", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${jwt}`,
                "Content-Type": "application/json",
            },
        });

        // MAJ directe les notifications locales
        const updated = notifications.map(n =>
            n.relatedTable === "message" ? { ...n, isRead: true } : n
        );

        setNotifications(updated);

        // MAJ du badge messages
        setCounts(prev => ({
            ...prev,
            messages: 0,
        }));

    } catch (err) {
        console.error("Erreur lors de markMessagesAsRead", err);
    }
};

// const markMessagesAsRead = async (notificationId) => {
//   const jwt = localStorage.getItem("jwt");

//   try {
//     const res = await fetch(`http://localhost:8000/api/notifications/messages/${notificationId}/mark-as-read`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${jwt}`,
//         "Content-Type": "application/json",
//       },
//     });

//     if (!res.ok) throw new Error("Erreur lors de la mise à jour");

//     const data = await res.json();

//     // Met à jour le badge côté frontend
//     setCounts(prev => ({
//       ...prev,
//       messages: data.unreadCount
//     }));

//     // Aussi mettre à jour localement la notification
//     setNotifications(prev =>
//       prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
//     );

//   } catch (err) {
//     console.error(err);
//   }
// };



  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return { notifications, counts, markAllAsRead, markMessagesAsRead };
};
