import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  updateProfile,
  reset,
  setCredentials,
} from "../features/auth/authSlice";
import authService from "../features/auth/authService";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaSave, FaCamera } from "react-icons/fa";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const uploadsBase = apiBase.replace(/\/api\/v1\/?$/, "");
const normalizeAvatarUrl = (url: string) => {
  if (!url) return url;
  if (
    url.startsWith("http") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const prefix = url.startsWith("/") ? "" : "/";
  return `${uploadsBase}${prefix}${url}`;
};

const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" })
    .optional(),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" })
    .optional(),
  email: z.string().email().optional(),
  occupation: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  dateOfBirth: z.string().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  bio: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading, isError, isSuccess, message } = useAppSelector(
    (state: any) => state.auth,
  );

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      setValue("firstName", user.first_name || user.firstName || "");
      const dobRaw = user.date_of_birth || user.dateOfBirth;
      if (dobRaw) {
        const iso = new Date(dobRaw).toISOString().split("T")[0];
        setValue("dateOfBirth", iso);
      } else {
        setValue("dateOfBirth", "");
      }
      setValue("lastName", user.last_name || user.lastName || "");
      setValue("email", user.email || "");
      setValue("occupation", user.occupation || "");
      setValue("jobTitle", user.job_title || user.jobTitle || "");
      setValue("company", user.company || "");
      setValue("phone", user.phone || "");
      setValue("website", user.website || "");
      setValue("location", user.location || "");
      setValue("timezone", user.timezone || "");
      setValue("bio", user.bio || "");
      // social profiles may be stored as object
      const socials = user.social_profiles || user.socialProfiles || {};
      setValue("linkedin", socials.linkedin || "");
      setValue("twitter", socials.twitter || "");

      // Avatar preview
      const avatar = user.avatar_url || user.avatarUrl || null;
      if (avatar) setPreviewUrl(normalizeAvatarUrl(avatar));
    }
  }, [user, setValue]);

  useEffect(() => {
    if (isError) {
      dispatch(reset());
    }

    if (isSuccess && message) {
      toast.success("Profile updated successfully!");
      dispatch(reset());
    }
  }, [isError, isSuccess, message, dispatch]);

  const onSubmit = (data: ProfileFormData) => {
    const { linkedin, twitter, ...rest } = data as any;

    // Remove empty strings/nulls so we don't overwrite values with blanks
    const cleaned: Record<string, any> = {};
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleaned[key] = value;
      }
    });

    // Normalize date to ISO (without time) for backend
    if (cleaned.dateOfBirth) {
      const iso = new Date(cleaned.dateOfBirth).toISOString().split("T")[0];
      cleaned.dateOfBirth = iso;
    }

    const socialProfiles: Record<string, string> = {};
    if (linkedin) socialProfiles.linkedin = linkedin;
    if (twitter) socialProfiles.twitter = twitter;
    if (Object.keys(socialProfiles).length > 0)
      cleaned.socialProfiles = socialProfiles;

    dispatch(updateProfile(cleaned));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    // auto upload
    uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await authService.uploadAvatar(formData);
      if (res && res.user) {
        const avatar = res.user.avatar_url || res.user.avatarUrl || null;
        if (avatar) setPreviewUrl(normalizeAvatarUrl(avatar));
        // Sync redux state with new user
        const token =
          (user && (user.token || (window as any).__token__)) || null;
        dispatch(setCredentials({ user: res.user, token }));
        toast.success("Avatar uploaded");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Upload failed",
      );
    }
  };

  if (!user) {
    return (
      <div className="p-10 text-center">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-slate-700 text-white p-6 sm:p-8 shadow-xl motion-lift">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-white/10 ring-2 ring-white/30 flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <FaUser className="text-white/80" size={28} />
              )}
              <label className="absolute bottom-0 right-0 bg-white text-slate-900 rounded-full p-1.5 cursor-pointer shadow-md">
                <FaCamera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  aria-label="Upload profile avatar"
                  title="Upload profile avatar"
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-white/70">
                Profile
              </p>
              <h1 className="text-2xl font-semibold">
                {user.first_name || user.firstName || "Your name"}
              </h1>
              <p className="text-white/80 flex items-center gap-2 text-sm">
                <FaEnvelope className="opacity-80" /> {user.email}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white/10 px-3 py-2">
              <p className="text-xs text-white/60">Role</p>
              <p className="font-semibold capitalize">
                {user.role?.toLowerCase()}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2">
              <p className="text-xs text-white/60">Timezone</p>
              <p className="font-semibold">{user.timezone || "Set later"}</p>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2">
              <p className="text-xs text-white/60">Location</p>
              <p className="font-semibold">{user.location || "Add city"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5 motion-lift">
            <h3 className="text-base font-semibold text-slate-900">
              Avatar & Contact
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              A clear photo helps people recognize you.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FaUser className="text-slate-400" size={28} />
                )}
              </div>
              <div>
                <label className="motion-press inline-flex items-center px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-sm cursor-pointer hover:bg-slate-800">
                  <FaCamera className="mr-2" /> Update avatar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    aria-label="Update avatar"
                    title="Update avatar"
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  JPG or PNG, max 5MB.
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-slate-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaUser className="text-slate-400" />
                <span>{user.role}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6 space-y-4 motion-lift">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Personal details
                  </h3>
                  <p className="text-sm text-slate-500">
                    Your core identity information.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    First name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-slate-400" />
                    </div>
                    <input
                      id="firstName"
                      {...register("firstName")}
                      className={`pl-10 block w-full rounded-lg border ${errors.firstName ? "border-red-300" : "border-slate-200"} bg-slate-50 focus:border-(--color-brand) focus:ring-2 focus:ring-blue-100 transition`}
                      placeholder="Jane"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    {...register("lastName")}
                    className={`mt-1 block w-full rounded-lg border ${errors.lastName ? "border-red-300" : "border-slate-200"} bg-slate-50 focus:border-(--color-brand) focus:ring-2 focus:ring-blue-100 transition`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-slate-400" />
                    </div>
                    <input
                      disabled
                      {...register("email")}
                      className="pl-10 block w-full rounded-lg border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Email cannot be changed.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Date of birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    {...register("dateOfBirth")}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 focus:border-(--color-brand) focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6 space-y-4 motion-lift">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Professional profile
                </h3>
                <p className="text-sm text-slate-500">
                  Tell hosts and attendees what you do.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Occupation
                  </label>
                  <input
                    id="occupation"
                    {...register("occupation")}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 focus:border-(--color-brand) focus:ring-2 focus:ring-blue-100 transition"
                    placeholder="Product Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Job title
                  </label>
                  <input
                    id="jobTitle"
                    {...register("jobTitle")}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 focus:border-(--color-brand) focus:ring-2 focus:ring-blue-100 transition"
                    placeholder="Head of Events"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Company
                  </label>
                  <input
                    id="company"
                    {...register("company")}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 focus:border-(--color-brand) focus:ring-2 focus:ring-blue-100 transition"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Website
                  </label>
                  <input
                    id="website"
                    type="url"
                    {...register("website")}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 focus:border-(--color-brand) focus:ring-2 focus:ring-blue-100 transition"
                    placeholder="https://your-site.com"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6 space-y-4 motion-lift">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Contact & socials
                </h3>
                <p className="text-sm text-slate-500">
                  Stay reachable and share where people can find you.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Phone
                  </label>
                  <input
                    id="phone"
                    {...register("phone")}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 focus:border-(--color-brand) focus:ring-2 focus:ring-blue-100 transition"
                    placeholder="+1 555 0100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Location
                  </label>
                  <input
                    id="location"
                    {...register("location")}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 focus:border-(--color-brand) focus:ring-2 focus:ring-blue-100 transition"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    {...register("timezone")}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 focus:border-(--color-brand) focus:ring-2 focus:ring-blue-100 transition"
                  >
                    <option value="">Select timezone</option>
                    <option value="UTC">UTC</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Europe/Paris">Europe/Paris (CET)</option>
                    <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                    <option value="America/New_York">
                      America/New_York (EST)
                    </option>
                    <option value="America/Chicago">
                      America/Chicago (CST)
                    </option>
                    <option value="America/Denver">America/Denver (MST)</option>
                    <option value="America/Los_Angeles">
                      America/Los_Angeles (PST)
                    </option>
                    <option value="America/Sao_Paulo">
                      America/Sao_Paulo (BRT)
                    </option>
                    <option value="Africa/Lagos">
                      Africa/Lagos (WAT - Nigeria)
                    </option>
                    <option value="Africa/Accra">
                      Africa/Accra (GMT - Ghana)
                    </option>
                    <option value="Africa/Johannesburg">
                      Africa/Johannesburg (SAST)
                    </option>
                    <option value="Africa/Addis_Ababa">
                      Africa/Addis_Ababa (EAT - Ethiopia)
                    </option>
                    <option value="Africa/Nairobi">
                      Africa/Nairobi (EAT - Kenya)
                    </option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    <option value="Australia/Sydney">
                      Australia/Sydney (AEST)
                    </option>
                    <option value="Pacific/Auckland">
                      Pacific/Auckland (NZST)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    LinkedIn
                  </label>
                  <input
                    id="linkedin"
                    {...register("linkedin")}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 focus:border-(--color-brand) focus:ring-2 focus:ring-blue-100 transition"
                    placeholder="linkedin.com/in/you"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Twitter
                  </label>
                  <input
                    id="twitter"
                    {...register("twitter")}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 focus:border-(--color-brand) focus:ring-2 focus:ring-blue-100 transition"
                    placeholder="@yourhandle"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6 space-y-4 motion-lift">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  About you
                </h3>
                <p className="text-sm text-slate-500">
                  A short bio helps others know you better.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  {...register("bio")}
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 focus:border-(--color-brand) focus:ring-2 focus:ring-blue-100 transition"
                  placeholder="Share your experience, passions, and what you’re looking for at events."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="motion-press inline-flex justify-center py-2 px-4 border border-slate-300 text-slate-700 text-sm font-medium rounded-md bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="motion-press inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--color-brand) disabled:opacity-50 disabled:cursor-not-allowed items-center"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <>
                    <FaSave className="mr-2" /> Save changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
