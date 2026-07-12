import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store.js";
import { login, logout, getMe, register } from "../services/auth.service.js";
import { toast } from "sonner";

const PROFILE_KEY = ["auth", "me"];

// Helper to extract error message from Axios response
function extractMessage(err, fallback) {
  return err?.response?.data?.message ?? fallback;
}

export const useMe = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  const query = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      const user = await getMe();
      setUser(user);
      return user;
    },
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.isSuccess || query.isError) {
      setHydrated();
    }
  }, [query.isSuccess, query.isError, setHydrated]);

  return query;
};

export const useLogin = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }) => login({ email, password }),
    onSuccess: (user) => {
      setUser(user);
      qc.setQueryData(PROFILE_KEY, user);
      toast.success("Successfully logged in!");
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(extractMessage(err, "Login failed. Please try again."));
    },
  });
};

export const useRegister = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ name, email, password }) => register({ name, email, password }),
    onSuccess: (user) => {
      setUser(user);
      qc.setQueryData(PROFILE_KEY, user);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(extractMessage(err, "Registration failed. Please try again."));
    },
  });
};

export const useLogout = () => {
  const clearUser = useAuthStore((s) => s.clearUser);
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success("Signed out successfully.");
    },
    onError: () => {
      toast.error("Sign-out failed. Please try again.");
    },
    onSettled: () => {
      clearUser();
      qc.removeQueries({ queryKey: PROFILE_KEY });
      navigate("/login");
    },
  });
};
