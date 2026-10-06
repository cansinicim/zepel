"use client";

import { useActionState, useState } from "react";

import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/fields";
import { FormStatusMessage } from "@/components/admin/form-status";
import { categoryLabels, listingTypeLabels } from "@/components/admin/labels";
import {
  CATEGORY_VALUES,
  CHECKED,
  fromParsedListing,
  LISTING_TYPE_VALUES,
} from "@/components/admin/listing-form-schema";
import { Panel } from "@/components/admin/panel";
import { SubmitButton } from "@/components/admin/submit-button";
import { cn } from "@/lib/utils";

import {
  idleSaveImportDraftState,
  initialImportUrlState,
  type ImportUrlState,
} from "@/components/admin/action-state";

import {
  importFromHtmlAction,
  importFromUrlAction,
  saveImportDraftAction,
} from "../actions";

const URL_STATUS_ID = "ice-aktar-baglanti-durum";
const HTML_STATUS_ID = "ice-aktar-icerik-durum";
const DRAFT_STATUS_ID = "ice-aktar-taslak-durum";

const LISTING_TYPE_OPTIONS = LISTING_TYPE_VALUES.map((value) => ({
  value,
  label: listingTypeLabels[value],
}));

const CATEGORY_OPTIONS = CATEGORY_VALUES.map((value) => ({
  value,
  label: categoryLabels[value],
}));

/** Alanın hangi yöntemle bulunduğunu okunabilir metne çevirir. */
const PROVENANCE_LABELS: Record<string, string> = {
  "json-ld": "yapısal veri",
  "open-graph": "paylaşım etiketi",
  microdata: "microdata",
  metin: "sayfa metni",
};

type Mode = "url" | "html";

const MODES: readonly { value: Mode; label: string; hint: string }[] = [
  {
    value: "url",
    label: "Bağlantı yapıştır",
    hint: "İlan sayfasının adresini yapıştırın. Emlakjet ve Remax gibi siteler bu yolla çalışır.",
  },
  {
    value: "html",
    label: "Sayfa içeriği yapıştır",
    hint: "Sahibinden, Zingat ve Hürriyet Emlak otomatik erişimi engeller. İlan sayfasını tarayıcıda açıp içeriği kopyalayın ve buraya yapıştırın.",
  },
];

/**
 * İçe aktarma tezgâhı.
 *
 * Akış bilinçli olarak iki adımlıdır: ayrıştırma sonucu doğrudan
 * kaydedilmez, düzenlenebilir bir önizleme formuna dökülür. Yönetici alanları
 * kontrol edip düzelttikten sonra taslak olarak kaydedilir. Böylece yanlış
 * ayrıştırılmış bir fiyat veya kategori sessizce ilana dönüşmez.
 */
