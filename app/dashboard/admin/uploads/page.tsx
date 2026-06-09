import { createClient } from "@/utils/supabase/server";
import { uploadApprovalFile, deleteApprovalItem } from "../actions";
import UploadForm from "./upload-form";
import { FileText, Image, Video, Trash2, ExternalLink } from "lucide-react";

const fileIcons: Record<string, typeof FileText> = {
  invitation: FileText,
  photo: Image,
  video_preview: Video,
};

const statusColors: Record<string, string> = {
  pending: "text-yellow-400",
  approved: "text-green-400",
  revision_requested: "text-red-400",
};

export default async function UploadsPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const [supabase, searchParamsResult] = await Promise.all([
    createClient(),
    searchParams,
  ]);
  const { booking: selectedBookingId } = searchParamsResult;

  const [bookingsRes, approvalsRes] = await Promise.all([
    supabase
      .from("events_bookings")
      .select("id, event_type, event_date, profiles!events_bookings_client_id_fkey(full_name)")
      .order("event_date", { ascending: false }),
    selectedBookingId
      ? supabase
          .from("approval_items")
          .select("*")
          .eq("booking_id", selectedBookingId)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as never[] }),
  ]);

  const bookings = bookingsRes.data;
  const approvals = approvalsRes.data;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Proof Uploads</h1>
        <p className="mt-1 text-gray-400">Upload invitation proofs, photo previews, and videos for client review.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-300 uppercase tracking-wide">Events</h2>
          <div className="space-y-1">
            {bookings && bookings.length > 0 ? (
              bookings.map((b) => {
                const isSelected = b.id === selectedBookingId;
                const clientName = (b.profiles as unknown as { full_name: string }[])?.[0]?.full_name;
                return (
                  <a
                    key={b.id}
                    href={`/dashboard/admin/uploads?booking=${b.id}`}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30"
                        : "text-gray-300 hover:bg-gray-800 border border-transparent"
                    }`}
                  >
                    <div className="font-medium">{clientName ?? "Unknown"}</div>
                    <div className="text-xs text-gray-500 mt-0.5 capitalize">
                      {b.event_type} &middot;{" "}
                      {new Date(b.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </a>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 px-3">No events yet.</p>
            )}
          </div>
        </div>

        <div>
          {selectedBookingId ? (
            <div className="space-y-6">
              <UploadForm bookingId={selectedBookingId} />

              {approvals && approvals.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-300">
                    Uploaded Proofs ({approvals.length})
                  </h3>
                  {approvals.map((item) => {
                    const FileIcon = fileIcons[item.file_type ?? ""] ?? FileText;
                    return (
                      <div key={item.id} className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-800">
                              <FileIcon className="size-5 text-gray-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-200 truncate">{item.title}</p>
                              {item.description && (
                                <p className="mt-0.5 text-xs text-gray-500">{item.description}</p>
                              )}
                              <div className="mt-1 flex items-center gap-2 text-xs">
                                <span className="text-gray-600 capitalize">{item.file_type?.replace("_", " ") ?? "document"}</span>
                                <span className={`font-medium capitalize ${statusColors[item.status] ?? "text-gray-500"}`}>
                                  {item.status.replace("_", " ")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {item.file_url && (
                              <a
                                href={item.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg p-1.5 text-gray-500 hover:text-yellow-400 transition-colors"
                              >
                                <ExternalLink className="size-3.5" />
                              </a>
                            )}
                            <form action={deleteApprovalItem}>
                              <input type="hidden" name="id" value={item.id} />
                              <input type="hidden" name="fileUrl" value={item.file_url ?? ""} />
                              <button type="submit" className="rounded-lg p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                                <Trash2 className="size-3.5" />
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 p-12 text-center text-sm text-gray-500">
                  No proofs uploaded yet for this event.
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-700 p-12 text-gray-500">
              Select an event to manage proofs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
