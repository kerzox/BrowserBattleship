interface CxOptions {
  before?: string[];
}

export function cx(...classes: string[]): string;
export function cx(options: CxOptions, ...classes: string[]): string;
export function cx(optionsOrClass?: CxOptions | string, ...classes: string[]) {
  if (typeof optionsOrClass === "string" || optionsOrClass === undefined) {
    const allClasses = optionsOrClass ? [optionsOrClass, ...classes] : classes;
    return allClasses.filter(Boolean).join(" ");
  }

  const beforeClasses = optionsOrClass?.before || [];
  return [...beforeClasses, ...classes.filter(Boolean)].join(" ");
}
