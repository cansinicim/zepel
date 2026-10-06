"use client";

import { useActionState } from "react";

import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/fields";
import { FormStatusMessage } from "@/components/admin/form-status";
import {
  ADMIN_ACTIONS,
  categoryLabels,
  listingTypeLabels,
} from "@/components/admin/labels";
import {
  CATEGORY_VALUES,
  CHECKED,
  fromListing,
  LISTING_LIMITS,
  LISTING_TYPE_VALUES,
  type ListingFormValues,
} from "@/components/admin/listing-form-schema";
import { SubmitButton } from "@/components/admin/submit-button";
import type { Listing } from "@/lib/db/types";

import {
  idleListingFormState,
  LISTING_INTENT_FIELD,
  LISTING_INTENT_PUBLISH,
} from "@/components/admin/action-state";

import { updateListingAction } from "../../actions";

const STATUS_ID = "ilan-form-durum";

const LISTING_TYPE_OPTIONS = LISTING_TYPE_VALUES.map((value) => ({
  value,
  label: listingTypeLabels[value],
}));

const CATEGORY_OPTIONS = CATEGORY_VALUES.map((value) => ({
  value,
  label: categoryLabels[value],
}));

export interface ListingEditFormProps {
  listing: Listing;
}

/**
 * İlan düzenleme formu.
 *
 * Tek form, tek eylem: "Kaydet" ve "Kaydet ve yayınla" düğmeleri aynı
 * `updateListingAction`'ı tetikler, birbirinden yalnızca `intent` gönderim
 * değeriyle ayrılır (bkz. `src/app/admin/actions.ts`). Bu sayede form durumu
 * ikiye bölünmez, hata durumunda girilen değerler tek yerden korunur.
 */
export function ListingEditForm({ listing }: ListingEditFormProps) {
  const action = updateListingAction.bind(null, listing.id);
  const [state, formAction, isPending] = useActionState(
    action,
    idleListingFormState("Değişiklikleri kaydedin."),
  );

  const values: ListingFormValues = state.values ?? fromListing(listing);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          name="title"
          label="Başlık"
          required
          defaultValue={values.title}
          error={state.fieldErrors.title}
          className="sm:col-span-2"
        />

        <TextAreaField
          name="description"
          label="Açıklama"
          rows={6}
          defaultValue={values.description}
          error={state.fieldErrors.description}
          help={`En fazla ${LISTING_LIMITS.descriptionMax} karakter.`}
          className="sm:col-span-2"
        />

        <TextField name="city" label="Şehir" defaultValue={values.city} error={state.fieldErrors.city} />
        <TextField
          name="district"
          label="İlçe"
          defaultValue={values.district}
          error={state.fieldErrors.district}
        />
        <TextField
          name="location"
          label="Mahalle / semt"
          defaultValue={values.location}
          error={state.fieldErrors.location}
          className="sm:col-span-2"
        />

        <SelectField
          name="listingType"
          label="İlan tipi"
          options={LISTING_TYPE_OPTIONS}
          defaultValue={values.listingType}
          error={state.fieldErrors.listingType}
        />
        <SelectField
          name="category"
          label="Kategori"
          options={CATEGORY_OPTIONS}
          defaultValue={values.category}
          error={state.fieldErrors.category}
        />

        <TextField
          name="price"
          label="Fiyat (TRY)"
          required
          inputMode="numeric"
          defaultValue={values.price}
          error={state.fieldErrors.price}
          help="Kiralık ilanda aylık bedeldir."
        />
        <TextField
          name="buildYear"
          label="Yapım yılı"
          inputMode="numeric"
          defaultValue={values.buildYear}
          error={state.fieldErrors.buildYear}
        />

        <TextField
          name="beds"
          label="Oda sayısı"
          inputMode="numeric"
          defaultValue={values.beds}
          error={state.fieldErrors.beds}
        />
        <TextField
          name="baths"
          label="Banyo sayısı"
          inputMode="numeric"
          defaultValue={values.baths}
          error={state.fieldErrors.baths}
        />

        <TextField
          name="area"
          label="Alan (m²)"
          inputMode="numeric"
          defaultValue={values.area}
          error={state.fieldErrors.area}
        />
        <TextField
          name="plotArea"
          label="Arsa alanı (m²)"
          inputMode="numeric"
          defaultValue={values.plotArea}
          error={state.fieldErrors.plotArea}
        />

        <TextAreaField
          name="features"
          label="Nitelikler"
          rows={5}
          defaultValue={values.features}
          error={state.fieldErrors.features}
          help="Her satıra bir nitelik yazın."
          className="sm:col-span-2"
        />

        <TextAreaField
          name="images"
          label="Görsel adresleri"
          rows={5}
          defaultValue={values.images}
          error={state.fieldErrors.images}
          help="Her satıra bir http(s) adresi yazın."
          className="sm:col-span-2"
        />

        <TextField
          name="sourceUrl"
          type="url"
          label="Kaynak adresi"
          defaultValue={values.sourceUrl}
          error={state.fieldErrors.sourceUrl}
          className="sm:col-span-2"
        />

        <CheckboxField
          name="featured"
          value={CHECKED}
          label="Öne çıkan ilan"
          defaultChecked={values.featured === CHECKED}
          className="sm:col-span-2"
        />
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <FormStatusMessage
          id={STATUS_ID}
          status={state.status}
          message={state.message}
          pending={isPending}
          pendingLabel={ADMIN_ACTIONS.saving}
        />

        <div className="flex flex-wrap gap-3">
          <SubmitButton
            pendingLabel={ADMIN_ACTIONS.saving}
            variant="outline"
            describedBy={STATUS_ID}
          >
            {ADMIN_ACTIONS.save}
          </SubmitButton>

          <SubmitButton
            pendingLabel={ADMIN_ACTIONS.saving}
            variant="primary"
            name={LISTING_INTENT_FIELD}
            value={LISTING_INTENT_PUBLISH}
            describedBy={STATUS_ID}
          >
            Kaydet ve yayınla
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