export function ImportWorkbench() {
  const [mode, setMode] = useState<Mode>("url");

  const [urlState, urlAction] = useActionState(
    importFromUrlAction,
    initialImportUrlState,
  );
  const [htmlState, htmlAction] = useActionState(
    importFromHtmlAction,
    initialImportUrlState,
  );

  const active: ImportUrlState = mode === "url" ? urlState : htmlState;
  const activeHint = MODES.find((item) => item.value === mode)?.hint ?? "";

  return (
    <div className="flex flex-col gap-block">
      <Panel
        title="Kaynak"
        titleId="ice-aktar-kaynak"
        description="İlan bilgilerini dış bir siteden alın. Ayrıştırma sonucu yayına girmez, önce size gösterilir."
      >
        <div
          role="group"
          aria-label="İçe aktarma yöntemi"
          className="flex flex-wrap gap-2"
        >
          {MODES.map((item) => {
            const isActive = item.value === mode;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setMode(item.value)}
                aria-pressed={isActive}
                className={cn(
                  "rounded-xs border px-4 py-2 font-sans text-body-sm transition-colors duration-[var(--duration-fast)]",
                  isActive
                    ? "border-accent text-accent"
                    : "border-border text-text-secondary hover:text-text-primary",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <p className="font-sans text-body-sm text-text-muted">{activeHint}</p>

        {mode === "url" ? (
          <form action={urlAction} className="flex flex-col gap-4">
            <TextField
              name="url"
              type="url"
              label="İlan bağlantısı"
              placeholder="https://www.emlakjet.com/ilan/..."
              inputMode="url"
              required
              error={undefined}
            />
            <div className="flex items-center gap-4">
              <SubmitButton pendingLabel="İçe aktarılıyor">İçe aktar</SubmitButton>
              <FormStatusMessage
                id={URL_STATUS_ID}
                status={urlState.status}
                message={urlState.message}
              />
            </div>
          </form>
        ) : (
          <form action={htmlAction} className="flex flex-col gap-4">
            <TextField
              name="sourceUrl"
              type="url"
              label="İlan bağlantısı (isteğe bağlı)"
              help="Kaynağı kayda geçmek için ilan adresini de yazabilirsiniz."
              inputMode="url"
            />
            <TextAreaField
              name="html"
              label="Sayfa içeriği"
              placeholder="İlan sayfasını açıp tümünü seçin, kopyalayın ve buraya yapıştırın."
              rows={10}
              required
            />
            <div className="flex items-center gap-4">
              <SubmitButton pendingLabel="İçe aktarılıyor">İçe aktar</SubmitButton>
              <FormStatusMessage
                id={HTML_STATUS_ID}
                status={htmlState.status}
                message={htmlState.message}
              />
            </div>
          </form>
        )}
      </Panel>

      {active.status === "success" && active.result && active.importId ? (
        <ImportPreview
          key={active.importId}
          importId={active.importId}
          result={active.result}
        />
      ) : null}
    </div>
  );
}

type ImportPreviewProps = {
  importId: string;
  result: NonNullable<ImportUrlState["result"]>;
};

/** Ayrıştırılan alanların düzenlenebilir önizlemesi. */
function ImportPreview({ importId, result }: ImportPreviewProps) {
  const values = fromParsedListing(result.listing);

  // Eylem, hangi içe aktarma kaydına ait olduğunu ilk argümandan alır.
  const [state, action] = useActionState(
    saveImportDraftAction.bind(null, importId),
    idleSaveImportDraftState(
      "Alanları kontrol edin, gerekirse düzeltin ve taslak olarak kaydedin.",
    ),
  );

  const shown = state.values ?? values;
  const provenanceEntries = Object.entries(result.provenance);

  return (
    <Panel
      title="Önizleme"
      titleId="ice-aktar-onizleme"
      description="Bu ilan henüz kaydedilmedi. Kaydettiğinizde taslak olarak eklenir, yayına almak ayrı bir adımdır."
    >
      {result.warnings.length > 0 ? (
        <div className="border border-border-strong bg-elevated p-4">
          <h3 className="font-sans text-body-sm text-text-primary">
            Dikkat edilmesi gerekenler
          </h3>
          <ul className="mt-2 flex flex-col gap-1">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="font-sans text-body-sm text-text-secondary"
              >
                {warning}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {provenanceEntries.length > 0 ? (
        <details className="border border-border p-4">
          <summary className="cursor-pointer font-sans text-body-sm text-text-secondary">
            Alanlar nereden geldi
          </summary>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            {provenanceEntries.map(([field, source]) => (
              <div key={field} className="flex justify-between gap-3">
                <dt className="font-sans text-body-sm text-text-muted">{field}</dt>
                <dd className="font-sans text-body-sm text-text-secondary">
                  {PROVENANCE_LABELS[source] ?? source}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      ) : null}

      <form action={action} className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <TextField
            name="title"
            label="Başlık"
            defaultValue={shown.title}
            error={state.fieldErrors.title}
            required
          />
          <TextField
            name="price"
            label="Fiyat (TL)"
            defaultValue={shown.price}
            error={state.fieldErrors.price}
            inputMode="numeric"
            required
          />
          <SelectField
            name="listingType"
            label="İlan tipi"
            defaultValue={shown.listingType}
            error={state.fieldErrors.listingType}
            options={LISTING_TYPE_OPTIONS}
            required
          />
          <SelectField
            name="category"
            label="Mülk tipi"
            defaultValue={shown.category}
            error={state.fieldErrors.category}
            options={CATEGORY_OPTIONS}
            required
          />
          <TextField
            name="city"
            label="İl"
            defaultValue={shown.city}
            error={state.fieldErrors.city}
          />
          <TextField
            name="district"
            label="İlçe"
            defaultValue={shown.district}
            error={state.fieldErrors.district}
          />
          <TextField
            name="location"
            label="Mahalle veya semt"
            defaultValue={shown.location}
            error={state.fieldErrors.location}
          />
          <TextField
            name="beds"
            label="Oda"
            defaultValue={shown.beds}
            error={state.fieldErrors.beds}
            inputMode="numeric"
          />
          <TextField
            name="baths"
            label="Banyo"
            defaultValue={shown.baths}
            error={state.fieldErrors.baths}
            inputMode="numeric"
          />
          <TextField
            name="area"
            label="Brüt alan (m2)"
            defaultValue={shown.area}
            error={state.fieldErrors.area}
            inputMode="numeric"
          />
          <TextField
            name="plotArea"
            label="Arsa alanı (m2)"
            defaultValue={shown.plotArea}
            error={state.fieldErrors.plotArea}
            inputMode="numeric"
          />
          <TextField
            name="buildYear"
            label="Yapım yılı"
            defaultValue={shown.buildYear}
            error={state.fieldErrors.buildYear}
            inputMode="numeric"
          />
        </div>

        <TextAreaField
          name="description"
          label="Açıklama"
          defaultValue={shown.description}
          error={state.fieldErrors.description}
          rows={6}
        />
        <TextAreaField
          name="features"
          label="Nitelikler"
          help="Her satıra bir nitelik yazın."
          defaultValue={shown.features}
          error={state.fieldErrors.features}
          rows={5}
        />
        <TextAreaField
          name="images"
          label="Görsel adresleri"
          help="Her satıra bir https adresi yazın."
          defaultValue={shown.images}
          error={state.fieldErrors.images}
          rows={5}
        />

        <CheckboxField
          name="featured"
          label="Öne çıkan ilan"
          value={CHECKED}
          defaultChecked={shown.featured === CHECKED}
        />

        <div className="flex flex-wrap items-center gap-4">
          <SubmitButton pendingLabel="Kaydediliyor">Taslak olarak kaydet</SubmitButton>
          <FormStatusMessage
            id={DRAFT_STATUS_ID}
            status={state.status}
            message={state.message}
          />
        </div>
      </form>
    </Panel>
  );
}
