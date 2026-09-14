import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch (error) {
      console.error(
        "Failed to read saved user:",
        error
      );

      localStorage.removeItem("user");

      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [loading, setLoading] = useState(true);

  /*
   * Check an existing token when the application starts.
   */
  useEffect(() => {
    const checkAuthentication = async () => {
      const savedToken =
        localStorage.getItem("token");

      if (!savedToken || savedToken === "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
        setLoading(false);

        return;
      }

      try {
        const response = await api.get(
          "/auth/me"
        );

        const currentUser =
          response.data?.user ||
          response.data?.data;

        if (!currentUser) {
          throw new Error(
            "Server did not return the current user."
          );
        }

        localStorage.setItem(
          "user",
          JSON.stringify(currentUser)
        );

        setUser(currentUser);
        setToken(savedToken);
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error.response?.data ||
            error.message
        );

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  /*
   * Login with email and password.
   *
   * LoginForm calls:
   *
   * login({
   *   email,
   *   password
   * })
   *
   * This function now performs the actual API request.
   */
  const login = async ({
    email,
    password,
  }) => {
    const response = await api.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

    const data = response.data;

    console.log(
      "Login response:",
      data
    );

    const authToken = data?.token;

    const loggedInUser =
      data?.user ||
      data?.data?.user;

    if (!authToken) {
      throw new Error(
        "Login succeeded, but the server did not return a token."
      );
    }

    /*
     * Save JWT.
     */
    localStorage.setItem(
      "token",
      authToken
    );

    /*
     * Save user.
     */
    if (loggedInUser) {
      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );
    }

    /*
     * Update React state.
     */
    setToken(authToken);
    setUser(loggedInUser || null);

    return {
      user: loggedInUser,
      token: authToken,
    };
  };

  /*
   * Register a new account.
   */
  const register = async ({
    name,
    email,
    password,
  }) => {
    const response = await api.post(
      "/auth/register",
      { name, email, password }
    );

    const data = response.data;
    const authToken = data?.token;
    const registeredUser =
      data?.user || data?.data?.user;

    if (!authToken) {
      throw new Error(
        "Account created, but the server did not return a token."
      );
    }

    localStorage.setItem("token", authToken);

    if (registeredUser) {
      localStorage.setItem(
        "user",
        JSON.stringify(registeredUser)
      );
    }

    setToken(authToken);
    setUser(registeredUser || null);

    return {
      user: registeredUser,
      token: authToken,
    };
  };

  /*
   * Logout.
   */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: Boolean(
          token
        ),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}