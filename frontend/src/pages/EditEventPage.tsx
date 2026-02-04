import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getEvent, updateEvent, reset } from "../features/events/eventSlice";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaSave,
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
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]),
  // ticketTypes omitted for simplicity in update for now, or handled if returned by API
});

type EventFormData = z.infer<typeof eventSchema>;

const EditEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Select both the detailed event and status flags
  const { event, isLoading, isSuccess, isError, message } = useAppSelector(
    (state) => state.events,
  );
  const { user } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  // Fetch event data on mount
  useEffect(() => {
    if (id) {
      dispatch(getEvent(id));
    }
    return () => {
      dispatch(reset());
    };
  }, [dispatch, id]);

  // Populate form when event data is available
  useEffect(() => {
    if (event) {
      setValue("title", event.title);
      setValue("description", event.description);
      setValue("location", event.location);
      // Format date for datetime-local input: YYYY-MM-DDTHH:mm
      const date = new Date(event.date);
      const formattedDate = date.toISOString().slice(0, 16);
      setValue("date", formattedDate);
      setValue("price", event.price);
      setValue("currency", event.currency);
      setValue("capacity", event.capacity);
      setValue("status", event.status as any); // Cast because existing event might have different string casing or type
    }
  }, [event, setValue]);

  useEffect(() => {
    if (!user) {
      toast.error("You must be logged in to edit an event");
      navigate("/login");
      return;
    }

    if (isError) {
      toast.error(message);
    }

    if (isSuccess && !isLoading && event) {
      // This success check is tricky because getEvent also sets isSuccess.
      // We might want to separate 'updateSuccess' in slice or just rely on navigating back
      // For now, we manually handle navigation in onSubmit promise or assume reset was called correctly.
      // Actually, since we dispatched getEvent on mount, isSuccess might be true from that.
      // It's safer to handle the successful update in the onSubmit async dispatch.
    }
  }, [user, isError, message, navigate, isSuccess, isLoading, event]);

  const onSubmit = async (data: EventFormData) => {
    if (!id) return;

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("location", data.location);
    formData.append("date", new Date(data.date).toISOString());
    formData.append("price", data.price.toString());
    formData.append("currency", data.currency);
    formData.append("status", data.status);

    if (data.capacity) {
      formData.append("capacity", data.capacity.toString());
    }

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      // We explicitly wait for the result here to separate update success from fetch success
      const resultAction = await dispatch(
        updateEvent({ id, eventData: formData }),
      );
      if (updateEvent.fulfilled.match(resultAction)) {
        toast.success("Event updated successfully!");
        navigate("/my-events");
      } else {
        if (resultAction.payload) {
          toast.error(resultAction.payload as string);
        } else {
          toast.error("Update failed");
        }
      }
    } catch (err) {
      console.error("Failed to update event", err);
      toast.error("Failed to update event");
    }
  };

  if (isLoading && !event) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-indigo-600 px-6 py-8">
            <h2 className="text-3xl font-extrabold text-white">Edit Event</h2>
            <p className="mt-2 text-indigo-100">Update your event details.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <FaImage className="mr-2 text-gray-400" /> Event Image
                </span>
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition relative overflow-hidden group">
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    {selectedImage ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Preview"
                          className="w-full h-full object-contain p-2"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                          <p className="text-white font-semibold flex items-center">
                            <FaImage className="mr-2" /> Change Image
                          </p>
                        </div>
                      </div>
                    ) : event?.imageUrl ? (
                      <div className="relative w-full h-full">
                        <img
                          src={
                            event.imageUrl.startsWith("http")
                              ? event.imageUrl
                              : `${(import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1").replace("/api/v1", "")}${event.imageUrl}`
                          }
                          className="w-full h-full object-cover"
                          alt="Current"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all flex flex-col items-center justify-center z-10">
                          <FaImage className="w-8 h-8 text-white mb-2 shadow-sm" />
                          <p className="text-white font-semibold shadow-sm">
                            Click to replace current image
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FaImage className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                      </div>
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
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border ${errors.price ? "border-red-300" : ""}`}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  {...register("status")}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border ${errors.status ? "border-red-300" : ""}`}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-5">
              <button
                type="button"
                onClick={() => navigate("/my-events")}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaSave className="mr-2" /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;
