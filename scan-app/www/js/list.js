document.addEventListener("deviceready", function () {
  const listEl = document.getElementById("reservation-list");
  const search = document.getElementById("search");

  // Forcer JSON pour cordova-plugin-advanced-http
  try {
    if (cordova?.plugin?.http?.setDataSerializer) {
      cordova.plugin.http.setDataSerializer("json");
    }
  } catch (e) {
    console.warn("⚠️ Impossible de fixer le serializer JSON (plugin HTTP).");
  }

  // ------- STATE PAGINATION -------
  let page = 1;
  const pageSize = 40;
  const orderBy = "reservation__datetime";
  const orderDir = "desc";
  let canLoadMore = false;
  let isLoading = false;

  // ------- HELPERS -------
  function truthyBool(v) {
    return v === true || v === "true" || v === 1 || v === "1";
  }

  function computeIsScanned(res) {
    // 1) Si le back expose un booléen, on s'y fie
    if (
      truthyBool(res.scanned) ||
      truthyBool(res.is_scanned) ||
      truthyBool(res.checked_in) ||
      truthyBool(res.is_checked_in) ||
      truthyBool(res.already_scanned) ||
      truthyBool(res.was_scanned)
    ) {
      return true;
    }

    // 2) Sinon, on interprète le libellé texte, mais prudemment
    const s = (res.status || res.ticket_status || res.state || "")
      .toString()
      .trim()
      .toLowerCase();

    if (!s) return false;

    // expressions “non scanné”
    const neg = /\b(non\s+scann[ée]|not\s+scann(ed|é)|jamais\s+scann[ée])\b/;
    if (neg.test(s)) return false;

    // expressions positives
    const pos =
      /\b(scann[ée]|scanned|checked[-\s]?in|valid[ée]|validated|check[ -]?in\s+ok)\b/;
    return pos.test(s);
  }

  function normalizeTicket(t) {
    return {
      uuid: t.uuid,
      // différents noms possibles selon modèles
      status: t.status || t.ticket_status || t.state || "",
      scanned:
        t.scanned ??
        t.is_scanned ??
        t.checked_in ??
        t.is_checked_in ??
        t.already_scanned ??
        t.was_scanned ??
        null,
      name:
        t.first_name || t.last_name
          ? `${t.first_name || ""} ${t.last_name || ""}`.trim()
          : t.email || "(Nom inconnu)",
      email: t.email || "—",
      // si le back l’expose, on s’en servira pour valider via /scan/ticket/
      qrcode_data:
        t.qrcode_data ||
        t.qr_code_data ||
        t.qrdata ||
        t.qr ||
        t.qr_string ||
        null,

      custom_form:
        t.custom_form ||
        t.form_data ||
        t.extra_fields ||
        t.custom_fields ||
        null,
    };
  }

  function renderList(items, { append = false } = {}) {
    if (!append) listEl.innerHTML = "";

    if (!items || items.length === 0) {
      if (!append) listEl.innerHTML = "<li>Aucun résultat trouvé.</li>";
      return;
    }

    items.forEach((res) => {
      const li = document.createElement("li");
      li.setAttribute("data-uuid", res.uuid || "");
      if (res.qrcode_data) li.setAttribute("data-qrcode", res.qrcode_data);

      const isScanned = computeIsScanned(res);

      //  contenu principal
      let html = `
      <strong>${res.name}</strong>
      <div class="email">${res.email}</div>
      <div class="status ${isScanned ? "scanned" : "not-scanned"}">
        ${isScanned ? " Déjà scanné" : " Non scanné"}
      </div>
      ${!isScanned ? `<button class="valider-btn">Valider</button>` : ""}
    `;

      //  custom_form si présent
      if (res.custom_form) {
        let formHtml = "";

        // Si c’est un tableau [{ label, value }]
        if (Array.isArray(res.custom_form)) {
          res.custom_form.forEach((field) => {
            const label = field.label || field.slug || "";
            const value = field.value || "";
            if (value) {
              formHtml += `<div class="custom-field"><strong>${label}:</strong> ${value}</div>`;
            }
          });
        }
        // Si c’est un objet clé/valeur classique (ancien format)
        else if (typeof res.custom_form === "object") {
          for (const [key, val] of Object.entries(res.custom_form)) {
            formHtml += `<div class="custom-field"><strong>${key}:</strong> ${val}</div>`;
          }
        }
        // Si c’est une simple chaîne
        else if (typeof res.custom_form === "string") {
          formHtml = `<div class="custom-field">${res.custom_form}</div>`;
        }

        html += `
    <div class="custom-form">
      ${formHtml}
    </div>
  `;
      }

      li.innerHTML = html;
      listEl.appendChild(li);
    });

    injectLoadMore();
  }

  function injectLoadMore() {
    const old = document.getElementById("load-more");
    if (old) old.remove();
    if (!canLoadMore) return;

    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.id = "load-more";
    btn.textContent = isLoading ? "Chargement..." : "Charger plus";
    btn.disabled = isLoading;
    btn.addEventListener("click", () => {
      if (!isLoading) loadNextPage();
    });
    li.appendChild(btn);
    listEl.appendChild(li);
  }

  // ------- API HELPERS -------
  function getApiConfig() {
    const apiKey = localStorage.getItem("apiKey");
    const apiBaseUrl = localStorage.getItem("apiBaseUrl");
    const eventUuid = localStorage.getItem("selectedEventUuid");
    if (!apiKey || !apiBaseUrl || !eventUuid) {
      console.error("❌ Clé API, URL ou UUID événement manquant");
      return null;
    }
    const headers = {
      Authorization: `Api-Key ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    return { apiBaseUrl, eventUuid, headers };
  }

  // ------- LIST (par défaut) -------
  function fetchTicketsPage({ pageNum = 1, append = false } = {}) {
    const cfg = getApiConfig();
    if (!cfg) {
      renderList([]);
      return;
    }
    const { apiBaseUrl, eventUuid, headers } = cfg;

    const url = `${apiBaseUrl}/scan/list_tickets/`;
    const body = {
      event_uuid: eventUuid,
      page: pageNum,
      page_size: pageSize,
      order_by: orderBy,
      order_dir: orderDir,
    };

    isLoading = true;
    injectLoadMore();

    cordova.plugin.http.post(
      url,
      body,
      headers,
      function (response) {
        try {
          const data = JSON.parse(response.data || "{}");
          const items = Array.isArray(data.results)
            ? data.results
            : Array.isArray(data.items)
            ? data.items
            : [];

          const normalized = items.map(normalizeTicket);
          renderList(normalized, { append });

          // Pagination
          const totalPages = data.total_pages || data.pages || null;
          const currentPage = data.page || pageNum;
          const count = data.count || data.total_count || null;

          if (totalPages) {
            canLoadMore = currentPage < totalPages;
          } else if (count != null) {
            const shown = currentPage * pageSize;
            canLoadMore = shown < count;
          } else {
            canLoadMore = items.length === pageSize;
          }

          page = currentPage;
        } catch (e) {
          console.error("❌ Erreur parsing list_tickets :", e);
          if (!append) renderList([]);
          canLoadMore = false;
        } finally {
          isLoading = false;
          injectLoadMore();
        }
      },
      function (error) {
        console.error("❌ Erreur API list_tickets :", error);
        if (!append) renderList([]);
        canLoadMore = false;
        isLoading = false;
        injectLoadMore();
      }
    );
  }

  function loadNextPage() {
    if (isLoading) return;
    fetchTicketsPage({ pageNum: page + 1, append: true });
  }

  // ------- SEARCH (affine quand on tape) -------
  function fetchReservations(term = "") {
    const cfg = getApiConfig();
    if (!cfg) {
      renderList([]);
      return;
    }
    const { apiBaseUrl, eventUuid, headers } = cfg;

    const searchString = (term || "").trim();

    if (searchString === "") {
      page = 1;
      canLoadMore = false;
      fetchTicketsPage({ pageNum: 1, append: false });
      return;
    }

    const url = `${apiBaseUrl}/scan/search_ticket/`;
    const body = {
      search: searchString,
      event_uuid: eventUuid,
    };

    isLoading = true;
    injectLoadMore();

    cordova.plugin.http.post(
      url,
      body,
      headers,
      function (response) {
        try {
          const data = JSON.parse(response.data || "{}");
          const items = Array.isArray(data.results) ? data.results : [];
          const normalized = items.map(normalizeTicket);
          renderList(normalized, { append: false });
          canLoadMore = false; // sauf si l’API h renvoie de la pagination
        } catch (e) {
          console.error("❌ Erreur parsing search_ticket :", e);
          renderList([]);
          canLoadMore = false;
        } finally {
          isLoading = false;
          injectLoadMore();
        }
      },
      function (error) {
        console.error("❌ Erreur API search_ticket :", error);
        renderList([]);
        canLoadMore = false;
        isLoading = false;
        injectLoadMore();
      }
    );
  }

  async function validateTicket(li) {
    const uuid = li.getAttribute("data-uuid");
    const qrcode = li.getAttribute("data-qrcode"); // maintenant présent
    if (!uuid) return { ok: false, message: "UUID manquant" };

    const cfg = getApiConfig();
    if (!cfg) return { ok: false, message: "Config API manquante" };
    const { apiBaseUrl, eventUuid, headers } = cfg;

    // ✅ On envoie maintenant le QR complet, pas juste l'UUID
    if (!qrcode) {
      return {
        ok: false,
        message:
          "QR code non disponible pour ce billet (le backend ne l’a pas renvoyé).",
      };
    }

    return new Promise((resolve) => {
      cordova.plugin.http.post(
        `${apiBaseUrl}/scan/ticket/`,
        { qrcode_data: qrcode, event_uuid: eventUuid },
        headers,
        function (response) {
          try {
            const json = JSON.parse(response.data || "{}");
            if (
              response.status >= 200 &&
              response.status < 300 &&
              (json.success || json.ok)
            ) {
              resolve({ ok: true, data: json });
            } else {
              resolve({
                ok: false,
                message:
                  json.message || json.error || `Erreur ${response.status}`,
              });
            }
          } catch (e) {
            resolve({ ok: false, message: "Réponse invalide du serveur" });
          }
        },
        function (error) {
          console.error("❌ /scan/ticket (validation depuis liste) :", error);
          resolve({ ok: false, message: "Erreur réseau ou serveur" });
        }
      );
    });
  }

  if (search) {
    search.addEventListener("input", () => {
      fetchReservations(search.value || "");
    });
  }

  // Chargement initial : liste des tickets (page 1)
  page = 1;
  fetchTicketsPage({ pageNum: 1, append: false });

  // Délégation de click pour "Valider"
  document
    .getElementById("reservation-list")
    .addEventListener("click", async (e) => {
      const btn = e.target.closest(".valider-btn");
      if (!btn) return;

      const li = btn.closest("li");
      if (!li) return;

      btn.disabled = true;
      const oldLabel = btn.textContent;
      btn.textContent = "Validation...";

      const result = await validateTicket(li);

      btn.disabled = false;
      btn.textContent = oldLabel;

      if (result.ok) {
        alert("✅ Billet validé !");
        // refresh
        if (search && (search.value || "").trim() !== "") {
          fetchReservations(search.value.trim());
        } else {
          page = 1;
          fetchTicketsPage({ pageNum: 1, append: false });
        }
      } else {
        alert("❌ Erreur : " + (result.message || "Échec de validation"));
      }
    });
});
