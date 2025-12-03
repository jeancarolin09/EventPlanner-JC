// import { useState, useEffect } from "react";

// export function useAuth() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem("jwt");
//     const userData = JSON.parse(localStorage.getItem("user")); // stocke les infos user après login
//     if (token && userData) {
//       setIsAuthenticated(true);
//       setUser(userData);
//     }
//   }, []);

//   const logout = () => {
//     localStorage.removeItem("jwt");
//     localStorage.removeItem("user");
//     setIsAuthenticated(false);
//     setUser(null);
//   };

//   return { isAuthenticated, user, logout };
// }
