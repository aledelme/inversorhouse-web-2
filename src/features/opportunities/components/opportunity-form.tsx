"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FieldError } from "@/components/forms/field-error";
import type { RichTextDoc } from "@/components/rich-text/extensions";
import { RichTextEditor } from "@/components/rich-text/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  type CommunityOption,
  LocationFields,
  type LocationValue,
  type ProvinceOption,
} from "@/features/geo";
import { DocumentUploader, ImageUploader } from "@/features/uploads";
import { cn } from "@/lib/utils";

import { OPPORTUNITY_TYPES, type OpportunityType, type ReturnKind } from "../constants";
import { annualFromNominal } from "../returns";
import { type OpportunityInput, opportunityInputSchema } from "../schemas";
import { createOpportunityAction, updateOpportunityAction } from "../server/actions";

type Errors = Record<string, string[] | undefined>;

const num = (value: string) => (value.trim() === "" ? Number.NaN : Number(value.replace(",", ".")));
const str = (value: number | null | undefined) =>
  value === null || value === undefined || Number.isNaN(value) ? "" : String(value);

type Props = {
  mode: "create" | "edit";
  opportunityId?: string;
  initial?: OpportunityInput;
  initialLocation?: LocationValue;
  communities: CommunityOption[];
  provinces: ProvinceOption[];
};

function Section({
  index,
  title,
  description,
  children,
}: {
  index: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 border-t pt-10 first:border-t-0 first:pt-0 lg:grid-cols-[240px_1fr]">
      <header className="space-y-1">
        <p className="font-display text-sm text-highlight-strong">
          {String(index).padStart(2, "0")}
        </p>
        <h2 className="text-xl">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </header>
      <div className="grid gap-6">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid content-start gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <FieldError messages={error} />
    </div>
  );
}

