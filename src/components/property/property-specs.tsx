import { propertyDetail } from "@/content/pages";
import type { Property } from "@/content/properties";
import { formatArea } from "@/lib/format";

type Spec = {
  id: string;
  label: string;
  value: string;
};

/** İlan künyesi satırlarını üretir, sıfır ya da tanımsız alanlar atlanır. */
function buildSpecs(property: Property): Spec[] {
  const { specLabels, areaUnit, roomUnit } = propertyDetail;
  const specs: Spec[] = [];

  if (property.beds > 0) {
    specs.push({
      id: "beds",
      label: specLabels.beds,
      value: `${property.beds} ${roomUnit}`,
    });
  }

  if (property.baths > 0) {
    specs.push({
      id: "baths",
      label: specLabels.baths,
      value: `${property.baths} ${roomUnit}`,
    });
  }

  specs.push({
    id: "area",
    label: specLabels.area,
    value: `${formatArea(property.area)} ${areaUnit}`,
  });

  if (typeof property.plotArea === "number") {
    specs.push({
      id: "plotArea",
      label: specLabels.plotArea,
      value: `${formatArea(property.plotArea)} ${areaUnit}`,
    });
  }

  if (typeof property.buildYear === "number") {
    specs.push({
      id: "buildYear",
      label: specLabels.buildYear,
      value: String(property.buildYear),
    });
  }

  return specs;
}

export interface PropertySpecsProps {
  property: Property;
}

export function PropertySpecs({ property }: PropertySpecsProps) {
  const specs = buildSpecs(property);

  return (
    <dl data-property-specs className="flex flex-col">
      {specs.map((spec) => (
        <div
          key={spec.id}
          className="flex items-baseline justify-between gap-6 border-b border-border py-4"
        >
          <dt className="font-sans text-body-sm text-text-muted">
            {spec.label}
          </dt>
          <dd className="font-sans text-body-md text-text-primary tabular-nums">
            {spec.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
