import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { register as registerUser, reset } from "../features/auth/authSlice";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { FaCalendarAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: "First name must be at least 2 characters" }),
    lastName: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters" }),
    email: z.email({ message: "Please enter a valid email" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
    role: z.enum(["EVENTEE", "CREATOR"]),
    // Keep signup minimal — extra profile fields handled in profile edit
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Import RootState from your store file if not already imported
  // import type { RootState } from "../app/store";
  const { user, isLoading, isError, isSuccess, message } = useAppSelector(
    (state: any) => state.auth,
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      navigate("/");
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onSubmit = (data: RegisterFormData) => {
    const userData = { ...(data as any) };
    // remove confirmPassword before sending
    delete userData.confirmPassword;
    dispatch(registerUser(userData));
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      {/* Left Side - Image/Abstract */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90 mix-blend-multiply" />
        <img
          src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Register background"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
        />
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white text-2xl font-bold"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 text-white border border-white/30">
              <FaCalendarAlt size={16} />
            </span>
            Eventfull
          </Link>
          <div className="max-w-md">
            <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
              Join the community today
            </h2>
            <p className="text-indigo-200 text-lg">
              "I found my co-founders and best friends through EventFull
              meetups. It's more than just an app, it's a lifestyle."
            </p>
            <div className="mt-6 flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-400 border-2 border-white mr-4" />
              <div className="text-sm">
                <p className="text-white font-medium">David Chen</p>
                <p className="text-indigo-300">Tech Entrepreneur</p>
              </div>
            </div>
          </div>
          <div className="text-indigo-300 text-sm">
            © {new Date().getFullYear()} EventFull Inc.
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg)]">
        <Link
          to="/"
          className="mx-auto mb-6 inline-flex items-center gap-2 text-(--color-text) font-semibold lg:hidden"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-(--color-brand) text-white shadow-sm">
            <FaCalendarAlt size={16} />
          </span>
          Eventfull
        </Link>
        <Card
          className="mx-auto w-full max-w-sm lg:w-[30rem] p-6 sm:p-8"
          elevated
        >
          <div>
            <h2 className="text-3xl font-semibold text-[var(--color-text)]">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-[var(--color-text)]"
                  >
                    First Name
                  </label>
                  <div className="mt-1">
                    <Input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      placeholder="John"
                      error={errors.firstName?.message}
                      {...register("firstName")}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-[var(--color-text)]"
                  >
                    Last Name
                  </label>
                  <div className="mt-1">
                    <Input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      placeholder="Doe"
                      error={errors.lastName?.message}
                      {...register("lastName")}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[var(--color-text)]"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[var(--color-text)]"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="pr-12"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[var(--color-brand)]"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[var(--color-text)]"
                >
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="pr-12"
                    placeholder="••••••••"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[var(--color-brand)]"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I want to...
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="relative border border-[var(--color-border)] p-4 rounded-xl cursor-pointer hover:bg-gray-50 focus-within:ring-2 focus-within:ring-[var(--color-ring)]">
                    <input
                      type="radio"
                      className="sr-only"
                      value="EVENTEE"
                      {...register("role")}
                      defaultChecked
                    />
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-gray-900">
                        Attend Events
                      </span>
                      <span className="text-xs text-gray-500">
                        Discover & Book
                      </span>
                    </div>
                  </label>
                  <label className="relative border border-[var(--color-border)] p-4 rounded-xl cursor-pointer hover:bg-gray-50 focus-within:ring-2 focus-within:ring-[var(--color-ring)]">
                    <input
                      type="radio"
                      className="sr-only"
                      value="CREATOR"
                      {...register("role")}
                    />
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-gray-900">
                        Host Events
                      </span>
                      <span className="text-xs text-gray-500">
                        Create & Manage
                      </span>
                    </div>
                  </label>
                </div>
                {/* Creator-specific minimal fields are collected in profile after signup */}
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  fullWidth
                  loading={isLoading}
                >
                  {isLoading ? "Creating account..." : "Sign up"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
