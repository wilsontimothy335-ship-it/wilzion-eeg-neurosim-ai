import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { logActivity } from "@/lib/activity";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";

const GENDERS = ["Male", "Female", "Prefer not to say"];

function fieldLabel(id) {
  return (
    <label htmlFor={id} className="block text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-2">
      {id}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm outline-none focus:border-indigo-400/50 transition-colors";

export default function ProfileEdit() {
  const { toast } = useToast();
  const [form, setForm] = useState({ full_name: "", age: "", gender: "", occupation: "", photo_url: "" });
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
      if (profiles.length > 0) {
        const p = profiles[0];
        setRecordId(p.id);
        setForm({
          full_name: p.full_name || "",
          age: p.age ?? "",
          gender: p.gender || "",
          occupation: p.occupation || "",
          photo_url: p.photo_url || "",
        });
      } else if (me.full_name || me.email) {
        setForm((f) => ({ ...f, full_name: me.full_name || (me.email || "").split("@")[0] }));
      }
      setLoading(false);
    })();
  }, []);

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, photo_url: file_url }));
      toast({ title: "Photo uploaded", description: "Remember to save your profile." });
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSave() {
    if (!form.full_name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        age: form.age === "" ? null : Number(form.age),
        gender: form.gender || "",
        occupation: form.occupation.trim(),
        photo_url: form.photo_url,
      };
      if (recordId) {
        await base44.entities.UserProfile.update(recordId, payload);
      } else {
        const rec = await base44.entities.UserProfile.create(payload);
        setRecordId(rec.id);
      }
      toast({ title: "✓ Profile saved", description: "Your details now follow you across devices." });
      logActivity("profile_update", "Updated profile details");
    } catch (err) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 10% 20%,rgba(59,130,246,0.08) 0%,transparent 60%)",
        }}
      />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-16">
        <nav className="flex items-center gap-3 py-5 border-b border-white/[0.07] mb-8 flex-wrap">
          <Link
            to="/"
            className="px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-colors"
          >
            ← Home
          </Link>
          <div className="flex-1" />
          <Link
            to="/neurosim"
            className="px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-colors"
          >
            ⚡ Detector
          </Link>
          <Link
            to="/database"
            className="px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-colors"
          >
            🗄️ Database
          </Link>
        </nav>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-slate-300 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                These details personalise your AI analysis and reports.
              </p>
            </div>

            {/* Photo */}
            <div className="rounded-2xl border border-white/[0.07] bg-card p-5 flex items-center gap-5">
              <Image
                src={form.photo_url}
                className="w-20 h-20 rounded-full border border-white/10 shrink-0 overflow-hidden"
                alt="Profile"
              />
              <div className="flex-1">
                <div className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-2">
                  Profile picture
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhoto}
                  className="hidden"
                  id="photo-input"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-indigo-400/30 bg-indigo-500/10 text-indigo-300 cursor-pointer hover:bg-indigo-500/20 transition-colors disabled:opacity-60"
                >
                  {uploading ? "Uploading..." : form.photo_url ? "Change photo" : "Upload photo"}
                </button>
              </div>
            </div>

            {/* Fields */}
            <div className="rounded-2xl border border-white/[0.07] bg-card p-5 space-y-5">
              <div>
                {fieldLabel("Full name")}
                <input
                  id="Full name"
                  className={inputCls}
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  {fieldLabel("Age")}
                  <input
                    id="Age"
                    type="number"
                    min="0"
                    max="120"
                    className={inputCls}
                    value={form.age}
                    onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                    placeholder="e.g. 24"
                  />
                </div>
                <div>
                  {fieldLabel("Gender")}
                  <select
                    id="Gender"
                    className={inputCls + " cursor-pointer"}
                    value={form.gender}
                    onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                {fieldLabel("Occupation")}
                <input
                  id="Occupation"
                  className={inputCls}
                  value={form.occupation}
                  onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))}
                  placeholder="e.g. Student, Engineer, Teacher"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-xl font-bold text-sm text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
                boxShadow: "0 4px 18px rgba(99,102,241,0.35)",
              }}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}