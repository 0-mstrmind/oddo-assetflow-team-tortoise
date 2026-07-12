import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store.js";
import { login, logout, getMe, register, createEmployee } from "../services/auth.service.js";
import { socketService } from "../services/socket.service.js";
import { toast } from "sonner";

const PROFILE_KEY = ["auth", "me"];

// Helper to extract error message from Axios response
export function extractMessage(err, fallback) {
  return err?.response?.data?.message ?? fallback;
}

export const useMe = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  const query = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      const user = await getMe();
      setUser(user);
      socketService.connect();
      return user;
    },
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.isError) {
      clearUser();
      socketService.disconnect();
    }
    if (query.isSuccess || query.isError) {
      setHydrated();
    }
  }, [query.isSuccess, query.isError, clearUser, setHydrated]);

  return query;
};

export const useLogin = (callbacks) => {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }) => login({ email, password }),
    onSuccess: (user) => {
      setUser(user);
      socketService.connect();
      qc.setQueryData(PROFILE_KEY, user);
      toast.success("Successfully logged in!");
      navigate("/dashboard");
    },
    onError: (err) => {
      if (callbacks?.onError) {
        callbacks.onError(err);
      } else {
        toast.error(extractMessage(err, "Login failed. Please try again."));
      }
    },
  });
};

export const useRegister = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ name, email, password, companyName }) => register({ name, email, password, companyName }),
    onSuccess: () => {
      toast.success("Account created successfully! Please check your email to verify your account before logging in.", { duration: 6000 });
      // Redirect to login view to wait for verification
      navigate("/login");
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
      socketService.disconnect();
      qc.removeQueries({ queryKey: PROFILE_KEY });
      navigate("/login");
    },
  });
};

export const useCreateEmployee = () => {
  return useMutation({
    mutationFn: (body) => createEmployee(body),
    onSuccess: () => {
      toast.success("Employee created successfully!");
    },
    onError: (err) => {
      toast.error(extractMessage(err, "Failed to create employee."));
    },
  });
};
