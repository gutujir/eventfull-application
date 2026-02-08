import { useState, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { validateEventTicket, reset } from "../features/tickets/ticketSlice";
import {
  FaQrcode,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaCamera,
  FaKeyboard,
  FaUpload,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { Html5Qrcode } from "html5-qrcode";

const VerifyTicketPage = () => {
  const [searchParams] = useSearchParams();
  const initialEventId = searchParams.get("eventId") || "";

  const [eventId, setEventId] = useState(initialEventId);
  const [qrCode, setQrCode] = useState("");
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const dispatch = useAppDispatch();
  const { isLoading, isError, message, isSuccess, ticket } = useAppSelector(
    (state) => state.tickets,
  );

  // Ref for the QR input to keep focus for specialized scanners
  const qrInputRef = useRef<HTMLInputElement>(null);
  const html5QrRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const stopCamera = async () => {
    if (html5QrRef.current) {
      try {
        // isScanning is available at runtime in html5-qrcode
        if ((html5QrRef.current as any).isScanning) {
          await html5QrRef.current.stop();
        }
      } catch (error) {
        console.error("Failed to stop camera", error);
      }
      try {
        await html5QrRef.current.clear();
      } catch (error) {
        console.error("Failed to clear camera", error);
      }
    }
    setIsCameraOn(false);
  };

  const startCamera = async () => {
    if (!html5QrRef.current) {
      html5QrRef.current = new Html5Qrcode("reader");
    }

    try {
      await html5QrRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setQrCode(decodedText);
          setScanResult(null);
          // Auto-submit on scan
          if (eventId) {
            dispatch(validateEventTicket({ eventId, qrCode: decodedText }));
          } else {
            toast.info("Scanned! Now enter Event ID and Verify.");
          }
          void stopCamera();
        },
        () => undefined,
      );
      setIsCameraOn(true);
    } catch (error: any) {
      console.error("Failed to start camera", error);
      toast.error(error?.message || "Unable to access camera");
      setIsCameraOn(false);
    }
  };

  useEffect(() => {
    return () => {
      void stopCamera();
    };
  }, []);

  const handleQrImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode("qr-file-reader");
      const decodedText = await html5QrCode.scanFile(file, true);
      await html5QrCode.clear();

      setQrCode(decodedText);
      setScanResult(null);
      if (eventId) {
        dispatch(validateEventTicket({ eventId, qrCode: decodedText }));
      } else {
        toast.info("QR detected. Now enter Event ID and Verify.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to read QR image");
    } finally {
      e.target.value = "";
    }
  };

  // Handle successful validation
  useEffect(() => {
    if (isSuccess && scanResult === null) {
      setScanResult({
        success: true,
        message: message || "Ticket verified successfully! Access Granted.",
      });
      setQrCode(""); // Clear for next scan
      dispatch(reset());
      toast.success(message || "Ticket Verified!");
    }
  }, [isSuccess, dispatch, scanResult, message]);

  // Handle error validation
  useEffect(() => {
    if (isError) {
      const rawMessage = message || "Invalid ticket";
      const isUsed = rawMessage.toLowerCase().includes("used");
      const friendlyMessage = isUsed
        ? "Ticket already used. Ask attendee to provide a valid ticket or contact support."
        : rawMessage;
      setScanResult({ success: false, message: friendlyMessage });
      setQrCode(""); // Clear for next scan
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !qrCode) {
      toast.error("Please provide Event ID and Ticket Code");
      return;
    }
    setScanResult(null); // Reset previous result display
    dispatch(validateEventTicket({ eventId, qrCode }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl">
        <div className="md:flex">
          <div className="p-8 w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaQrcode className="mr-2 text-indigo-600" />
                Verify Tickets
              </h2>
              <Link
                to="/dashboard"
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <FaArrowLeft className="mr-1" /> Dashboard
              </Link>
            </div>

            <div className="flex justify-center mb-6 space-x-4">
              <button
                type="button"
                onClick={() => {
                  void stopCamera();
                  setIsCameraMode(false);
                  setIsUploadMode(false);
                }}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !isCameraMode && !isUploadMode
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <FaKeyboard className="mr-2" /> Manual / USB
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCameraMode(true);
                  setIsUploadMode(false);
                }}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isCameraMode
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <FaCamera className="mr-2" /> Camera Scan
              </button>
              <button
                type="button"
                onClick={() => {
                  void stopCamera();
                  setIsCameraMode(false);
                  setIsUploadMode(true);
                }}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isUploadMode
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <FaUpload className="mr-2" /> Upload QR
              </button>
            </div>

            {isCameraMode ? (
              <div className="mb-6">
                <div id="reader" className="w-full"></div>
                <p className="text-center text-xs text-gray-500 mt-2">
                  Point camera at QR code
                </p>
                <div className="mt-4 flex justify-center">
                  {isCameraOn ? (
                    <button
                      type="button"
                      onClick={() => void stopCamera()}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                    >
                      Turn camera off
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void startCamera()}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Turn camera on
                    </button>
                  )}
                </div>
              </div>
            ) : isUploadMode ? (
              <div className="mb-6">
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                  <FaUpload className="mx-auto text-indigo-500" size={28} />
                  <p className="mt-2 text-sm text-gray-600">
                    Upload a QR image to extract the ticket code.
                  </p>
                  <label className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm cursor-pointer hover:bg-indigo-700">
                    Choose QR Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div id="qr-file-reader" className="hidden"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Event ID
                  </label>
                  <input
                    type="text"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    placeholder="Paste Event ID here"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ticket Code or Booking Ref
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      ref={qrInputRef}
                      type="text"
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value)}
                      placeholder="Scan or type ticket code / ref"
                      className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the Ticket Code (QR string) or the Booking Reference
                    ID.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {isLoading ? "Verifying..." : "Verify Ticket"}
                </button>
              </form>
            )}

            {/* Result Display */}
            {scanResult && (
              <div
                className={`mt-8 p-4 rounded-lg flex items-start ${
                  scanResult.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex-shrink-0">
                  {scanResult.success ? (
                    <FaCheckCircle className="h-6 w-6 text-green-400" />
                  ) : (
                    <FaTimesCircle className="h-6 w-6 text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <h3
                    className={`text-lg font-medium ${
                      scanResult.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {scanResult.success ? "Verified" : "Verification Failed"}
                  </h3>
                  <div
                    className={`mt-2 text-sm ${
                      scanResult.success ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    <p>{scanResult.message}</p>
                    {scanResult.success && ticket?.event?.title && (
                      <p className="mt-1 text-xs text-green-700">
                        Event: {ticket.event.title}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Instructions
              </h4>
              <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
                <li>Ensure you are the creator of the event.</li>
                <li>
                  Use a barcode scanner connected to this device, or type the
                  code manually.
                </li>
                <li>Valid tickets will be marked as USED instantly.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyTicketPage;
