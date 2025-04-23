interface CxOptions {
  before?: string[];
}

export function cx(...classes: (string | boolean | undefined)[]): string;
export function cx(
  options: CxOptions,
  ...classes: (string | boolean | undefined)[]
): string;
export function cx(
  optionsOrClass?: CxOptions | string | boolean | undefined,
  ...classes: (string | boolean | undefined)[]
) {
  if (
    typeof optionsOrClass === "string" ||
    typeof optionsOrClass === "boolean" ||
    optionsOrClass === undefined
  ) {
    const allClasses = optionsOrClass ? [optionsOrClass, ...classes] : classes;
    return allClasses.filter(Boolean).join(" ");
  }

  const beforeClasses = optionsOrClass?.before || [];
  return [...beforeClasses, ...classes.filter(Boolean)].join(" ");
}
