import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { login, reset } from "../features/auth/authSlice";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { FaCalendarAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const loginSchema = z.object({
  email: z.email({ message: "Please enter a valid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { user, isLoading, isError, isSuccess, message } = useAppSelector(
    (state) => state.auth,
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

  const onSubmit = (data: LoginFormData) => {
    dispatch(login(data));
  };

  return (
    <div className="flex min-h-screen bg-(--color-bg)">
      {/* Left Side - Image/Abstract */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-600 to-purple-700 opacity-90 mix-blend-multiply" />
        <img
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Login background"
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
              Welcome back to the community
            </h2>
            <p className="text-indigo-200 text-lg">
              "EventFull has transformed how I organize and discover local
              meetups. It's simply the best platform out there."
            </p>
            <div className="mt-6 flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-400 border-2 border-white mr-4" />
              <div className="text-sm">
                <p className="text-white font-medium">Sarah Jenkins</p>
                <p className="text-indigo-300">Community Organizer</p>
              </div>
            </div>
          </div>
          <div className="text-indigo-300 text-sm">
            © {new Date().getFullYear()} EventFull Inc.
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-(--color-bg)">
        <Link
          to="/"
          className="mx-auto mb-6 inline-flex items-center gap-2 text-(--color-text) font-semibold lg:hidden"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-(--color-brand) text-white shadow-sm">
            <FaCalendarAlt size={16} />
          </span>
          Eventfull
        </Link>
        <Card className="mx-auto w-full max-w-sm lg:w-96 p-6 sm:p-8" elevated>
          <div>
            <h2 className="text-3xl font-semibold text-(--color-text)">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-(--color-text-muted)">
              Or{" "}
              <Link
                to="/register"
                className="font-medium text-(--color-brand) hover:text-(--color-brand-hover) transition-colors"
              >
                start your 14-day free trial
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-(--color-text)"
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
                  className="block text-sm font-medium text-(--color-text)"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
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
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-(--color-brand)"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-(--color-brand) border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-(--color-text)"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-(--color-brand) hover:text-(--color-brand-hover)"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  fullWidth
                  loading={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
