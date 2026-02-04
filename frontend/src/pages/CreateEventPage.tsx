import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { createEvent, reset } from "../features/events/eventSlice";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPlus,
  FaTrash,
  FaImage,
} from "react-icons/fa";

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  price: z.number().min(0, "Price must be non-negative"),
  currency: z.string(),
  capacity: z.number().int().positive().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  isPublic: z.boolean().default(true),
  ticketTypes: z
    .array(
      z.object({
        name: z.string().min(1, "Ticket name is required"),
        price: z.number().min(0, "Price must be non-negative"),
        capacity: z.number().int().positive().optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

const CreateEventPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, isSuccess, isError, message } = useAppSelector(
    (state) => state.events,
  );
  const { user } = useAppSelector((state) => state.auth);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      currency: "NGN",
      price: 0,
      ticketTypes: [],
      isPublic: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ticketTypes",
  });

  useEffect(() => {
    if (!user) {
      toast.error("You must be logged in to create an event");
      navigate("/login");
      return;
    }

    // Optional: Check for CREATOR role
    if (user.role && user.role !== "CREATOR" && user.role !== "ADMIN") {
      // toast.warn("You need a Creator account to post events.");
      // But let's verify if the backend strictly enforces this or if we should auto-upgrade or link to upgrade.
      // For now, let's assume valid role or handle 403 error from backend.
    }

    if (isError) {
      toast.error(message);
    }

    if (isSuccess) {
      toast.success("Event created successfully!");
      navigate("/");
      dispatch(reset());
    }

    return () => {
      dispatch(reset());
    };
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onSubmit = (data: EventFormData) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("location", data.location);
    formData.append("date", new Date(data.date).toISOString());
    formData.append("price", data.price.toString());
    formData.append("currency", data.currency);
    formData.append("status", data.status || "DRAFT");

    if (data.capacity) {
      formData.append("capacity", data.capacity.toString());
    }

    if (data.ticketTypes) {
      formData.append("ticketTypes", JSON.stringify(data.ticketTypes));
    }

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    // Safe access to isPublic with fallback
    formData.append("isPublic", String(data.isPublic ?? true));

    dispatch(createEvent(formData));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-indigo-600 px-6 py-8">
            <h2 className="text-3xl font-extrabold text-white">
              Create New Event
            </h2>
            <p className="mt-2 text-indigo-100">
              Share your experience with the world.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <FaImage className="mr-2 text-gray-400" /> Event Image
                </span>
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition overflow-hidden">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 w-full h-full">
                    {selectedImage ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center group">
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Preview"
                          className="w-full h-full object-contain p-2"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-semibold">
                            Click to change
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <FaImage className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedImage(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Event Title
                </label>
                <input
                  type="text"
                  {...register("title")}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border ${errors.title ? "border-red-300" : ""}`}
                  placeholder="e.g. Summer Music Festival"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border ${errors.description ? "border-red-300" : ""}`}
                  placeholder="Tell people what your event is about..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <span className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" /> Location
                  </span>
                </label>
                <input
                  type="text"
                  {...register("location")}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border ${errors.location ? "border-red-300" : ""}`}
                  placeholder="Venue or Online Link"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <span className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-gray-400" /> Date & Time
                  </span>
                </label>
                <input
                  type="datetime-local"
                  {...register("date")}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border ${errors.date ? "border-red-300" : ""}`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <span className="flex items-center">
                    <FaMoneyBillWave className="mr-2 text-gray-400" /> Base
                    Price ({"NGN"})
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total Capacity (Optional)
                </label>
                <input
                  type="number"
                  {...register("capacity", { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                  placeholder="e.g. 100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Status
                </label>
                <select
                  {...register("status")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                >
                  <option value="DRAFT">Draft (Not visible to public)</option>
                  <option value="PUBLISHED">
                    Published (Visible to everyone)
                  </option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.status.message}
                  </p>
                )}
              </div>

              <div className="flex items-center pl-1 pt-8">
                <input
                  id="isPublic"
                  type="checkbox"
                  {...register("isPublic")}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isPublic"
                  className="ml-2 block text-sm font-medium text-gray-700"
                >
                  List Publicly (Appears in search)
                </label>
              </div>
            </div>

            {/* Ticket Types Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Ticket Types (Optional)
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    append({ name: "", price: 0, description: "" })
                  }
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaPlus className="mr-1" /> Add Ticket Type
                </button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg relative"
                  >
                    <div className="flex-1">
                      <input
                        {...register(`ticketTypes.${index}.name` as const)}
                        placeholder="Ticket Name (e.g. VIP)"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                      {errors.ticketTypes?.[index]?.name && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.ticketTypes[index]?.name?.message}
                        </p>
                      )}
                    </div>
                    <div className="w-full sm:w-32">
                      <input
                        type="number"
                        step="0.01"
                        {...register(`ticketTypes.${index}.price` as const, {
                          valueAsNumber: true,
                        })}
                        placeholder="Price"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        {...register(
                          `ticketTypes.${index}.description` as const,
                        )}
                        placeholder="Description (Optional)"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? "Creating..." : "Create Event"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