export function OpportunityForm({
  mode,
  opportunityId,
  initial,
  initialLocation,
  communities,
  provinces,
}: Props) {
  const t = useTranslations("opportunityForm");
  const tTypes = useTranslations("opportunityTypes");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Errors>({});

  const [type, setType] = useState<OpportunityType | undefined>(initial?.type);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState<RichTextDoc | null>(initial?.description ?? null);
  const [location, setLocation] = useState<LocationValue>(initialLocation ?? {});
  const [amount, setAmount] = useState(str(initial?.amountToRaise));
  const [minTicket, setMinTicket] = useState(str(initial?.minTicket));
  const [term, setTerm] = useState(str(initial?.termMonths));
  const [closesOn, setClosesOn] = useState(initial?.closesOn ?? "");
  const [returnKind, setReturnKind] = useState<ReturnKind>(initial?.returnKind ?? "fixed");
  const [nominalMin, setNominalMin] = useState(str(initial?.returnNominalMin));
  const [nominalMax, setNominalMax] = useState(str(initial?.returnNominalMax));
  const [annualMin, setAnnualMin] = useState(str(initial?.returnAnnualMin));
  const [annualMax, setAnnualMax] = useState(str(initial?.returnAnnualMax));
  // Annual return follows the nominal one until the promoter edits it (business rule #5).
  const [annualTouched, setAnnualTouched] = useState(mode === "edit");
  const [images, setImages] = useState(initial?.images ?? []);
  const [documents, setDocuments] = useState(initial?.documents ?? []);
  // Files still uploading: publishing now would silently drop them.
  const [uploading, setUploading] = useState(0);
  const trackUploads = (delta: number) => setUploading((n) => n + delta);

  const syncAnnual = (nextMin: string, nextMax: string, nextTerm: string) => {
    if (annualTouched) return;
    const months = num(nextTerm);
    setAnnualMin(str(annualFromNominal(num(nextMin), months) || Number.NaN));
    setAnnualMax(str(annualFromNominal(num(nextMax), months) || Number.NaN));
  };

  const buildInput = (): OpportunityInput => ({
    type: type as OpportunityType,
    title,
    description: description ?? {},
    amountToRaise: num(amount),
    minTicket: minTicket.trim() ? num(minTicket) : null,
    termMonths: num(term),
    closesOn: closesOn || null,
    returnKind,
    returnNominalMin: num(nominalMin),
    returnNominalMax: returnKind === "fixed" ? num(nominalMin) : num(nominalMax),
    returnAnnualMin: num(annualMin),
    returnAnnualMax: returnKind === "fixed" ? num(annualMin) : num(annualMax),
    municipalityCode: location.municipality ?? "",
    images,
    documents,
  });

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const input = buildInput();
    const local = opportunityInputSchema.safeParse(input);
    if (!local.success) {
      const fieldErrors: Errors = {};
      for (const issue of local.error.issues) {
        const key = String(issue.path[0] ?? "form");
        fieldErrors[key] ??= [issue.message];
      }
      setErrors(fieldErrors);
      toast.error(tErrors("validation"));
      document
        .querySelector("[aria-invalid=true]")
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createOpportunityAction(input)
          : await updateOpportunityAction(opportunityId!, input);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        if (result.error === "phoneRequired") {
          router.push("/panel/perfil?next=nueva");
          return;
        }
        toast.error(
          tErrors.has(result.error as never)
            ? tErrors(result.error as never)
            : tErrors("unexpected"),
        );
        return;
      }
      toast.success(mode === "create" ? t("published") : t("updated"));
      router.push(`/oportunidades/${result.data.slug}`);
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-10">
      <Section index={1} title={t("sections.basics")} description={t("sections.basicsHint")}>
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-medium">{t("type")}</legend>
          <RadioGroup
            value={type ?? ""}
            onValueChange={(value) => setType(value as OpportunityType)}
            className="grid gap-2 sm:grid-cols-2"
            aria-invalid={Boolean(errors.type)}
          >
            {OPPORTUNITY_TYPES.map((option) => (
              <Label
                key={option}
                htmlFor={`type-${option}`}
                className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 font-normal has-data-[state=checked]:border-primary has-data-[state=checked]:bg-accent/50"
              >
                <RadioGroupItem id={`type-${option}`} value={option} className="mt-0.5" />
                <span>
                  <span className="block font-medium">
                    {tTypes(`${option}.label`)} · {tTypes(`${option}.name`)}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {tTypes(`${option}.description`)}
                  </span>
                </span>
              </Label>
            ))}
          </RadioGroup>
          <FieldError messages={errors.type} />
        </fieldset>
        <Field id="title" label={t("title")} hint={t("titleHint")} error={errors.title}>
          <Input
            id="title"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={Boolean(errors.title)}
          />
        </Field>
      </Section>

      <Section index={2} title={t("sections.location")} description={t("sections.locationHint")}>
        <LocationFields
          communities={communities}
          provinces={provinces}
          value={location}
          onChange={setLocation}
          required
          invalid={Boolean(errors.municipalityCode)}
          className="sm:grid-cols-3"
        />
        <FieldError messages={errors.municipalityCode} />
      </Section>

      <Section index={3} title={t("sections.figures")} description={t("sections.figuresHint")}>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="amount" label={t("amountToRaise")} error={errors.amountToRaise}>
            <Input
              id="amount"
              type="number"
              inputMode="numeric"
              min={1}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-invalid={Boolean(errors.amountToRaise)}
            />
          </Field>
          <Field
            id="minTicket"
            label={t("minTicket")}
            hint={t("optionalHint")}
            error={errors.minTicket}
          >
            <Input
              id="minTicket"
              type="number"
              inputMode="numeric"
              min={1}
              step={500}
              value={minTicket}
              onChange={(e) => setMinTicket(e.target.value)}
              aria-invalid={Boolean(errors.minTicket)}
            />
          </Field>
          <Field id="term" label={t("termMonths")} error={errors.termMonths}>
            <Input
              id="term"
              type="number"
              inputMode="numeric"
              min={1}
              max={360}
              value={term}
              onChange={(e) => {
                setTerm(e.target.value);
                syncAnnual(nominalMin, nominalMax, e.target.value);
              }}
              aria-invalid={Boolean(errors.termMonths)}
            />
          </Field>
          <Field
            id="closesOn"
            label={t("closesOn")}
            hint={t("closesOnHint")}
            error={errors.closesOn}
          >
            <Input
              id="closesOn"
              type="date"
              value={closesOn}
              onChange={(e) => setClosesOn(e.target.value)}
              aria-invalid={Boolean(errors.closesOn)}
            />
          </Field>
        </div>
      </Section>

      <Section index={4} title={t("sections.returns")} description={t("sections.returnsHint")}>
        <RadioGroup
          value={returnKind}
          onValueChange={(v) => setReturnKind(v as ReturnKind)}
          className="flex gap-6"
        >
          {(["fixed", "range"] as const).map((kind) => (
            <Label
              key={kind}
              htmlFor={`kind-${kind}`}
              className="flex cursor-pointer items-center gap-2 font-normal"
            >
              <RadioGroupItem id={`kind-${kind}`} value={kind} />
              {t(`returnKinds.${kind}`)}
            </Label>
          ))}
        </RadioGroup>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-4 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">{t("nominalReturn")}</p>
            <div className="grid grid-cols-2 gap-3">
              <Field
                id="nominalMin"
                label={returnKind === "fixed" ? t("value") : t("from")}
                error={errors.returnNominalMin}
              >
                <Input
                  id="nominalMin"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min={0}
                  value={nominalMin}
                  onChange={(e) => {
                    setNominalMin(e.target.value);
                    syncAnnual(
                      e.target.value,
                      returnKind === "fixed" ? e.target.value : nominalMax,
                      term,
                    );
                  }}
                  aria-invalid={Boolean(errors.returnNominalMin)}
                />
              </Field>
              {returnKind === "range" && (
                <Field id="nominalMax" label={t("to")} error={errors.returnNominalMax}>
                  <Input
                    id="nominalMax"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min={0}
                    value={nominalMax}
                    onChange={(e) => {
                      setNominalMax(e.target.value);
                      syncAnnual(nominalMin, e.target.value, term);
                    }}
                    aria-invalid={Boolean(errors.returnNominalMax)}
                  />
                </Field>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{t("nominalHint")}</p>
          </div>
          <div className="grid gap-4 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">{t("annualReturn")}</p>
            <div className="grid grid-cols-2 gap-3">
              <Field
                id="annualMin"
                label={returnKind === "fixed" ? t("value") : t("from")}
                error={errors.returnAnnualMin}
              >
                <Input
                  id="annualMin"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min={0}
                  value={annualMin}
                  onChange={(e) => {
                    setAnnualTouched(true);
                    setAnnualMin(e.target.value);
                  }}
                  aria-invalid={Boolean(errors.returnAnnualMin)}
                />
              </Field>
              {returnKind === "range" && (
                <Field id="annualMax" label={t("to")} error={errors.returnAnnualMax}>
                  <Input
                    id="annualMax"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min={0}
                    value={annualMax}
                    onChange={(e) => {
                      setAnnualTouched(true);
                      setAnnualMax(e.target.value);
                    }}
                    aria-invalid={Boolean(errors.returnAnnualMax)}
                  />
                </Field>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{t("annualHint")}</p>
          </div>
        </div>
      </Section>

      <Section
        index={5}
        title={t("sections.description")}
        description={t("sections.descriptionHint")}
      >
        <div className="grid gap-2">
          <Label htmlFor="description">{t("description")}</Label>
          <RichTextEditor
            id="description"
            value={description}
            onChange={setDescription}
            invalid={Boolean(errors.description)}
          />
          <FieldError messages={errors.description} />
        </div>
      </Section>

      <Section index={6} title={t("sections.photos")} description={t("sections.photosHint")}>
        <ImageUploader
          value={images}
          onChange={setImages}
          onBusyChange={trackUploads}
          invalid={Boolean(errors.images)}
        />
        <FieldError messages={errors.images} />
      </Section>

      <Section index={7} title={t("sections.documents")} description={t("sections.documentsHint")}>
        <DocumentUploader value={documents} onChange={setDocuments} onBusyChange={trackUploads} />
        <FieldError messages={errors.documents} />
      </Section>

      {/* Sticky only from `sm`: on phones the stacked bar would cover too much of the form. */}
      <div className="-mx-4 flex flex-col gap-3 border-t bg-background/95 px-4 py-4 backdrop-blur sm:sticky sm:bottom-0 sm:z-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">{t("legalNotice")}</p>
        <Button type="submit" size="lg" disabled={pending || uploading > 0}>
          {uploading > 0
            ? t("uploading")
            : pending
              ? t("saving")
              : mode === "create"
                ? t("submitCreate")
                : t("submitEdit")}
        </Button>
      </div>
    </form>
  );
}
