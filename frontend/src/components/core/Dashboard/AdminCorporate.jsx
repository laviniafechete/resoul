import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import { apiConnector } from "../../../services/apiConnector";
import { adminEndpoints } from "../../../services/apis";

const INITIAL_FORM_STATE = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  contactNumber: "",
};

export default function AdminCorporate() {
  const { token } = useSelector((state) => state.auth);
  const [corporateUsers, setCorporateUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);

  const fetchCorporateUsers = async () => {
    try {
      setLoading(true);
      const res = await apiConnector(
        "GET",
        adminEndpoints.LIST_USERS_API("Corporate"),
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );
      setCorporateUsers(res?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch corporate users", error);
      toast.error("Nu s-au putut încărca conturile corporate");
      setCorporateUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorporateUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => setForm(INITIAL_FORM_STATE);

  const handleCreateCorporateUser = async (event) => {
    event.preventDefault();

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error("Completează câmpurile obligatorii");
      return;
    }

    const payload = { ...form };
    if (!payload.contactNumber) {
      delete payload.contactNumber;
    } else {
      const sanitizedNumber = payload.contactNumber.replace(/\D/g, "");
      if (!sanitizedNumber) {
        delete payload.contactNumber;
      } else {
        payload.contactNumber = sanitizedNumber;
      }
    }

    try {
      setSubmitting(true);
      await apiConnector(
        "POST",
        adminEndpoints.CREATE_CORPORATE_USER_API,
        payload,
        {
          Authorization: `Bearer ${token}`,
        }
      );
      toast.success("Cont corporate creat cu succes");
      resetForm();
      fetchCorporateUsers();
    } catch (error) {
      console.error("Failed to create corporate user", error);
      const message =
        error?.response?.data?.message || "Crearea contului corporate a eșuat";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (userId, isActive) => {
    const confirmed = window.confirm(
      isActive
        ? "Sigur vrei să dezactivezi acest cont corporate?"
        : "Sigur vrei să reactivezi acest cont corporate?"
    );
    if (!confirmed) return;

    try {
      await apiConnector(
        "PATCH",
        adminEndpoints.TOGGLE_ACTIVE_API(userId),
        {},
        {
          Authorization: `Bearer ${token}`,
        }
      );
      toast.success(isActive ? "Cont dezactivat" : "Cont reactivat");
      fetchCorporateUsers();
    } catch (error) {
      console.error("Failed to toggle corporate active state", error);
      toast.error("Actualizarea statusului a eșuat");
    }
  };

  return (
    <div>
      <h1 className="text-4xl text-richblack-300 font-boogaloo mb-8">
        Conturi Corporate
      </h1>

      <section className="mb-10 rounded-lg border border-brand-primary bg-lavender-50 p-6">
        <h2 className="text-2xl font-semibold text-brand-text mb-4">
          Creează un cont corporate
        </h2>
        <form onSubmit={handleCreateCorporateUser} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col text-sm text-brand-text">
              Prenume <span className="text-pink-200">*</span>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleInputChange}
                className="form-style mt-1"
                placeholder="Ex: ACME"
                required
              />
            </label>
            <label className="flex flex-col text-sm text-brand-text">
              Nume <span className="text-pink-200">*</span>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleInputChange}
                className="form-style mt-1"
                placeholder="Ex: Corp"
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col text-sm text-brand-text">
              Email <span className="text-pink-200">*</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                className="form-style mt-1"
                placeholder="corporate@companie.ro"
                required
              />
            </label>
            <label className="flex flex-col text-sm text-brand-text">
              Parolă temporară <span className="text-pink-200">*</span>
              <input
                type="text"
                name="password"
                value={form.password}
                onChange={handleInputChange}
                className="form-style mt-1"
                placeholder="Setează o parolă inițială"
                required
                minLength={6}
              />
            </label>
          </div>

          <label className="flex flex-col text-sm text-brand-text">
            Telefon (opțional)
            <input
              type="tel"
              name="contactNumber"
              value={form.contactNumber}
              onChange={handleInputChange}
              className="form-style mt-1"
              placeholder="07xxxxxxxx"
            />
          </label>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-brand-primary px-6 py-2 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Se creează..." : "Creează cont"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={submitting}
              className="rounded-xl border border-brand-primary px-6 py-2 text-brand-primary transition hover:bg-brand-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Resetează
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-brand-primary bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-brand-text">
            Conturi existente
          </h2>
          <button
            onClick={fetchCorporateUsers}
            className="text-sm text-brand-primary underline"
            disabled={loading}
          >
            Reîncarcă lista
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-brand-text">Se încarcă...</div>
        ) : corporateUsers.length === 0 ? (
          <p className="text-brand-text">
            Nu există conturi corporate create încă.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-lavender-100">
                <tr>
                  <th className="px-4 py-2 text-left">Utilizator</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Creat la</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {corporateUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t border-brand-primary/30"
                  >
                    <td className="px-4 py-3 font-medium text-brand-text">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-3 text-brand-text/80">{user.email}</td>
                    <td className="px-4 py-3 text-brand-text/80">
                      {new Date(user.createdAt).toLocaleDateString("ro-RO")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.active
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {user.active ? "Activ" : "Dezactivat"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(user._id, user.active)}
                        className="rounded border border-brand-primary px-3 py-1 text-xs text-brand-primary hover:bg-brand-primary hover:text-white"
                      >
                        {user.active ? "Dezactivează" : "Activează"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

