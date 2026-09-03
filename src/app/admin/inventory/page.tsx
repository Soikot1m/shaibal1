import { db } from "@/db";
import { hotels, transport, tours } from "@/db/schema";
import { desc } from "drizzle-orm";
import { formatCurrency } from "@/lib/utils";
import { saveHotel, saveTransport, deleteHotel, deleteTransport } from "@/app/admin/actions";
import { Bed, Bus, Trash2, Plus } from "lucide-react";

export default async function AdminInventory() {
  const [hotelRows, transportRows, tourRows] = await Promise.all([
    db.select().from(hotels).orderBy(desc(hotels.createdAt)),
    db.select().from(transport).orderBy(desc(transport.createdAt)),
    db.select({ id: tours.id, title: tours.title }).from(tours),
  ]);
  const tourOpts = tourRows;

  return (
    <>
      <div>
        <p className="chip mb-2">Inventory</p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl">Hotels &amp; Transport</h1>
        <p className="text-sm text-muted mt-1">Real inventory linked to tours and trips. Driver and contact details are optional — only add what is confirmed.</p>
      </div>

      {/* ---- Hotels ---- */}
      <section className="card p-5">
        <h2 className="font-display font-bold flex items-center gap-2 mb-4"><Bed className="h-5 w-5 text-lagoon-500" /> Add hotel</h2>
        <form
          action={async (fd: FormData) => {
            "use server";
            await saveHotel(Object.fromEntries(fd) as Record<string, unknown>);
          }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <label className="field lg:col-span-2">Hotel name<input required name="hotelName" className="input" placeholder="Hillside Cottage" /></label>
          <label className="field">Location<input name="location" className="input" placeholder="Bandarban" /></label>
          <label className="field">Room type<input name="roomType" className="input" placeholder="Double / Dorm" /></label>
          <label className="field">Price / night (৳)<input type="number" min="0" name="pricePerNight" className="input" /></label>
          <label className="field">Capacity<input type="number" min="1" name="capacity" className="input" placeholder="2" /></label>
          <label className="field">Link to tour<select name="tourId" className="input"><option value="">— none —</option>{tourOpts.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
          <label className="field">Contact<input name="contact" className="input" placeholder="Optional" /></label>
          <label className="field sm:col-span-2 lg:col-span-3">Amenities (one per line)<textarea name="amenities" rows={2} className="input" placeholder={"AC\nHot water\nBreakfast"} /></label>
          <div className="flex items-end"><button className="btn btn-primary w-full"><Plus className="h-4 w-4" /> Add hotel</button></div>
        </form>
      </section>

      <section className="card p-5 overflow-x-auto">
        <h2 className="font-display font-bold mb-3">Hotels ({hotelRows.length})</h2>
        {hotelRows.length === 0 ? (
          <p className="text-sm text-muted">No hotels recorded yet. Add one above — it can then be referenced in itineraries and trips.</p>
        ) : (
          <table className="table-base">
            <thead><tr><th>Hotel</th><th>Location</th><th>Room</th><th className="text-right">Price / night</th><th>Capacity</th><th></th></tr></thead>
            <tbody>
              {hotelRows.map((h) => (
                <tr key={h.id}>
                  <td className="font-medium">{h.hotelName}</td>
                  <td>{h.location || "—"}</td>
                  <td>{h.roomType || "—"}</td>
                  <td className="text-right font-semibold">{formatCurrency(h.pricePerNight)}</td>
                  <td>{h.capacity}</td>
                  <td>
                    <form action={async () => { "use server"; await deleteHotel(h.id); }}>
                      <button className="text-rose-500 p-1" aria-label={`Delete ${h.hotelName}`}><Trash2 className="h-4 w-4" /></button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ---- Transport ---- */}
      <section className="card p-5">
        <h2 className="font-display font-bold flex items-center gap-2 mb-4"><Bus className="h-5 w-5 text-lagoon-500" /> Add transport</h2>
        <form
          action={async (fd: FormData) => {
            "use server";
            await saveTransport(Object.fromEntries(fd) as Record<string, unknown>);
          }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <label className="field">Vehicle type<select name="vehicleType" className="input">{["bus", "microbus", "car", "train", "flight", "boat", "jeep"].map((v) => <option key={v} value={v}>{v}</option>)}</select></label>
          <label className="field">Provider<input name="provider" className="input" placeholder="e.g. Green Line" /></label>
          <label className="field">Vehicle number<input name="vehicleNumber" className="input" placeholder="Optional" /></label>
          <label className="field">Seat capacity<input type="number" min="1" name="seatCapacity" className="input" placeholder="30" /></label>
          <label className="field">Driver<input name="driver" className="input" placeholder="Only if confirmed" /></label>
          <label className="field">Driver phone<input name="driverPhone" className="input" placeholder="Only if confirmed" /></label>
          <label className="field">Route<input name="route" className="input" placeholder="Bogura → Bandarban" /></label>
          <label className="field">Cost (৳)<input type="number" min="0" name="cost" className="input" /></label>
          <label className="field lg:col-span-3">Link to tour<select name="tourId" className="input"><option value="">— none —</option>{tourOpts.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
          <div className="flex items-end"><button className="btn btn-primary w-full"><Plus className="h-4 w-4" /> Add transport</button></div>
        </form>
      </section>

      <section className="card p-5 overflow-x-auto">
        <h2 className="font-display font-bold mb-3">Transport ({transportRows.length})</h2>
        {transportRows.length === 0 ? (
          <p className="text-sm text-muted">No transport recorded yet.</p>
        ) : (
          <table className="table-base">
            <thead><tr><th>Type</th><th>Provider</th><th>Vehicle</th><th>Route</th><th className="text-right">Capacity</th><th className="text-right">Cost</th><th></th></tr></thead>
            <tbody>
              {transportRows.map((t) => (
                <tr key={t.id}>
                  <td><span className="chip">{t.vehicleType}</span></td>
                  <td>{t.provider || "—"}</td>
                  <td>{t.vehicleNumber || "—"}</td>
                  <td>{t.route || "—"}</td>
                  <td className="text-right">{t.seatCapacity}</td>
                  <td className="text-right font-semibold">{formatCurrency(t.cost)}</td>
                  <td>
                    <form action={async () => { "use server"; await deleteTransport(t.id); }}>
                      <button className="text-rose-500 p-1" aria-label="Delete transport"><Trash2 className="h-4 w-4" /></button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
